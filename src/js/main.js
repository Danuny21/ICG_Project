import * as THREE from "three";
import { setupScene } from "./setup/sceneSetup.js";
import { setupLighting } from "./setup/lighting.js";
import { setupOrbitControls, setupKeyboard } from "./setup/controls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";
import { PhysicsWorld, RAIO_CAPSULA } from "./systems/PhysicsSystem.js";
import { CapsuleOpener } from "./systems/CapsuleOpener.js";
import { carregarPremio } from "./systems/PrizeLoader.js";
import { criarConfetis } from "./models/confetti.js";

// ── Cena ─────────────────────────────────────────────────────────────────────
const { scene, camera, renderer } = setupScene();
const controls = setupOrbitControls(camera, renderer);

// ── Iluminação ───────────────────────────────────────────────────────────────
setupLighting(scene);

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
const teclas      = { up: false, down: false, left: false, right: false, action: false };
const velMovimento = 0.15;
const limites      = { x: 9, z: 9 };

let estadoJogo       = "LIVRE";
let timeAnim         = 0;

// ── Funções de animação da garra ─────────────────────────────────────────────
function estadoRepousoGarra() {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 3.2, 0.1);
    });
}

function abrirGarra() {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 2.2, 0.1);
    });
}

function fecharGarra() {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 7, 0.1);
    });
}

// ── Confetis e CapsuleOpener ─────────────────────────────────────────────────
const confetisObj   = criarConfetis(scene);
const capsuleOpener = new CapsuleOpener(scene, camera, controls, confetisObj);

// ── Ouvintes de teclado ─────────────────────────────────────────────────────
window.addEventListener("keydown", (e) => {
    if (estadoJogo !== "LIVRE") return;
    if (capsuleOpener.estado !== "INATIVA") return;

    if (e.key === "ArrowUp")    teclas.up    = true;
    if (e.key === "ArrowDown")  teclas.down  = true;
    if (e.key === "ArrowLeft")  teclas.left  = true;
    if (e.key === "ArrowRight") teclas.right = true;

    if (e.key === " ") {
        teclas.action = true;
        estadoJogo = "A DESCER";
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

    // ── A DESCER ─────────────────────────────────────────────────────────────────
    if (estadoJogo === "A DESCER") {
        abrirGarra();
        if (clawMachine.mecanismoCabo.position.y > -24.5) {
            clawMachine.mecanismoCabo.position.y -= 0.4;
        } else {
            estadoJogo = "A FECHAR";
            timeAnim   = 0;
        }
    }

    // ── A FECHAR ─────────────────────────────────────────────────────────────────
    if (estadoJogo === "A FECHAR") {
        fecharGarra();
        timeAnim++;
        if (timeAnim > 70) estadoJogo = "A SUBIR";
    }

    // ── A SUBIR ──────────────────────────────────────────────────────────────────
    if (estadoJogo === "A SUBIR") {
        fecharGarra();
        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.2;
        } else {
            estadoJogo = "A REGRESSAR";
        }
    }

    // ── A REGRESSAR ───────────────────────────────────────────────────────────────
    if (estadoJogo === "A REGRESSAR") {
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
        if (timeAnim > 50) estadoJogo = "LIVRE";
    }

    // Escalar cabo (animação visual)
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