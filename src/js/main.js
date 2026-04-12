import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";
import { PhysicsWorld, RAIO_CAPSULA } from "./systems/PhysicsSystem.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { carregarPremio } from "./systems/PrizeLoader.js";
import { criarConfetis } from "./models/confetti.js";

// ── Cena ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 60);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 18, 0);
controls.update();

// ── Iluminação ───────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(36, 72, 24);
dirLight.castShadow = true;
dirLight.shadow.camera.left  = -24;
dirLight.shadow.camera.right =  24;
dirLight.shadow.camera.top   =  40;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5, 36);
pointLight.position.set(0, 18, 0);
scene.add(pointLight);

// ── Modelo da máquina ────────────────────────────────────────────────────────
const clawMachine = criarClawMachine(scene);

// ── Cápsulas ─────────────────────────────────────────────────────────────────
const numCapsulas = 100;
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

    capsulas.push({
        mesh:     grupo,
        dobradica: dobradica,
        vel:      new THREE.Vector3(),   // Mantido para compatibilidade (não usado pelo Rapier)
        radius:   RAIO_CAPSULA,
        apanhada: false,
        saiu:     false,
        aberta:   false
    });
}

// ── Teclado ──────────────────────────────────────────────────────────────────
const teclas      = { up: false, down: false, left: false, right: false, action: false };
const velMovimento = 0.15;
const limites      = { x: 9, z: 9 };

let estadoJogo       = "LIVRE";
let timeAnim         = 0;
let capsulaApanhada  = null;   // Única cápsula agarrada pela garra (ou null)

// Os listeners de teclado são adicionados após a instância do capsuleOpener
// (declarado mais abaixo) ser criada.

// ── Funções de animação da garra ─────────────────────────────────────────────
// Estado de repouso (default): igual ao aberto atual
function estadoRepousoGarra() {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 3.2, 0.1);
    });
}
// Garra aberta: menos aberta que antes
function abrirGarra() {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 2.2, 0.1);
    });
}
function fecharGarra() {
    // Fechar: igual ao abrir mas menos rotação (menos aberto)
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 7, 0.1);
    });
}

// ── Helpers da garra ─────────────────────────────────────────────────────────
/**
 * Centro da garra (pivot dos dedos) em coordenadas mundo.
 * garraTetoGroup está em (mecanismoTeto.x, 42.2, mecanismoTeto.z) mundo.
 * garraCaboGroup.position.y é relativo a garraTetoGroup.
 * dedoPivot.position.y = -0.72 relativo a garraCaboGroup.
 */
function getClawCenterWorld() {
    return new THREE.Vector3(
        clawMachine.mecanismoTeto.position.x,
        42.2 + clawMachine.mecanismoCabo.position.y - 0.72,
        clawMachine.mecanismoTeto.position.z
    );
}

// ── Confetis e CapsuleOpener ─────────────────────────────────────────────────
const confetisObj   = criarConfetis(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetisObj);

