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
const numCapsulas = 100;
const capsulas = [];
const RAIO_CAPSULA = 1.5; 

for (let i = 0; i < numCapsulas; i++) {
    const { grupo } = criarCapsula();
    
    let posX, posZ;
    let caiuNoBuraco = true;

    // 2. LÓGICA DE SPAWN: Continua a sortear posições até encontrar uma fora do buraco
    while (caiuNoBuraco) {
        // Alarguei um pouco a área de spawn (de 16 para 19) para espalhar melhor pela máquina inteira
        posX = (Math.random() - 0.5) * 19; 
        posZ = (Math.random() - 0.5) * 19; 

        // Coordenadas aproximadas do buraco: X entre -11.5 e -4.0 | Z entre +4.0 e +11.5
        if (posX < -4.0 && posX > -11.5 && posZ > 4.0 && posZ < 11.5) {
            caiuNoBuraco = true; // Ops, ia cair no buraco! Tenta de novo.
        } else {
            caiuNoBuraco = false; // Posição segura e válida!
        }
    }
    
    // Aplica a posição segura que foi calculada
    grupo.position.set(
        posX, 
        22 + Math.random() * 12, // Aumentei um pouco a variação de altura para não colidirem todas ao mesmo tempo
        posZ
    );
    
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
    const floorY = 14.1 + RAIO_CAPSULA; 
    const limitX = 10; 
    const limitZ = 10; 
    
    for (let i = 0; i < capsulas.length; i++) {
        const c = capsulas[i];
        
        if (c.apanhada) continue; 

        c.vel.y += gravity;
        c.mesh.position.add(c.vel);
        
        // Resistência do ar básica
        c.vel.x *= 0.98;
        c.vel.z *= 0.98;

        // --- Colisões com o chão e Lógica do Buraco (Chute) ---
        if (c.mesh.position.y <= floorY) {
            let noBuraco = false;
            // Verifica se está na área do buraco
            if (c.mesh.position.x < -4.5 && c.mesh.position.x > -11.1 && c.mesh.position.z > 4.5 && c.mesh.position.z < 11.1) {
                noBuraco = true;
            }

            if (!noBuraco) {
                // Bateu no chão normal de jogo
                c.mesh.position.y = floorY;
                
                // 1. CORREÇÃO DO TREMOR Y: Se a força da queda for minúscula, não ressalta
                if (Math.abs(c.vel.y) < 0.3) {
                    c.vel.y = 0; 
                } else {
                    c.vel.y *= -0.5;
                }
                
                // 2. CORREÇÃO DO DESLIZE: Fricção extra quando toca no chão
                c.vel.x *= 0.85;
                c.vel.z *= 0.85;
            } else {
                // --- ESTÁ A CAIR PELO BURACO (RAMPA INVISÍVEL) ---
                
                // Calcula a altura do chão falso (rampa) baseada na posição Z da cápsula
                // Em Z = 4.5 (parte de trás do buraco) -> Altura = 13 (quase colado ao chão da máquina)
                // Em Z = 14.8 (junto à porta) -> Altura = 3.5 (fundo do cesto)
                const inicioZ = 4.5;
                const fimZ = 14.8;
                const alturaInicio = 13.0;
                const alturaFim = 3.5;
                
                // Calcula a inclinação
                const declive = (alturaInicio - alturaFim) / (fimZ - inicioZ);
                let alturaRampa = alturaInicio - (c.mesh.position.z - inicioZ) * declive;
                
                // O chão nunca pode ser mais fundo que o próprio cesto
                if (alturaRampa < alturaFim) alturaRampa = alturaFim;
                
                const contatoY = alturaRampa + c.radius;

                // Se a bola tenta cair abaixo da rampa, ela bate nela
                if (c.mesh.position.y < contatoY) {
                    c.mesh.position.y = contatoY; // Fica "apoiada" na rampa inclinada
                    
                    // Como a rampa é inclinada, a gravidade converte-se num empurrão para a frente (+Z)
                    if (c.mesh.position.z < 13.5) {
                        c.vel.z += 0.25; // Força forte a rolar rampa abaixo!
                    }
                    
                    // Amortece o impacto de queda
                    if (Math.abs(c.vel.y) < 0.3) {
                        c.vel.y = 0; 
                    } else {
                        c.vel.y *= -0.3;
                    }
                    
                    c.vel.x *= 0.8; // Fricção lateral para não bater tanto nas paredes do buraco
                }

                // Interação com a Porta Frontal
                // A porta agora está em Z = 14.8, a bola deteta-a mais à frente
                if (c.mesh.position.z > 12.0 && c.mesh.position.y < 8) {
                    
                    // A porta abre assim que a bola se aproxima
                    if (clawMachine.porta) {
                        clawMachine.porta.rotation.x = -Math.PI / 3.5; 
                    }

                    // Limite físico: pára a bola para ela ficar meio de fora na zona de recolha
                    // (z=13.8 garante que a bola não cai para o infinito fora da máquina)
                    if (c.mesh.position.z > 13.8) { 
                        c.mesh.position.z = 13.8; 
                        c.vel.z = 0;
                    } else {
                        // Ligeiro atrito a passar a porta
                        c.vel.z *= 0.95;
                    }
                }
            }
        }
        
        // Limites nas paredes laterais (Eixo X e Z)
        if (c.mesh.position.x > limitX) { c.mesh.position.x = limitX; c.vel.x *= -0.8; }
        if (c.mesh.position.x < -limitX) { c.mesh.position.x = -limitX; c.vel.x *= -0.8; }
        
        if (c.mesh.position.z > limitZ) { c.mesh.position.z = limitZ; c.vel.z *= -0.8; }
        if (c.mesh.position.z < -limitZ) { c.mesh.position.z = -limitZ; c.vel.z *= -0.8; }
        
        // --- Colisões com os vidros do buraco ---
        const vidroX = -4.3; 
        const vidroZ = 4.3;  
        const topoVidroY = 24.1; 

        if (c.mesh.position.y < topoVidroY) {
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
                } 
                else {
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

            const dist = c.mesh.position.distanceTo(c2.mesh.position);
            const minDist = c.radius + c2.radius;
            
            if (dist < minDist && dist > 0) {
                const direcao = new THREE.Vector3().subVectors(c.mesh.position, c2.mesh.position).normalize();
                const overlap = minDist - dist;
                const correcao = direcao.clone().multiplyScalar(overlap * 0.5);
                
                c.mesh.position.add(correcao);
                c2.mesh.position.sub(correcao);
                
                const relativeVel = new THREE.Vector3().subVectors(c.vel, c2.vel);
                const speed = relativeVel.dot(direcao);
                
                if (speed < 0) { 
                    const impulso = direcao.multiplyScalar(speed * 0.8); 
                    c.vel.sub(impulso);
                    c2.vel.add(impulso);
                }
            }
        }
        
        // 3. ESTADO DE REPOUSO (Sleep): Corta velocidades microscópicas para 0
        if (Math.abs(c.vel.x) < 0.01) c.vel.x = 0;
        if (Math.abs(c.vel.y) < 0.01) c.vel.y = 0;
        if (Math.abs(c.vel.z) < 0.01) c.vel.z = 0;
        
        // Agora só rodam se realmente tiverem velocidade
        c.mesh.rotation.x += c.vel.z * 0.2;
        c.mesh.rotation.z -= c.vel.x * 0.2;
    }
}

