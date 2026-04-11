import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";
import { updatePhysics, RAIO_CAPSULA } from "./systems/PhysicsSystem.js";

// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 18, 0);
controls.update();

// Iluminação
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(36, 72, 24);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -24;
dirLight.shadow.camera.right = 24;
dirLight.shadow.camera.top = 40;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

const lightInter = new THREE.PointLight(0xffffff, 1.5, 36);
lightInter.position.set(0, 18, 0);
scene.add(lightInter);


// Carregar o modelo
const clawMachine = criarClawMachine(scene);

// Física básica e cápsulas
const numCapsulas = 100;
const capsulas = [];

for (let i = 0; i < numCapsulas; i++) {
    const { grupo } = criarCapsula();

    let posX, posZ;
    let caiuNoBuraco = true;

    while (caiuNoBuraco) {
        posX = (Math.random() - 0.5) * 8;
        posZ = (Math.random() - 0.5) * 8;

        if (posX < -4.0 && posX > -11.5 && posZ > 4.0 && posZ < 11.5) {
            caiuNoBuraco = true;
        } else {
            caiuNoBuraco = false;
        }
    }

    grupo.position.set(posX, 22 + Math.random() * 12, posZ);

    scene.add(grupo);
    capsulas.push({
        mesh: grupo,
        vel: new THREE.Vector3(0, 0, 0),
        radius: RAIO_CAPSULA,
        apanhada: false
    });
}

// Lógica de movimento e teclado
const teclas = { up: false, down: false, left: false, right: false, action: false };
const velMovimento = 0.15;
const limites = { x: 9, z: 9 };

let estadoJogo    = "LIVRE";
let timeAnim      = 0;
let capsulaApanhada = null;

window.addEventListener('keydown', (e) => {
    if (estadoJogo !== "LIVRE") return;

    if (e.key === 'ArrowUp')    teclas.up    = true;
    if (e.key === 'ArrowDown')  teclas.down  = true;
    if (e.key === 'ArrowLeft')  teclas.left  = true;
    if (e.key === 'ArrowRight') teclas.right = true;

    if (e.key === ' ' && estadoJogo === "LIVRE") {
        teclas.action = true;
        estadoJogo = "DESCENDO";
        setTimeout(() => teclas.action = false, 300);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp')    teclas.up    = false;
    if (e.key === 'ArrowDown')  teclas.down  = false;
    if (e.key === 'ArrowLeft')  teclas.left  = false;
    if (e.key === 'ArrowRight') teclas.right = false;
});


// Funções de animação da garra

function abrirGarra() {
    clawMachine.dedos.forEach(dedo => {
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, -Math.PI / 6, 0.1);
    });
}

function fecharGarra() {
    clawMachine.dedos.forEach(dedo => {
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, Math.PI / 3, 0.1);
    });
}


// Ciclo de animação principal
function animate(time) {
    requestAnimationFrame(animate);

    // 6.1 MOVIMENTO LIVRE
    if (estadoJogo === "LIVRE") {
        fecharGarra();

        if (teclas.up    && clawMachine.mecanismoTeto.position.z > -limites.z) clawMachine.mecanismoTeto.position.z -= velMovimento;
        if (teclas.down  && clawMachine.mecanismoTeto.position.z <  limites.z) clawMachine.mecanismoTeto.position.z += velMovimento;
        if (teclas.left  && clawMachine.mecanismoTeto.position.x > -limites.x) clawMachine.mecanismoTeto.position.x -= velMovimento;
        if (teclas.right && clawMachine.mecanismoTeto.position.x <  limites.x) clawMachine.mecanismoTeto.position.x += velMovimento;
    }

    // Animação do joystick e botão
    let targetRotX = 0, targetRotZ = 0;
    if (teclas.up)    targetRotX = -Math.PI / 8;
    if (teclas.down)  targetRotX =  Math.PI / 8;
    if (teclas.left)  targetRotZ =  Math.PI / 8;
    if (teclas.right) targetRotZ = -Math.PI / 8;

    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.x, targetRotX, 0.15);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.z, targetRotZ, 0.15);

    const targetBtnY = teclas.action ? 0.45 : 0.65;
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(clawMachine.controles.botao.position.y, targetBtnY, 0.3);

    // 6.2 LÓGICA DA JOGADA AUTOMÁTICA

    if (estadoJogo === "DESCENDO") {
        abrirGarra();
        if (clawMachine.mecanismoCabo.position.y > -24.5) {
            clawMachine.mecanismoCabo.position.y -= 0.4;
        } else {
            estadoJogo = "FECHANDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "FECHANDO") {
        fecharGarra();
        timeAnim++;

        if (timeAnim === 30) {
            const garraPos = new THREE.Vector3(
                clawMachine.mecanismoTeto.position.x,
                42.2 + clawMachine.mecanismoCabo.position.y - 2.5,
                clawMachine.mecanismoTeto.position.z
            );
            for (let c of capsulas) {
                if (!c.apanhada && c.mesh.position.distanceTo(garraPos) < 4.5) {
                    capsulaApanhada = c;
                    c.apanhada = true;
                    console.log("Cápsula apanhada!");
                    break;
                }
            }
        }

        if (timeAnim > 60) {
            estadoJogo = "SUBINDO";
        }
    }

    if (estadoJogo === "SUBINDO") {
        fecharGarra();
        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.2;
        } else {
            estadoJogo = "RETORNANDO";
        }
    }

    if (estadoJogo === "RETORNANDO") {
        fecharGarra();
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.05);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z,  9.0, 0.05);

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
            estadoJogo = "ABRINDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "ABRINDO") {
        abrirGarra();
        timeAnim++;

        if (timeAnim === 40 && capsulaApanhada) {
            capsulaApanhada.apanhada = false;
            capsulaApanhada.vel.set(0, 0, 0);
            capsulaApanhada = null;
        }

        if (timeAnim > 50) {
            estadoJogo = "LIVRE";
        }
    }

    if (capsulaApanhada) {
        capsulaApanhada.mesh.position.set(
            clawMachine.mecanismoTeto.position.x,
            42.2 + clawMachine.mecanismoCabo.position.y - 3,
            clawMachine.mecanismoTeto.position.z
        );
        capsulaApanhada.vel.set(0, 0, 0);
    }

    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = dif < 0.1 ? 0.1 : dif;

    updatePhysics(capsulas, clawMachine);

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});