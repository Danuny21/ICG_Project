import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { criarClawMachine } from '../models/clawMachineModel.js';

// --- 1. CONFIGURAÇÃO DA CENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Câmara mais afastada para ver a máquina inteira
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 8, 0); // Focar no centro da máquina
controls.update();

// --- 2. ILUMINAÇÃO ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Luz direcional para sombras
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(15, 30, 10);
dirLight.castShadow = true;
// Ajustar área da sombra para cobrir a máquina
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

// Luz pontual dentro da máquina (para estilo)
const lightInter = new THREE.PointLight(0xffffff, 1, 15);
lightInter.position.set(0, 12, 0);
scene.add(lightInter);


// --- 3. CARREGAR O MODELO ---
const clawMachine = criarClawMachine(scene);

// --- 4. LÓGICA DE MOVIMENTO E TECLADO ---
const teclas = { up: false, down: false, left: false, right: false };
const velMovimento = 0.15;
// Limites da máquina (para a garra não sair do vidro)
const limites = { x: 3.8, z: 3.8 }; 

// Variáveis de estado da animação automática
let estadoJogo = "LIVRE"; // LIVRE, DESCENDO, FECHANDO, SUBINDO, RETORNANDO, ABRINDO
let timeAnim = 0;

// Escutar teclado
window.addEventListener('keydown', (e) => {
    if (estadoJogo !== "LIVRE") return; // Bloqueia input durante animação automática

    if (e.key === 'ArrowUp') teclas.up = true;
    if (e.key === 'ArrowDown') teclas.down = true;
    if (e.key === 'ArrowLeft') teclas.left = true;
    if (e.key === 'ArrowRight') teclas.right = true;
    
    if (e.key === ' ' && estadoJogo === "LIVRE") {
        estadoJogo = "DESCENDO"; // Inicia sequência automática
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') teclas.up = false;
    if (e.key === 'ArrowDown') teclas.down = false;
    if (e.key === 'ArrowLeft') teclas.left = false;
    if (e.key === 'ArrowRight') teclas.right = false;
});


// --- 5. FUNÇÕES DE ANIMAÇÃO DA GARRA ---

function abrirGarra() {
    clawMachine.dedos.forEach(dedo => {
        // Rotação X positiva abre os dedos
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, Math.PI / 3, 0.1);
    });
}

function fecharGarra() {
    clawMachine.dedos.forEach(dedo => {
        // Rotação X negativa fecha os dedos
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, -Math.PI / 6, 0.1);
    });
}


// --- 6. CICLO DE ANIMAÇÃO PRINCIPAL ---
function animate(time) {
    requestAnimationFrame(animate);

    // 6.1 MOVIMENTO LIVRE (Input do Utilizador)
    if (estadoJogo === "LIVRE") {
        abrirGarra(); // Mantém aberta enquanto moves

        if (teclas.up && clawMachine.mecanismoTeto.position.z > -limites.z) 
            clawMachine.mecanismoTeto.position.z -= velMovimento;
        if (teclas.down && clawMachine.mecanismoTeto.position.z < limites.z) 
            clawMachine.mecanismoTeto.position.z += velMovimento;
        if (teclas.left && clawMachine.mecanismoTeto.position.x > -limites.x) 
            clawMachine.mecanismoTeto.position.x -= velMovimento;
        if (teclas.right && clawMachine.mecanismoTeto.position.x < limites.x) 
            clawMachine.mecanismoTeto.position.x += velMovimento;
    }

    // 6.2 LÓGICA DA JOGADA AUTOMÁTICA (Máquina de Estados)
    
    if (estadoJogo === "DESCENDO") {
        // Baixar o cabo (mecanismoCabo move-se em Y negativo)
        if (clawMachine.mecanismoCabo.position.y > -8) {
            clawMachine.mecanismoCabo.position.y -= 0.2;
        } else {
            estadoJogo = "FECHANDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "FECHANDO") {
        fecharGarra();
        timeAnim++;
        if (timeAnim > 60) { // Espera 1 segundo a fechar
            estadoJogo = "SUBINDO";
        }
    }

    if (estadoJogo === "SUBINDO") {
        fecharGarra(); // Mantém fechada
        // Subir o cabo
        if (clawMachine.mecanismoCabo.position.y < 0) {
            clawMachine.mecanismoCabo.position.y += 0.15;
        } else {
            estadoJogo = "RETORNANDO";
        }
    }

    if (estadoJogo === "RETORNANDO") {
        fecharGarra();
        // Mover teto de volta para a zona de saída (-3.5, 3.5)
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -limites.x, 0.05);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z, limites.z, 0.05);

        // Se estiver perto o suficiente da saída
        if (posTeto.distanceTo(new THREE.Vector3(-limites.x, 13, limites.z)) < 0.1) {
            estadoJogo = "ABRINDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "ABRINDO") {
        abrirGarra();
        timeAnim++;
        if (timeAnim > 90) { // Espera um pouco a abrir e libertar (supostamente) o peluche
            estadoJogo = "LIVRE"; // Devolve o controle ao jogador
        }
    }

    // Atualizações padrão
    controls.update(); 
    renderer.render(scene, camera);
}

animate();

// Redimensionamento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});