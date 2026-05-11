import * as THREE from "three";
import { setupScene } from "./config/scene.js";
import { setupLighting } from "./config/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./config/controls.js";
import { createArcadeBuilding } from "./models/arcadeBuilding.js";
import { createClawMachine } from "./models/clawMachine.js";
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

// Global game configuration (default difficulty)
window.CONFIG_JOGO = NORMAL_MODE;
const NUM_CAPSULES = 200; // Number of capsules generated inside the machine

// Machine position and rotation in the world
const MACHINE_POS = new THREE.Vector3(-86, 0, 1);
const MACHINE_ROT = Math.PI / 2;

const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

setupLighting(scene);

const arcadeBuilding = createArcadeBuilding(scene);
arcadeBuilding.group.position.set(0, 0, 55);
arcadeBuilding.group.scale.set(2, 2, 2);

const collectionManager = new CollectionManager(scene);
collectionManager.setupRoom(arcadeBuilding);

const clawMachine = createClawMachine(scene);
clawMachine.box.position.copy(MACHINE_POS);
clawMachine.box.rotation.y = MACHINE_ROT;

const capsules = CapsuleSpawner.spawnCapsules(scene, NUM_CAPSULES, MACHINE_POS, MACHINE_ROT);

// Audio setup
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const bgMusic = new THREE.Audio(listener);
audioLoader.load('./src/sound/background-music.mp3', buffer => {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.08);
});

const capsuleSound = new THREE.Audio(listener);
audioLoader.load('./src/sound/getting-prize.mp3', buffer => {
    capsuleSound.setBuffer(buffer);
    capsuleSound.setVolume(0.6);
});

const confetti = createConfetti(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetti, MACHINE_POS, MACHINE_ROT, capsuleSound);

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
    // 1. Se estivermos a abrir uma cápsula
    if (capsuleOpener.state === "WAIT" || capsuleOpener.state === "FREE_VIEW") {
        capsuleOpener.triggerAction();
        return;
    }
    // 2. Se estivermos a inspecionar um prémio na prateleira
    if (prizeInspector.state === "INSPECT") {
        prizeInspector.prepareReturn();
        return;
    }
    // 3. Ação normal do jogo (descer garra)
    if (gameState === "IDLE" && capsuleOpener.state === "IDLE" && cameraManager.viewState === "machine") {
        gameState = "DESCEND";
    }
});

const moveSpeed = 0.15;
const moveLimits = { x: 11.4, z: 11.4 };

// Adjust FOV based on orientation
const isPortrait = window.innerHeight > window.innerWidth;
camera.fov = isPortrait ? 85 : 60;
camera.updateProjectionMatrix();

// Create settings panel (lil-GUI) and FPS stats
const { gui, stats } = setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, { bgMusic, capsuleSound }, arcadeBuilding);

const interactionSystem = new InteractionSystem(camera, capsules, capsuleOpener, collectionManager, prizeInspector);
interactionSystem.init();

const physicsWorld = new PhysicsWorld();
let lastFrameTime = performance.now();

// ─── RENDERING LOOP ──────────────────────────────────────────────────────────
function animate(time) {
    if (stats) stats.update();
    requestAnimationFrame(animate);

    const delta = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    // Only update camera if prize inspector is idle
    if (prizeInspector?.state === "IDLE") cameraManager.update();

    collectionManager.update(delta);
    if (prizeInspector) prizeInspector.update(delta);

    // Update claw animation based on state
    const clawResult = updateClawAnimation(gameState, animTime, clawMachine, keys, moveLimits, moveSpeed);
    gameState = clawResult.newState;
    animTime = clawResult.newTime;

    physicsWorld.update(capsules, clawMachine);
    capsuleOpener.update(time);
    confetti.update();

    controls.update();
    renderer.render(scene, camera);
}

// ─── GAME FLOW: MENU → LOADING → GAME ────────────────────────────────────────
const startBtn = document.getElementById('start-button');
const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');

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

startBtn.addEventListener('click', () => {
    mainMenu.classList.add('fade-out');
    setTimeout(() => mainMenu.classList.add('hidden'), 800);
    loadingScreen.classList.remove('hidden');

    if (bgMusic.context.state === 'suspended') bgMusic.context.resume();

    const physicsPromise = physicsWorld.init(capsules, clawMachine, MACHINE_POS, MACHINE_ROT);

    Promise.all([physicsPromise, assetsPromise]).then(() => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            if (bgMusic.buffer && !bgMusic.isPlaying) bgMusic.play();
            animate(performance.now());
        }, 500);
    }).catch(err => console.error(err));
});