// --- 4. LÓGICA DE MOVIMENTO E TECLADO ---
const teclas = { up: false, down: false, left: false, right: false, action: false };
const velMovimento = 0.15;
const limites = { x: 9, z: 9 }; 

let estadoJogo = "LIVRE"; 
let timeAnim = 0;
let capsulaApanhada = null; 

// Escutar teclado
window.addEventListener('keydown', (e) => {
    if (estadoJogo !== "LIVRE") return; 

    if (e.key === 'ArrowUp') teclas.up = true;
    if (e.key === 'ArrowDown') teclas.down = true;
    if (e.key === 'ArrowLeft') teclas.left = true;
    if (e.key === 'ArrowRight') teclas.right = true;
    
    if (e.key === ' ' && estadoJogo === "LIVRE") {
        teclas.action = true;
        estadoJogo = "DESCENDO"; 
        setTimeout(() => teclas.action = false, 300); 
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
        // Rotação X negativa empurra os dedos para fora (Abre a garra)
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, -Math.PI / 6, 0.1);
    });
}

function fecharGarra() {
    clawMachine.dedos.forEach(dedo => {
        // Rotação X positiva puxa os dedos para dentro (Fecha a garra)
        dedo.rotation.x = THREE.MathUtils.lerp(dedo.rotation.x, Math.PI / 3, 0.1);
    });
}


