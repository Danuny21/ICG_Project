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

// Varáveis Globais de Configuração / Dificuldade / Número de Cápsulas
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


// Teclado
let estadoJogo = "LIVRE";
let timeAnim = 0;

const teclas = setupKeyboard(
    () => estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA",
    () => { estadoJogo = "DESCER"; }
);

// Controlos Mobile
new MobileControls(teclas, () => {
    if (estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA") {
        estadoJogo = "DESCER";
    }
});

const velMovimento = 0.15;
const limites = { x: 11.4, z: 11.4 };

// Ajusta câmara inicial para focar na máquina (tamanho original)
const isPortrait = window.innerHeight > window.innerWidth;
camera.fov = isPortrait ? 85 : 60; // Aumenta FOV em mobile para ver mais da máquina sem afastar a câmara
camera.updateProjectionMatrix();

const distBase = 75; // Distância inicial aumentada

const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ROT_MAQUINA);
const camOffset = new THREE.Vector3(0, 30, distBase).applyQuaternion(quat);
camera.position.set(POS_MAQUINA.x + camOffset.x, 30, POS_MAQUINA.z + camOffset.z);
controls.target.set(POS_MAQUINA.x, 18, POS_MAQUINA.z);
controls.update();

// Inicializa o Widget de Configurações (e o Stats)
const { gui, stats } = setupWidget(scene, clawMachine, confetisObj, capsulas, capsuleOpener, { bgMusic, capsuleSound });



// Inicializa o Sistema de Interação (Cliques nas cápsulas)
const interactionSystem = new InteractionSystem(camera, capsulas, capsuleOpener, collectionManager);
interactionSystem.init();

let ultimaFrameTempo = performance.now();

// Loop principal
function animate(time) {
    stats.update();
    requestAnimationFrame(animate);

    const delta = (time - ultimaFrameTempo) / 1000;
    ultimaFrameTempo = time;

    collectionManager.update(delta);

    const novaAnimacao = atualizarAnimacaoGarra(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento);
    estadoJogo = novaAnimacao.novoEstado;
    timeAnim = novaAnimacao.novoTime;

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

const physicsWorld = new PhysicsWorld();


// Monitorizar assets desde o início
const assetsPromise = new Promise((resolve) => {

    // Se o manager já acabou ou nem tem nada para carregar (raro)
    const checkReady = () => {
        if (THREE.DefaultLoadingManager.itemsLoaded === THREE.DefaultLoadingManager.itemsTotal) {
            resolve();
            return true;
        }
        return false;
    };

    if (checkReady()) return;

    THREE.DefaultLoadingManager.onLoad = () => {
        console.log("Todas as texturas e modelos carregados.");
        resolve();
    };

    THREE.DefaultLoadingManager.onError = (url) => {
        console.error("Erro ao carregar asset:", url);
        resolve(); // Resolvemos na mesma para não travar o jogo
    };

    // Timeout de segurança (15 segundos)
    setTimeout(() => {
        console.warn("Timeout de carregamento atingido. Forçando início.");
        resolve();
    }, 15000);
});

startBtn.addEventListener('click', () => {
    // 1. Esconder Menu e mostrar Loading
    mainMenu.classList.add('fade-out');
    setTimeout(() => mainMenu.classList.add('hidden'), 800);
    
    loadingScreen.classList.remove('hidden');

    // Iniciar áudio (necessita de interação do user)
    if (bgMusic.context.state === 'suspended') {
        bgMusic.context.resume();
    }
    // A música só começa depois do loading


    // 2. Iniciar física



    const physicsPromise = physicsWorld.init(capsulas, clawMachine, POS_MAQUINA, ROT_MAQUINA);

    // 3. Esperar por tudo
    Promise.all([physicsPromise, assetsPromise]).then(() => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            
            // Começar a música de fundo agora que o jogo vai começar
            if (bgMusic.buffer && !bgMusic.isPlaying) {
                bgMusic.play();
            }
            
            animate();
        }, 500);

    }).catch(err => {
        console.error("Erro crítico na inicialização:", err);
        // Mesmo com erro, tentamos mostrar o jogo
        loadingScreen.classList.add('fade-out');
        animate();
    });
});

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.dispatchEvent(new Event('resize'));