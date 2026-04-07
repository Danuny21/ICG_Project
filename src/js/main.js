import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";

// --- 1. CONFIGURAÇÃO DA CENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Câmara mais afastada para ver a máquina inteira
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 60); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 18, 0); // Focar no centro da máquina
controls.update();

// --- 2. ILUMINAÇÃO ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Luz direcional para sombras
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(36, 72, 24);
dirLight.castShadow = true;
// Ajustar área da sombra para cobrir a máquina maior (24x32x24)
dirLight.shadow.camera.left = -24;
dirLight.shadow.camera.right = 24;
dirLight.shadow.camera.top = 40;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

// Luz pontual dentro da máquina (para estilo)
const lightInter = new THREE.PointLight(0xffffff, 1.5, 36);
lightInter.position.set(0, 18, 0);
scene.add(lightInter);


// --- 3. CARREGAR O MODELO ---
const clawMachine = criarClawMachine(scene);

// FÍSICA BÁSICA E CÁPSULAS
const numCapsulas = 15;
const capsulas = [];
const RAIO_CAPSULA = 2; // O tamanho da esfera na capsuleModel é raio=2

for (let i = 0; i < numCapsulas; i++) {
    const { grupo } = criarCapsula();
    
    // Posições aleatórias iniciais dentro da máquina
    // Limites de X e Z: aprox entre -8 e 8 para não prender
    // Altura Y de drop: 22 a 32 (porque o chão subiu)
    grupo.position.set(
        (Math.random() - 0.5) * 16, 
        22 + Math.random() * 10, 
        (Math.random() - 0.5) * 16
    );
    
    scene.add(grupo);
    capsulas.push({
        mesh: grupo,
        vel: new THREE.Vector3(0, 0, 0),
        radius: RAIO_CAPSULA
    });
}

function updatePhysics() {
    const gravity = -0.15;
    // chão subiu para y=14.06, então o contacto da bola é 14.06 + RAIO (+ pequena folga)
    const floorY = 14.1 + RAIO_CAPSULA; 
    const limitX = 10; // paredes laterais em ~x=11.45, tiramos o raio e um pouco de folga
    const limitZ = 10; // paredes trás e frente (a frente é cortada pelo buraco)

    // O buraco de saída tem o centro em x=-7.8, z=7.8 (largura e profundidade ~ 6.6, de x -11.1 a -4.5)
    // O buraco está fora dos limites para a cápsula não cair, ou podemos deixá-la cair se acertar.
    
    for (let i = 0; i < capsulas.length; i++) {
        const c = capsulas[i];
        
        // Aplicar gravidade
        c.vel.y += gravity;
        
        // Nova posição tentativa
        c.mesh.position.add(c.vel);
        
        // Adicionar resistência do ar
        c.vel.multiplyScalar(0.98);

        // Colisões com o chão
        if (c.mesh.position.y < floorY) {
            
            // Verificar buraco de saída
            let noBuraco = false;
            // O buraco (-7.8, 7.8) de 6.6x6.6
            if (c.mesh.position.x < -4.5 && c.mesh.position.x > -11.1 && c.mesh.position.z > 4.5 && c.mesh.position.z < 11.1) {
                noBuraco = true;
            }

            if (!noBuraco) {
                c.mesh.position.y = floorY;
                c.vel.y *= -0.5; // ressalto no chão
            }
        }
        
        // Limites nas paredes laterais (Eixo X e Z)
        if (c.mesh.position.x > limitX) { c.mesh.position.x = limitX; c.vel.x *= -0.8; }
        if (c.mesh.position.x < -limitX) { c.mesh.position.x = -limitX; c.vel.x *= -0.8; }
        
        if (c.mesh.position.z > limitZ) { c.mesh.position.z = limitZ; c.vel.z *= -0.8; }
        if (c.mesh.position.z < -limitZ) { c.mesh.position.z = -limitZ; c.vel.z *= -0.8; }
        
        // Colisões entre esferas
        for (let j = i + 1; j < capsulas.length; j++) {
            const c2 = capsulas[j];
            const dist = c.mesh.position.distanceTo(c2.mesh.position);
            const minDist = c.radius + c2.radius;
            
            if (dist < minDist && dist > 0) {
                // Vetor direção e correção
                const direcao = new THREE.Vector3().subVectors(c.mesh.position, c2.mesh.position).normalize();
                
                // Repelir-se umas às outras (overlap)
                const overlap = minDist - dist;
                const correcao = direcao.clone().multiplyScalar(overlap * 0.5);
                
                c.mesh.position.add(correcao);
                c2.mesh.position.sub(correcao);
                
                // Troca elástica de velocidades
                const relativeVel = new THREE.Vector3().subVectors(c.vel, c2.vel);
                const speed = relativeVel.dot(direcao);
                
                if (speed < 0) { // Se se estão a aproximar
                    const impulso = direcao.multiplyScalar(speed * 0.8); // Bounciness 0.8
                    c.vel.sub(impulso);
                    c2.vel.add(impulso);
                }
            }
        }
        
        // Atualizar rotação (rola baseada no movimento X/Z)
        c.mesh.rotation.x += c.vel.z * 0.2;
        c.mesh.rotation.z -= c.vel.x * 0.2;
    }
}

