import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

// Importamos as nossas peças!
import { criarCapsula } from "./models/capsuleModel.js";
import { carregarSapo } from "../models/frog.js";
import { criarConfetis } from "../models/confetti.js";
import { CapsuleOpener } from "./capsuleOpener.js";

// --- 1. Configuração da Cena Base ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333344);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 10, 25); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Iluminação
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// --- 2. Preparação dos Objetos ---

// 2.1 Criar a Cápsula
const minhaCapsula = criarCapsula();
minhaCapsula.grupo.scale.set(3, 3, 3);
scene.add(minhaCapsula.grupo);

// 2.2 Criar os Confetis
const sistemaConfetis = criarConfetis(scene);

// 2.3 Criar o Motor de Abertura (Opener)
const opener = new CapsuleOpener(scene, camera, controls, sistemaConfetis);

// 2.4 Carregar o Modelo (Sapo)
carregarSapo(scene, function(modelo) {
    // Configuramos o opener: (cápsula, modelo, escala final desejada)
    opener.configurar(minhaCapsula, modelo, 2.0);
});

// --- 3. Interface ---
const btnAbrir = document.getElementById("btnAbrir");

btnAbrir.addEventListener("click", () => {
    opener.abrir();
    btnAbrir.style.display = "none"; // Esconde o botão após o clique
});

// --- 4. Ciclo de Animação Principal ---
function animate(time) {
    requestAnimationFrame(animate);

    // O Opener faz toda a gestão: abrir tampa, expulsar peças, crescer modelo e flutuar
    opener.update(time);

    // Atualizar sistemas externos
    if (sistemaConfetis) {
        sistemaConfetis.atualizarMovimento();
    }

    controls.update(); 
    renderer.render(scene, camera);
}

animate();

// --- Ajustar redimensionamento da janela ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});