import * as THREE from "three";
import { setupScene } from "./config/scene.js";
import { setupLighting, updateLightsForTimeOfDay } from "./config/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./config/controls.js";
import { createArcadeBuilding } from "./models/arcadeBuilding.js";
import { createClawMachine } from "./models/clawMachine.js";
import { createLamp } from "./models/lamp.js";
import { PhysicsWorld } from "./systems/PhysicsSystem.js";
import { CapsuleSpawner } from "./systems/CapsuleSpawner.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { createConfetti } from "./models/confetti.js";
import { updateClawAnimation } from "./systems/ClawAnimation.js";
import { NORMAL_MODE } from "./config/dificulty.js";
import { setupWidget } from "./config/widget.js";
import { InteractionSystem } from "./systems/InteractionSystem.js";
import { MobileControls } from "./systems/MobileControls.js";
import { CollectionManager } from "./systems/CollectionManager.js";
import { CameraManager } from "./systems/CameraManager.js";
import { PrizeInspector } from "./systems/PrizeInspector.js";
import { preloadAllPrizes } from "./systems/PrizeLoader.js";
import { PRIZE_LIST } from "./config/prizes.js";

window.CONFIG_JOGO = NORMAL_MODE;
const NUM_CAPSULES = 200;

const MACHINE_POS = new THREE.Vector3(-86, 0, 1);
const MACHINE_ROT = Math.PI / 2;

const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

setupLighting(scene);

const arcadeBuilding = createArcadeBuilding(scene);
arcadeBuilding.group.position.set(0, 0, 55);
arcadeBuilding.group.scale.set(2, 2, 2);

const clawLamp = createLamp(true, 500);
clawLamp.position.set(MACHINE_POS.x, 70, MACHINE_POS.z);
clawLamp.scale.setScalar(6.0);
scene.add(clawLamp);
scene.userData.clawLamp = clawLamp;

const isNightInit = false;
updateLightsForTimeOfDay(scene, isNightInit);

const collectionManager = new CollectionManager(scene);
window.collectionManager = collectionManager;
collectionManager.setupRoom(arcadeBuilding);

const clawMachine = createClawMachine(scene);
clawMachine.box.position.copy(MACHINE_POS);
clawMachine.box.rotation.y = MACHINE_ROT;

const capsules = CapsuleSpawner.spawnCapsules(scene, NUM_CAPSULES, MACHINE_POS, MACHINE_ROT);

// ─── ÁUDIO ───────────────────────────────────────────────────────────────────
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const bgMusic = new THREE.Audio(listener);
audioLoader.load('./src/sound/background-music.mp3', buffer => {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.08);
});

const gameStartSound = new THREE.Audio(listener);
audioLoader.load('./src/sound/game-start.mp3', buffer => {
    gameStartSound.setBuffer(buffer);
    gameStartSound.setVolume(0.7);
});

const capsuleSound = new THREE.Audio(listener);
audioLoader.load('./src/sound/getting-prize.mp3', buffer => {
    capsuleSound.setBuffer(buffer);
    capsuleSound.setVolume(0.6);
});

// ─── FÍSICA & SISTEMAS ───────────────────────────────────────────────────────
const physicsWorld = new PhysicsWorld();

const confetti = createConfetti(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetti, MACHINE_POS, MACHINE_ROT, capsuleSound);
capsuleOpener.setCleanupRefs(physicsWorld, capsules);

const cameraManager = new CameraManager(camera, controls, capsuleOpener);
cameraManager.init(MACHINE_POS, MACHINE_ROT, 75);

const prizeInspector = new PrizeInspector(scene, camera, controls);

let gameState = "IDLE";
let animTime = 0;

const keys = setupKeyboard(
    () => gameState === "IDLE" && capsuleOpener.state === "IDLE" && cameraManager.viewState === "machine",
    () => { if (cameraManager.viewState === "machine") gameState = "DESCEND"; }
);

new MobileControls(keys, () => {
    if (capsuleOpener.state === "WAIT" || capsuleOpener.state === "FREE_VIEW") {
        capsuleOpener.triggerAction();
        return;
    }
    if (prizeInspector.state === "INSPECT") {
        prizeInspector.prepareReturn();
        return;
    }
    if (gameState === "IDLE" && capsuleOpener.state === "IDLE" && cameraManager.viewState === "machine") {
        gameState = "DESCEND";
    }
});

