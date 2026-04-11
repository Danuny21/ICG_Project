import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { criarClawMachine } from "./models/clawMachine.js";
import { criarCapsula } from "./models/capsuleModel.js";

// --- 1. CONFIGURAÇÃO DA CENA ---
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

// --- 2. ILUMINAÇÃO ---
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


// --- 3. CARREGAR O MODELO ---
const clawMachine = criarClawMachine(scene);

// ── PLANO DE CHÃO EXTERIOR ───────────────────────────────────────────────────
// Altura fixa 0 para o chão onde a cápsula aterra depois de sair.
const CHAO_EXTERIOR_Y = 0; 

const planoExteriorGeo = new THREE.PlaneGeometry(30, 30);
const planoExteriorMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    visible: true, // Podes por a false depois de testares
    side: THREE.DoubleSide
});
const planoExterior = new THREE.Mesh(planoExteriorGeo, planoExteriorMat);
planoExterior.rotation.x = -Math.PI / 2;
planoExterior.position.set(-7.8, CHAO_EXTERIOR_Y, 20); 
scene.add(planoExterior);

// ── ESTADO DA PORTA (física de mola) ─────────────────────────────────────────
let portaVelAngular = 0;          
const PORTA_SPRING  = 0.04;       
const PORTA_DAMPING = 0.80;       
const PORTA_Z       = 11.5;       
const PORTA_ALTURA  = 8.0;        
const PORTA_ABERTURA_MAX = -Math.PI / 2.2; 


// FÍSICA BÁSICA E CÁPSULAS
const numCapsulas = 100;
const capsulas = [];
const RAIO_CAPSULA = 1.5;

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

