import * as THREE from "three";
import { setupScene } from "./setup/scene.js";
import { setupLighting } from "./setup/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./setup/controls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";
import { PhysicsWorld, RAIO_CAPSULA } from "./systems/PhysicsSystem.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { carregarPremio } from "./systems/PrizeLoader.js";
import { criarConfetis } from "./models/confetti.js";
import { updateClawAnimation } from "./systems/ClawAnimation.js";

// ── Cena ─────────────────────────────────────────────────────────────────────
const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

// ── Iluminação ───────────────────────────────────────────────────────────────
setupLighting(scene);

// ── Modelo da máquina ────────────────────────────────────────────────────────
const clawMachine = criarClawMachine(scene);

// ── Cápsulas ─────────────────────────────────────────────────────────────────
const numCapsulas = 10;
const capsulas    = [];

for (let i = 0; i < numCapsulas; i++) {
    const { grupo, dobradica } = criarCapsula();

    let posX, posZ, caiuNoBuraco = true;
    while (caiuNoBuraco) {
        posX = (Math.random() - 0.5) * 8;
        posZ = (Math.random() - 0.5) * 8;
        caiuNoBuraco = posX < -4.0 && posX > -11.5 && posZ > 4.0 && posZ < 11.5;
    }

    grupo.position.set(posX, 22 + Math.random() * 12, posZ);
    scene.add(grupo);

    const capsulaObj = {
        mesh:     grupo,
        dobradica: dobradica,
        modeloInterno: null,
        vel:      new THREE.Vector3(),
        radius:   RAIO_CAPSULA,
        apanhada: false,
        saiu:     false,
        aberta:   false
    };
    capsulas.push(capsulaObj);
}

// ── Teclado ──────────────────────────────────────────────────────────────────
let estadoJogo  = "LIVRE";
let timeAnim = 0;

const teclas = setupKeyboard(
    () => estadoJogo === "LIVRE" && capsuleOpener.estado === "INATIVA",
    () => {
        estadoJogo = "A DESCER";
    }
);

const velMovimento = 0.15;
const limites      = { x: 9, z: 9 };

// ── Confetis e CapsuleOpener ─────────────────────────────────────────────────
const confetisObj   = criarConfetis(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetisObj);

// ── Raycaster (clique nas cápsulas exteriores) ───────────────────────────────
const raycaster   = new THREE.Raycaster();
const pontoClique = new THREE.Vector2();

window.addEventListener("click", (e) => {
    if (capsuleOpener.estado !== "INATIVA") return;

    pontoClique.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    pontoClique.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pontoClique, camera);

    const disponiveis = capsulas.filter(c => c.saiu && !c.aberta && !c.apanhada);
    const hits = raycaster.intersectObjects(disponiveis.map(c => c.mesh), true);
    if (!hits.length) return;

    const hit = hits[0].object;
    const capsulaFis = disponiveis.find(c => {
        let found = false;
        c.mesh.traverse(child => { if (child === hit) found = true; });
        return found;
    });
    if (!capsulaFis) return;

    capsulaFis.aberta = true;

    // Carrega o prémio agora que clicámos e a animação vai começar
    carregarPremio("frog.glb", capsulaFis.mesh, (modelo) => {
        modelo.scale.set(0.025, 0.025, 0.025);
        modelo.position.set(0, -0.3, 0); 
        capsulaFis.modeloInterno = modelo;

        capsuleOpener.ativar(
            { grupo: capsulaFis.mesh, dobradica: capsulaFis.dobradica },
            capsulaFis,
            modelo,
            0.05
        );
    });
});

// ── Loop principal ───────────────────────────────────────────────────────────
function animate(time) {
    requestAnimationFrame(animate);

    const novaAnimacao = updateClawAnimation(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento);
    estadoJogo = novaAnimacao.novoEstado;
    timeAnim = novaAnimacao.novoTime;

    // ── Sistemas ─────────────────────────────────────────────────────────────────
    physicsWorld.update(capsulas, clawMachine);
    capsuleOpener.update(time);
    confetisObj.atualizarMovimento();

    controls.update();
    renderer.render(scene, camera);
}

// ── Inicialização assíncrona (Rapier usa WASM) ───────────────────────────────
const physicsWorld = new PhysicsWorld();

physicsWorld.init(capsulas, clawMachine).then(() => {
    animate();
}).catch(err => {
    console.error("Erro ao inicializar Rapier:", err);
});

// ── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});