const moveSpeed = 0.15;
const moveLimits = { x: 11.4, z: 11.4 };

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.fov = height > width ? 85 : 60;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
window.addEventListener('resize', onWindowResize);
onWindowResize();

const { gui, stats } = setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, { bgMusic, capsuleSound }, arcadeBuilding, isNightInit, physicsWorld, MACHINE_POS, MACHINE_ROT);

const interactionSystem = new InteractionSystem(camera, capsules, capsuleOpener, collectionManager, prizeInspector);
interactionSystem.init();

let lastFrameTime = performance.now();

// ─── LOOP DE RENDERIZAÇÃO ────────────────────────────────────────────────────
function animate(time) {
    if (stats) stats.update();
    requestAnimationFrame(animate);

    const delta = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    if (prizeInspector?.state === "IDLE") cameraManager.update();

    collectionManager.update(delta);
    if (prizeInspector) prizeInspector.update(delta);

    if (arcadeBuilding.fan) arcadeBuilding.fan.rotation.y += 2.0 * delta;

    const clawResult = updateClawAnimation(gameState, animTime, clawMachine, keys, moveLimits, moveSpeed);
    gameState = clawResult.newState;
    animTime = clawResult.newTime;

    physicsWorld.update(capsules, clawMachine);
    capsuleOpener.update(time);
    confetti.update();

    controls.update();
    renderer.render(scene, camera);
}

// ─── FLUXO: MENU → LOADING → JOGO ────────────────────────────────────────────
const startBtn = document.getElementById('start-button');
const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');

// Resolve quando todos os assets Three.js estiverem carregados (ou após timeout de 15s)
const assetsPromise = new Promise(resolve => {
    const checkReady = () => {
        if (THREE.DefaultLoadingManager.itemsLoaded === THREE.DefaultLoadingManager.itemsTotal) {
            resolve(); return true;
        }
        return false;
    };
    if (checkReady()) return;
    THREE.DefaultLoadingManager.onLoad = () => resolve();
    THREE.DefaultLoadingManager.onError = () => resolve();
    setTimeout(resolve, 15000);
});

const MENU_FADE_DURATION = 800; // deve coincidir com a transição CSS do #main-menu

startBtn.addEventListener('click', () => {
    const startTime = performance.now();

    // Desbloqueia o AudioContext e toca o som de arranque imediatamente
    if (bgMusic.context.state === 'suspended') bgMusic.context.resume();
    if (gameStartSound.buffer && !gameStartSound.isPlaying) gameStartSound.play();

    // Inicia o fade-out do menu
    mainMenu.classList.add('fade-out');

    // Arranca física e pré-carregamento em paralelo enquanto o menu desaparece
    const physicsPromise = physicsWorld.init(capsules, clawMachine, MACHINE_POS, MACHINE_ROT);
    const preloadPromise = preloadAllPrizes(PRIZE_LIST);

    // Só mostra o loading screen depois do menu ter desaparecido completamente
    setTimeout(() => {
        mainMenu.classList.add('hidden');
        loadingScreen.classList.remove('hidden');
    }, MENU_FADE_DURATION);

    Promise.all([physicsPromise, assetsPromise, preloadPromise]).then(() => {
        // Garante que o loading screen esteve visível pelo menos 500ms antes de fechar
        const minVisible = MENU_FADE_DURATION + 500;
        const remaining = Math.max(0, minVisible - (performance.now() - startTime));

        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            // Música começa após o som de arranque (~1.5s)
            setTimeout(() => {
                if (bgMusic.buffer && !bgMusic.isPlaying) bgMusic.play();
            }, 1500);
            // Revela os elementos de jogo e arranca o loop
            document.getElementById('ui').classList.remove('game-hidden');
            document.getElementById('camera-views').classList.remove('game-hidden');
            document.getElementById('mobile-controls').classList.remove('game-hidden');
            if (gui) gui.domElement.style.visibility = '';
            animate(performance.now());
        }, remaining);
    }).catch(err => console.error(err));
});
