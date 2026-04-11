import * as THREE from "three";

// Constantes da física e colisões
export const RAIO_CAPSULA = 1.5;
export const CHAO_EXTERIOR_Y = 0;
export const PORTA_Z = 11.5;
export const PORTA_ALTURA = 8.0;
export const PORTA_ABERTURA_MAX = -Math.PI / 2.2;
const PORTA_SPRING = 0.04;
const PORTA_DAMPING = 0.80;

let portaVelAngular = 0;

export function updatePhysics(capsulas, clawMachine) {
    const gravity = -0.15;
    const floorY = 14.1 + RAIO_CAPSULA;
    const limitX = 10;
    const limitZ = 10;

    // Constantes do corredor de saída
    const CHUTE_X_MIN = -11.1;
    const CHUTE_X_MAX = -4.5;
    const BURACO_Z_MIN = 4.5;

    // Física da porta (mola)
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

        // Interação com a porta
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

        // Chão e lógica do buraco/rampa
        
        // Se a cápsula está no canal de saída (passou para trás do vidro do buraco)
        const noBuracoOuSaida = xNoCorreder && c.mesh.position.z > BURACO_Z_MIN;
        const passouDaPorta = c.mesh.position.z >= PORTA_Z;

        if (noBuracoOuSaida) {
            // Rampa contínua do buraco até cá fora
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

                // Se a rampa ainda está inclinada, aplica gravidade no Z
                if (alturaRampa > alturaFim) {
                    c.vel.z += 0.25; // Rola rampa abaixo
                    c.vel.y = 0;     // Desliza suave
                } else {
                    // Chegou ao chão plano cá fora
                    if (Math.abs(c.vel.y) < 0.3) c.vel.y = 0;
                    else c.vel.y *= -0.3;
                    c.vel.x *= 0.85;
                    c.vel.z *= 0.85; // Atrito normal
                }
            }
        } else if (passouDaPorta) {
             // Caso a bola role para os lados depois de sair, assenta no chão exterior
             const contatoY = CHAO_EXTERIOR_Y + c.radius;
             if (c.mesh.position.y <= contatoY) {
                 c.mesh.position.y = contatoY;
                 if (Math.abs(c.vel.y) < 0.3) c.vel.y = 0;
                 else c.vel.y *= -0.3;
                 c.vel.x *= 0.85;
                 c.vel.z *= 0.85;
             }
        } else {
            // Chão normal de jogo (interior)
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

        // Limites (paredes da máquina)
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

        // Colisões com os vidros do buraco (interior)
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

        // Estado de repouso (sleep)
        if (Math.abs(c.vel.x) < 0.01) c.vel.x = 0;
        if (Math.abs(c.vel.y) < 0.01) c.vel.y = 0;
        if (Math.abs(c.vel.z) < 0.01) c.vel.z = 0;

        c.mesh.rotation.x += c.vel.z * 0.2;
        c.mesh.rotation.z -= c.vel.x * 0.2;
    }
}