// ── Listeners de teclado ─────────────────────────────────────────────────────
window.addEventListener("keydown", (e) => {
    if (estadoJogo !== "LIVRE") return;
    if (capsuleOpener.estado !== "INATIVA") return;

    if (e.key === "ArrowUp")    teclas.up    = true;
    if (e.key === "ArrowDown")  teclas.down  = true;
    if (e.key === "ArrowLeft")  teclas.left  = true;
    if (e.key === "ArrowRight") teclas.right = true;

    if (e.key === " ") {
        teclas.action = true;
        estadoJogo = "DESCENDO";
        setTimeout(() => (teclas.action = false), 300);
    }
});
window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp")    teclas.up    = false;
    if (e.key === "ArrowDown")  teclas.down  = false;
    if (e.key === "ArrowLeft")  teclas.left  = false;
    if (e.key === "ArrowRight") teclas.right = false;
});

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

    carregarPremio("frog.glb", scene, (modelo) => {
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

    // Movimento livre (setas)
    if (estadoJogo === "LIVRE") {
        estadoRepousoGarra();
        if (teclas.up    && clawMachine.mecanismoTeto.position.z > -limites.z) clawMachine.mecanismoTeto.position.z -= velMovimento;
        if (teclas.down  && clawMachine.mecanismoTeto.position.z <  limites.z) clawMachine.mecanismoTeto.position.z += velMovimento;
        if (teclas.left  && clawMachine.mecanismoTeto.position.x > -limites.x) clawMachine.mecanismoTeto.position.x -= velMovimento;
        if (teclas.right && clawMachine.mecanismoTeto.position.x <  limites.x) clawMachine.mecanismoTeto.position.x += velMovimento;
    }

    // Animação joystick / botão
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.x,
        teclas.up ? -Math.PI / 8 : teclas.down ? Math.PI / 8 : 0, 0.15);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        teclas.left ? Math.PI / 8 : teclas.right ? -Math.PI / 8 : 0, 0.15);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, teclas.action ? 0.45 : 0.65, 0.3);

    // ── DESCENDO ─────────────────────────────────────────────────────────────────
    // A garra desce com os dedos abertos.
    // A física de colisão real é tratada pelo Rapier através dos finger bodies
    // Cinemáticos que são actualizados em physicsWorld.update() → _syncFingerBodies.
    // Os dedos empurram fisicamente as cápsulas ao descer.
    if (estadoJogo === "DESCENDO") {
        abrirGarra();
        if (clawMachine.mecanismoCabo.position.y > -24.5) {
            clawMachine.mecanismoCabo.position.y -= 0.4;
        } else {
            estadoJogo = "FECHANDO";
            timeAnim   = 0;
        }
    }

    // ── FECHANDO ─────────────────────────────────────────────────────────────────
    // Os dedos fecham-se fisicamente (animação rotation.x) e os finger bodies
    // Do Rapier seguem a mesma rotação, empurrando as cápsulas para o centro.
    // // Ao frame 55 (~85% fechados), verificamos quais as cápsulas que ficaram
    // Dentro do raio de captura — são as que os dedos conseguiram envolver.
    // Nenhum imã: se a cápsula escapou antes dos dedos fecharem, não é apanhada.
    if (estadoJogo === "FECHANDO") {
        fecharGarra(); // Garantir animação contínua
        timeAnim++;

        if (timeAnim === 55) {
            const centro    = getClawCenterWorld();
            const raioGrab  = 2.8; // Raio de captura após fechar os dedos

            for (const c of capsulas) {
                if (c.apanhada || c.saiu) continue;
                if (c.mesh.position.distanceTo(centro) < raioGrab) {
                    c.apanhada = true;
                    capsulaApanhada = c;
                    physicsWorld.freezeBody(c);
                    break; // Garra real apanha no máximo uma cápsula
                }
            }
        }

        if (timeAnim > 70) estadoJogo = "SUBINDO";
    }

    // ── SUBINDO ──────────────────────────────────────────────────────────────────
    if (estadoJogo === "SUBINDO") {
        fecharGarra();
        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.2;
        } else {
            estadoJogo = "RETORNANDO";
        }
    }

    // ── RETORNANDO ───────────────────────────────────────────────────────────────
    if (estadoJogo === "RETORNANDO") {
        fecharGarra();
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.05);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z,  9.0, 0.05);

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
            estadoJogo = "ABRINDO";
            timeAnim   = 0;
        }
    }

    // ── ABRINDO (larga cápsula no buraco) ────────────────────────────────────────
    if (estadoJogo === "ABRINDO") {
        abrirGarra();
        timeAnim++;

        if (timeAnim === 40 && capsulaApanhada) {
            // Devolver à simulação dinâmica — a cápsula cai por si própria
            physicsWorld.unfreezeBody(capsulaApanhada);
            capsulaApanhada.apanhada = false;
            capsulaApanhada = null;
        }

        if (timeAnim > 50) estadoJogo = "LIVRE";
    }

    // ── Manter cápsula colada à garra durante o transporte ───────────────────────
    if (capsulaApanhada) {
        const c = getClawCenterWorld();
        // Posicionar ligeiramente abaixo do pivot dos dedos
        physicsWorld.setBodyPosition(capsulaApanhada, c.x, c.y - 2.0, c.z);
    }

    // Escalar cabo
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, dif);

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