// --- 6. CICLO DE ANIMAÇÃO PRINCIPAL ---
function animate(time) {
    requestAnimationFrame(animate);

    // 6.1 MOVIMENTO LIVRE (Input do Utilizador)
    if (estadoJogo === "LIVRE") {
        fecharGarra(); // A GARRA DESCANSA FECHADA AGORA

        if (teclas.up && clawMachine.mecanismoTeto.position.z > -limites.z) 
            clawMachine.mecanismoTeto.position.z -= velMovimento;
        if (teclas.down && clawMachine.mecanismoTeto.position.z < limites.z) 
            clawMachine.mecanismoTeto.position.z += velMovimento;
        if (teclas.left && clawMachine.mecanismoTeto.position.x > -limites.x) 
            clawMachine.mecanismoTeto.position.x -= velMovimento;
        if (teclas.right && clawMachine.mecanismoTeto.position.x < limites.x) 
            clawMachine.mecanismoTeto.position.x += velMovimento;
    }

    // --- ANIMAÇÃO DOS CONTROLES ---
    let targetRotX = 0;
    let targetRotZ = 0;
    if (teclas.up) targetRotX = -Math.PI / 8;    
    if (teclas.down) targetRotX = Math.PI / 8;   
    if (teclas.left) targetRotZ = Math.PI / 8;   
    if (teclas.right) targetRotZ = -Math.PI / 8; 

    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.x, targetRotX, 0.15);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(clawMachine.controles.joystick.rotation.z, targetRotZ, 0.15);

    let targetBtnY = teclas.action ? 0.45 : 0.65;
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(clawMachine.controles.botao.position.y, targetBtnY, 0.3);

    // 6.2 LÓGICA DA JOGADA AUTOMÁTICA
    
    if (estadoJogo === "DESCENDO") {
        abrirGarra(); // A GARRA ABRE ASSIM QUE COMEÇA A DESCER

        if (clawMachine.mecanismoCabo.position.y > -24.5) {
            clawMachine.mecanismoCabo.position.y -= 0.4;
        } else {
            estadoJogo = "FECHANDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "FECHANDO") {
        fecharGarra(); // FECHA PARA AGARRAR O PRÉMIO
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
        posTeto.z = THREE.MathUtils.lerp(posTeto.z, 9, 0.05);

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
            estadoJogo = "ABRINDO";
            timeAnim = 0;
        }
    }

    if (estadoJogo === "ABRINDO") {
        abrirGarra(); // ABRE PARA LARGAR O PRÉMIO
        timeAnim++;

        if (timeAnim === 20 && capsulaApanhada) {
            capsulaApanhada.apanhada = false;
            capsulaApanhada.vel.set(0, 0, 0); 
            capsulaApanhada = null;
        }

        if (timeAnim > 90) { 
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

    // Fecha a porta de saída suavemente (efeito de mola/gravidade)
    if (clawMachine.porta) {
        clawMachine.porta.rotation.x = THREE.MathUtils.lerp(clawMachine.porta.rotation.x, 0, 0.08);
    }

    controls.update(); 
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});