function updatePhysics() {
    const gravity = -0.15;
    const floorY  = 14.1 + RAIO_CAPSULA;
    const limitX  = 10;
    const limitZ  = 10;

    // ── Constantes do corredor de saída ──────────────────────────────────────
    const CHUTE_X_MIN  = -11.1;
    const CHUTE_X_MAX  = -4.5;
    const BURACO_Z_MIN =  4.5;

    // ── Física da porta (mola) ────────────────────────────────────────────────
    if (clawMachine.porta) {
        portaVelAngular += (0 - clawMachine.porta.rotation.x) * PORTA_SPRING;
        portaVelAngular *= PORTA_DAMPING;
        clawMachine.porta.rotation.x += portaVelAngular;

        clawMachine.porta.rotation.x = Math.max(
            PORTA_ABERTURA_MAX,
            Math.min(0, clawMachine.porta.rotation.x)
        );
    }

    for (let i = 0; i < capsulas.length; i++) {
        const c = capsulas[i];

        if (c.apanhada) continue;

        c.vel.y += gravity;
        c.mesh.position.add(c.vel);

        c.vel.x *= 0.98;
        c.vel.z *= 0.98;

        const xNoCorreder = c.mesh.position.x < CHUTE_X_MAX && c.mesh.position.x > CHUTE_X_MIN;

        // ── Interação com a porta ─────────────────────────────────────────────
        if (clawMachine.porta && xNoCorreder && c.mesh.position.y < PORTA_ALTURA) {
            const distDaPosta = c.mesh.position.z - (PORTA_Z - RAIO_CAPSULA);

            if (distDaPosta > 0 && distDaPosta < RAIO_CAPSULA * 2) {
                // Abre a porta com o balanço da cápsula
                const forcaNaPorta = c.vel.z * 0.15;
                portaVelAngular -= forcaNaPorta; 

                // Resistencia da porta acrílica
                const abertura = Math.abs(clawMachine.porta.rotation.x) / Math.abs(PORTA_ABERTURA_MAX);
                const resistencia = 1.0 - abertura * 0.85; 
                c.vel.z *= (1.0 - resistencia * 0.3);

                // Se não está aberta que chegue, tranca o movimento
                if (abertura < 0.35) {
                    c.mesh.position.z = PORTA_Z - RAIO_CAPSULA;
                    if (c.vel.z > 0) c.vel.z *= 0.1;
                }
            }
        }

        // ── Chão e Lógica do Buraco / Rampa ───────────────────────────────────
        
        // Se a cápsula está no canal de saída (passou para trás do vidro do buraco)
        const noBuracoOuSaida = xNoCorreder && c.mesh.position.z > BURACO_Z_MIN;
        const passouDaPorta = c.mesh.position.z >= PORTA_Z;

        if (noBuracoOuSaida) {
            // ── RAMPA CONTÍNUA DO BURACO ATÉ CÁ FORA ────────────────────────
            const inicioZ      = BURACO_Z_MIN; // Z=4.5 (Inicio do buraco)
            const fimZ         = 15.0;         // Z=15.0 (Ponto onde toca no chão branco cá fora)
            const alturaInicio = 13.0;         // Altura no topo (quase no nível do jogo)
            const alturaFim    = CHAO_EXTERIOR_Y; // Altura no fim (chão cá fora)

            let alturaRampa = alturaInicio - ((c.mesh.position.z - inicioZ) * ((alturaInicio - alturaFim) / (fimZ - inicioZ)));

            // Quando acaba a rampa, fica plana
            if (alturaRampa < alturaFim) alturaRampa = alturaFim;

            const contatoY = alturaRampa + c.radius;

            if (c.mesh.position.y <= contatoY) {
                c.mesh.position.y = contatoY;

                // Se a rampa ainda está inclinada, aplica gravidade no Z (para escorregar)
                if (alturaRampa > alturaFim) {
                    c.vel.z += 0.25; // Rola com força rampa abaixo!
                    c.vel.y = 0;     // Desliza suave, não ressalta
                } else {
                    // Chegou ao chão plano cá fora
                    if (Math.abs(c.vel.y) < 0.3) c.vel.y = 0;
                    else c.vel.y *= -0.3;
                    c.vel.x *= 0.85;
                    c.vel.z *= 0.85; // Atrito normal para parar de rolar
                }
            }
        } else if (passouDaPorta) {
             // Caso a bola role para os lados depois de sair, assegura que assenta no chão exterior
             const contatoY = CHAO_EXTERIOR_Y + c.radius;
             if (c.mesh.position.y <= contatoY) {
                 c.mesh.position.y = contatoY;
                 if (Math.abs(c.vel.y) < 0.3) c.vel.y = 0;
                 else c.vel.y *= -0.3;
                 c.vel.x *= 0.85;
                 c.vel.z *= 0.85;
             }
        } else {
            // ── CHÃO NORMAL DE JOGO (Interior da máquina de vidro) ──────────
            if (c.mesh.position.y <= floorY) {
                c.mesh.position.y = floorY;

                if (Math.abs(c.vel.y) < 0.3) {
                    c.vel.y = 0;
                } else {
                    c.vel.y *= -0.5;
                }

                c.vel.x *= 0.85;
                c.vel.z *= 0.85;
            }
        }

        // ── Limites (Paredes da Máquina) ────────────────────────────────────
        // Só aplica as paredes de vidro se a cápsula estiver dentro da máquina (Z < PORTA_Z)
        if (c.mesh.position.z < PORTA_Z) {
            // Laterais Esquerda/Direita
            if (c.mesh.position.x > limitX)  { c.mesh.position.x =  limitX; c.vel.x *= -0.8; }
            if (c.mesh.position.x < -limitX) { c.mesh.position.x = -limitX; c.vel.x *= -0.8; }
            
            // Vidro Traseiro
            if (c.mesh.position.z < -limitZ) { c.mesh.position.z = -limitZ; c.vel.z *= -0.8; }
            
            // Vidro Frontal (Exceto na zona do corredor onde é suposto cair)
            if (c.mesh.position.z > limitZ && !xNoCorreder) {
                c.mesh.position.z = limitZ;
                c.vel.z *= -0.8;
            }
        }

        // --- Colisões com os vidros do buraco (Interior) ---
        const vidroX     = -4.3;
        const vidroZ     =  4.3;
        const topoVidroY = 24.1;

        if (c.mesh.position.y < topoVidroY && c.mesh.position.z < PORTA_Z) {
            if (c.mesh.position.x < vidroX + c.radius && c.mesh.position.z > vidroZ - c.radius) {
                if (c.mesh.position.x < vidroX && c.mesh.position.z > vidroZ) {
                    if (c.mesh.position.x > vidroX - c.radius) {
                        c.mesh.position.x = vidroX - c.radius;
                        c.vel.x *= -0.5;
                    }
                    if (c.mesh.position.z < vidroZ + c.radius) {
                        c.mesh.position.z = vidroZ + c.radius;
                        c.vel.z *= -0.5;
                    }
                } else {
                    const distParaX = (vidroX + c.radius) - c.mesh.position.x;
                    const distParaZ = c.mesh.position.z - (vidroZ - c.radius);

                    if (distParaX < distParaZ) {
                        c.mesh.position.x = vidroX + c.radius;
                        c.vel.x *= -0.6;
                    } else {
                        c.mesh.position.z = vidroZ - c.radius;
                        c.vel.z *= -0.6;
                    }
                }
            }
        }

        // Colisões entre esferas
        for (let j = i + 1; j < capsulas.length; j++) {
            const c2 = capsulas[j];
            if (c2.apanhada) continue;

            const dist    = c.mesh.position.distanceTo(c2.mesh.position);
            const minDist = c.radius + c2.radius;

            if (dist < minDist && dist > 0) {
                const direcao  = new THREE.Vector3().subVectors(c.mesh.position, c2.mesh.position).normalize();
                const overlap  = minDist - dist;
                const correcao = direcao.clone().multiplyScalar(overlap * 0.5);

                c.mesh.position.add(correcao);
                c2.mesh.position.sub(correcao);

                const relativeVel = new THREE.Vector3().subVectors(c.vel, c2.vel);
                const speed       = relativeVel.dot(direcao);

                if (speed < 0) {
                    const impulso = direcao.multiplyScalar(speed * 0.8);
                    c.vel.sub(impulso);
                    c2.vel.add(impulso);
                }
            }
        }

        // ESTADO DE REPOUSO (Sleep) para melhorar a performance
        if (Math.abs(c.vel.x) < 0.01) c.vel.x = 0;
        if (Math.abs(c.vel.y) < 0.01) c.vel.y = 0;
        if (Math.abs(c.vel.z) < 0.01) c.vel.z = 0;

        c.mesh.rotation.x += c.vel.z * 0.2;
        c.mesh.rotation.z -= c.vel.x * 0.2;
    }
}

// --- 4. LÓGICA DE MOVIMENTO E TECLADO ---
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


// --- 5. FUNÇÕES DE ANIMAÇÃO DA GARRA ---

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


// --- 6. CICLO DE ANIMAÇÃO PRINCIPAL ---
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

    updatePhysics();

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});