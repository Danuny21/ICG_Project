import * as THREE from "three";
import { setupScene } from "./config/scene.js";
import { setupLighting } from "./config/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./config/controls.js";
import { createArcadeBuilding } from "./models/arcadeBuilding.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { PhysicsWorld } from "./systems/PhysicsSystem.js";
import { CapsuleSpawner } from "./systems/CapsuleSpawner.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { criarConfetis } from "./models/confetti.js";
import { updateClawAnimation } from "./systems/ClawAnimation.js";
import { MODO_REALISTA } from "./config/dificulty.js";
import { setupWidget } from "./config/widget.js";
import { InteractionSystem } from "./systems/InteractionSystem.js";
import { MobileControls } from "./systems/MobileControls.js";
import { CollectionManager } from "./systems/CollectionManager.js";
import { CameraManager } from "./systems/CameraManager.js";
import { PrizeInspector } from "./systems/PrizeInspector.js";

// Configuração global do jogo (dificuldade padrão)
window.CONFIG_JOGO = MODO_REALISTA;
const NUM_CAPSULES = 200; // Número de cápsulas geradas no interior da máquina

// Posição e rotação da máquina de garras no mundo
const MACHINE_POS = new THREE.Vector3(-86, 0, 1);
const MACHINE_ROT = Math.PI / 2;

const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

setupLighting(scene);

const arcadeBuilding = createArcadeBuilding(scene);
arcadeBuilding.grupo.position.set(0, 0, 55);
arcadeBuilding.grupo.scale.set(2, 2, 2);

const collectionManager = new CollectionManager(scene);
collectionManager.setupRoom(arcadeBuilding);

const clawMachine = criarClawMachine(scene);
clawMachine.caixa.position.copy(MACHINE_POS);
clawMachine.caixa.rotation.y = MACHINE_ROT;

const capsules = CapsuleSpawner.spawnCapsules(scene, NUM_CAPSULES, MACHINE_POS, MACHINE_ROT);

// Audio
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

const confetti = criarConfetis(scene);
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
    if (gameState === "IDLE" && capsuleOpener.state === "IDLE" && cameraManager.viewState === "machine") {
        gameState = "DESCEND";
    }
});

const moveSpeed = 0.15;
const moveLimits = { x: 11.4, z: 11.4 };

// Ajusta o FOV consoante orientação do ecrã (retrato em mobile)
const isPortrait = window.innerHeight > window.innerWidth;
camera.fov = isPortrait ? 85 : 60;
camera.updateProjectionMatrix();

// Cria o painel de configurações (lil-GUI) e as estatísticas de FPS
const { gui, stats } = setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, { bgMusic, capsuleSound });

const interactionSystem = new InteractionSystem(camera, capsules, capsuleOpener, collectionManager, prizeInspector);
interactionSystem.init();

const physicsWorld = new PhysicsWorld();
let lastFrameTime = performance.now();

// ─── CICLO DE RENDERIZAÇÃO ───────────────────────────────────────────────────
function animate(time) {
    if (stats) stats.update();
    requestAnimationFrame(animate);

    const delta = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    // Só atualiza a câmara se o inspetor de prémios não estiver ativo
    if (prizeInspector?.state === "IDLE") cameraManager.update();

    collectionManager.update(delta);
    if (prizeInspector) prizeInspector.update(delta);

    // Avança a animação da garra com base no estado atual
    const clawResult = updateClawAnimation(gameState, animTime, clawMachine, keys, moveLimits, moveSpeed);
    gameState = clawResult.newState;
    animTime = clawResult.newTime;

    physicsWorld.update(capsules, clawMachine);
    capsuleOpener.update(time);
    confetti.atualizarMovimento();

    controls.update();
    renderer.render(scene, camera);
}

// ─── FLUXO DO JOGO: MENU → LOADING → JOGO ───────────────────────────────────
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