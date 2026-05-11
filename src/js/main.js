import * as THREE from "three";
import { setupScene } from "./config/scene.js";
import { setupLighting } from "./config/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./config/controls.js";
import { criarArcadeBuilding } from "./models/arcadeBuilding.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { PhysicsWorld } from "./systems/PhysicsSystem.js";
import { CapsuleSpawner } from "./systems/CapsuleSpawner.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { criarConfetis } from "./models/confetti.js";
import { atualizarAnimacaoGarra } from "./systems/ClawAnimation.js";
import { MODO_REALISTA } from "./config/dificulty.js";
import { setupWidget } from "./config/widget.js";
import { InteractionSystem } from "./systems/InteractionSystem.js";
import { MobileControls } from "./systems/MobileControls.js";
import { CollectionManager } from "./systems/CollectionManager.js";
import { CameraManager } from "./systems/CameraManager.js";
import { PrizeInspector } from "./systems/PrizeInspector.js";

// Variáveis Globais de Configuração / Dificuldade / Número de Cápsulas
window.CONFIG_JOGO = MODO_REALISTA;
const NUM_CAPSULAS = 200;

const POS_MAQUINA = new THREE.Vector3(-86, 0, 1);
const ROT_MAQUINA = Math.PI / 2;

// Cena
const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

// Iluminação
setupLighting(scene);

// Fundo/cenário: Arcade Building
const arcadeBuilding = criarArcadeBuilding(scene);
arcadeBuilding.grupo.position.set(0, 0, 55);
arcadeBuilding.grupo.scale.set(2, 2, 2);

// Gestão de Coleção (Estantes e Prémios na sala)
const collectionManager = new CollectionManager(scene);
collectionManager.setupRoom(arcadeBuilding);

// Modelo da máquina
const clawMachine = criarClawMachine(scene);
clawMachine.caixa.position.copy(POS_MAQUINA);
clawMachine.caixa.rotation.y = ROT_MAQUINA;

// Cápsulas
const capsulas = CapsuleSpawner.gerarCapsulas(scene, NUM_CAPSULAS, POS_MAQUINA, ROT_MAQUINA);

// --- ÁUDIO ---
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();

// 1. Música de Fundo
const bgMusic = new THREE.Audio(listener);
audioLoader.load('./src/sound/background-music.mp3', (buffer) => {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.08);
});

// 2. Som de Prémio (Capsule Opener)
const capsuleSound = new THREE.Audio(listener);
audioLoader.load('./src/sound/getting-prize.mp3', (buffer) => {
    capsuleSound.setBuffer(buffer);
    capsuleSound.setVolume(0.6);
});

// Confetis e CapsuleOpener
const confetisObj = criarConfetis(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetisObj, POS_MAQUINA, ROT_MAQUINA, capsuleSound);

// Gestão de Câmara
const cameraManager = new CameraManager(camera, controls, capsuleOpener);
cameraManager.init(POS_MAQUINA, ROT_MAQUINA, 75);

// Inspetor de Prémios
const prizeInspector = new PrizeInspector(scene, camera, controls);

// Teclado
let estadoJogo = "LIVRE";
let timeAnim = 0;

const teclas = setupKeyboard(
    () => estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA" && cameraManager.viewState === "machine",
    () => { if (cameraManager.viewState === "machine") estadoJogo = "DESCER"; }
);

// Controlos Mobile
new MobileControls(teclas, () => {
    if (estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA" && cameraManager.viewState === "machine") {
        estadoJogo = "DESCER";
    }
});

const velMovimento = 0.15;
const limites = { x: 11.4, z: 11.4 };

// Ajusta câmara inicial para focar na máquina
const isPortrait = window.innerHeight > window.innerWidth;
camera.fov = isPortrait ? 85 : 60;
camera.updateProjectionMatrix();

// Inicializa o Widget de Configurações (e o Stats)
const { gui, stats } = setupWidget(scene, clawMachine, confetisObj, capsulas, capsuleOpener, { bgMusic, capsuleSound });

// Inicializa o Sistema de Interação (Cliques nas cápsulas e prémios)
const interactionSystem = new InteractionSystem(camera, capsulas, capsuleOpener, collectionManager, prizeInspector);
interactionSystem.init();

const physicsWorld = new PhysicsWorld();
let ultimaFrameTempo = performance.now();

// Loop principal
function animate(time) {
    if (stats) stats.update();
    requestAnimationFrame(animate);

    const delta = (time - ultimaFrameTempo) / 1000;
    ultimaFrameTempo = time;

    // Atualizar sistemas
    if (prizeInspector && prizeInspector.estado === "INATIVA") {
        cameraManager.update();
    }
    
    collectionManager.update(delta);
    if (prizeInspector) prizeInspector.update(delta);
    
    // Animação da Garra
    const novaAnimacao = atualizarAnimacaoGarra(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento);
    estadoJogo = novaAnimacao.novoEstado;
    timeAnim = novaAnimacao.novoTime;

    // Física e Cápsula
    physicsWorld.update(capsulas, clawMachine);
    capsuleOpener.atualizarCapsula(time);
    confetisObj.atualizarMovimento();

    controls.update();
    renderer.render(scene, camera);
}

// --- Lógica de Fluxo (Menu -> Loading -> Jogo) ---
const startBtn = document.getElementById('start-button');
const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');

const assetsPromise = new Promise((resolve) => {
    const checkReady = () => {
        if (THREE.DefaultLoadingManager.itemsLoaded === THREE.DefaultLoadingManager.itemsTotal) {
            resolve();
            return true;
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

    if (bgMusic.context.state === 'suspended') {
        bgMusic.context.resume();
    }

    const physicsPromise = physicsWorld.init(capsulas, clawMachine, POS_MAQUINA, ROT_MAQUINA);

    Promise.all([physicsPromise, assetsPromise]).then(() => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            if (bgMusic.buffer && !bgMusic.isPlaying) bgMusic.play();
            animate(performance.now());
        }, 500);
    }).catch(err => console.error(err));
});