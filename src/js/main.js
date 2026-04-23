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

// Varáveis Globais de Configuração / Dificuldade / Número de Cápsulas
window.CONFIG_JOGO = MODO_REALISTA;
const NUM_CAPSULAS = 100;
const POS_MAQUINA = new THREE.Vector3(-67, 0, 20);
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

// Modelo da máquina
const clawMachine = criarClawMachine(scene);
clawMachine.caixa.position.copy(POS_MAQUINA);
clawMachine.caixa.rotation.y = ROT_MAQUINA;

// Cápsulas
const capsulas = CapsuleSpawner.gerarCapsulas(scene, NUM_CAPSULAS, POS_MAQUINA, ROT_MAQUINA);

// Teclado
let estadoJogo = "LIVRE";
let timeAnim = 0;

const teclas = setupKeyboard(
    () => estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA",
    () => { estadoJogo = "DESCER"; }
);

const velMovimento = 0.15;
const limites = { x: 11.4, z: 11.4 };

// Confetis e CapsuleOpener
const confetisObj = criarConfetis(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetisObj, POS_MAQUINA, ROT_MAQUINA);

// Ajusta câmara inicial para focar na máquina (tamanho original)
const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ROT_MAQUINA);
const camOffset = new THREE.Vector3(0, 30, 60).applyQuaternion(quat);
camera.position.set(POS_MAQUINA.x + camOffset.x, 30, POS_MAQUINA.z + camOffset.z);
controls.target.set(POS_MAQUINA.x, 18, POS_MAQUINA.z);
controls.update();

// Inicializa o Widget de Configurações
setupWidget(scene, clawMachine, confetisObj, capsulas, capsuleOpener);

// Inicializa o Sistema de Interação (Cliques nas cápsulas)
const interactionSystem = new InteractionSystem(camera, capsulas, capsuleOpener);
interactionSystem.init();

// Loop principal
function animate(time) {
    requestAnimationFrame(animate);

    const novaAnimacao = atualizarAnimacaoGarra(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento);
    estadoJogo = novaAnimacao.novoEstado;
    timeAnim = novaAnimacao.novoTime;

    physicsWorld.update(capsulas, clawMachine);
    capsuleOpener.atualizarCapsula(time);
    confetisObj.atualizarMovimento();

    controls.update();
    renderer.render(scene, camera);
}

// Inicialização assíncrona (Rapier usa WASM)
const physicsWorld = new PhysicsWorld();

physicsWorld.init(capsulas, clawMachine, POS_MAQUINA, ROT_MAQUINA).then(() => {
    animate();
}).catch(err => {
    console.error("Erro ao inicializar Rapier:", err);
});

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.dispatchEvent(new Event('resize'));