// --- 4. LÓGICA DE MOVIMENTO E TECLADO ---
const teclas = { up: false, down: false, left: false, right: false, action: false };
const velMovimento = 0.15;
// Limites da máquina (para a garra não sair do vidro) - Aumentado proporcionalmente
const limites = { x: 9, z: 9 }; 

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
        teclas.action = true;
        estadoJogo = "DESCENDO"; // Inicia sequência automática
        setTimeout(() => teclas.action = false, 300); // Soltar botão passado 300ms
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

    // --- ANIMAÇÃO DOS CONTROLES (ANALÓGICO E BOTÃO) ---
    // Rotações alvo para o joystick baseadas nas setas pressionadas
    let targetRotX = 0;
    let targetRotZ = 0;
    if (teclas.up) targetRotX = -Math.PI / 8;    // Inclina para a frente (z negativo)
    if (teclas.down) targetRotX = Math.PI / 8;   // Inclina para trás (z positivo)
    if (teclas.left) targetRotZ = Math.PI / 8;   // Inclina para a esquerda
    if (teclas.right) targetRotZ = -Math.PI / 8; // Inclina para a direita

    // Interpola a rotação perfeitamente para sensação real
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.x, targetRotX, 0.15);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.z, targetRotZ, 0.15);

    // Botão vai para baixo (Y = 0.45 em vez de 0.65) se pressionado
    let targetBtnY = teclas.action ? 0.45 : 0.65;
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(clawMachine.controles.botao.position.y, targetBtnY, 0.3);

    // 6.2 LÓGICA DA JOGADA AUTOMÁTICA (Máquina de Estados)
    
    if (estadoJogo === "DESCENDO") {
        // Baixar o cabo até chegar perto aos brindes do chão levantado
        // Como o chão levantou 7 unidades e o limite do teto antigo era -30.5, limitamos o novo valor a -24.5
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
        if (timeAnim > 60) { // Espera 1 segundo a fechar
            estadoJogo = "SUBINDO";
        }
    }

    if (estadoJogo === "SUBINDO") {
        fecharGarra(); // Mantém fechada
        // Subir o cabo de volta para a posição base de descanso (-10 modificada recentemente por ti)
        if (clawMachine.mecanismoCabo.position.y < -10) {
            clawMachine.mecanismoCabo.position.y += 0.2;
        } else {
            estadoJogo = "RETORNANDO";
        }
    }

    if (estadoJogo === "RETORNANDO") {
        fecharGarra();
        // Mover teto de volta para a zona de saída
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.05);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z, 9, 0.05);

        // Se estiver perto o suficiente da saída
        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
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

    // --- ATUALIZAR CABO DINAMICAMENTE ---
    // Faz o cabo esticar/encolher até ao teto e evita que passe do teto para fora!
    // A altura do cabo será a distância da Garra (em Y negativo) em relação ao teto.
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = dif < 0.1 ? 0.1 : dif;
    // Opcional: Garante que o material do cabo não se estraga com a escala
    
    // Atualizar a física
    updatePhysics();

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
