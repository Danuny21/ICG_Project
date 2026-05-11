import * as THREE from "three";

// Zona do buraco de saída (coordenadas locais da máquina) — a garra não pode entrar aqui
const HOLE_ZONE = { xMin: -11.5, xMax: -4.0, zMin: 4.0, zMax: 11.5 };
const CLAW_RADIUS = 3.8; // Raio de colisão da garra para deteção do buraco

// Verifica se a garra colide com a zona do buraco de saída
function collidesWithHole(x, z) {
    return (x + CLAW_RADIUS) > HOLE_ZONE.xMin && (x - CLAW_RADIUS) < HOLE_ZONE.xMax &&
           (z + CLAW_RADIUS) > HOLE_ZONE.zMin && (z - CLAW_RADIUS) < HOLE_ZONE.zMax;
}

// Coloca os dedos da garra em posição de repouso (semi-aberta)
function restClaw(clawMachine) {
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 3.2, 0.02);
    });
}

// Abre os dedos da garra completamente (para descer)
function openClaw(clawMachine) {
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 2.2, 0.02);
    });
}

// Fecha os dedos da garra (ângulo depende da dificuldade configurada)
function closeClaw(clawMachine) {
    const closeAngle = window.CONFIG_JOGO ? window.CONFIG_JOGO.aberturaFecho : -Math.PI / 7;
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, closeAngle, 0.02);
    });
}

// Função principal de atualização da animação da garra, chamada a cada frame.
// Gere a máquina de estados: IDLE → DESCEND → GRAB → ASCEND → RETURN → DROP → IDLE
export function updateClawAnimation(gameState, animTime, clawMachine, keys, limits, moveSpeed) {
    let newState = gameState;
    let newTime = animTime;

    // Endireita o mecanismo da garra quando não está a subir/regressar
    if (newState !== "RETURN" && newState !== "ASCEND" && newState !== "IDLE") {
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, 0, 0.1);
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, 0, 0.1);
    }

    if (newState === "IDLE") {
        restClaw(clawMachine);

        // Move a garra com base nas teclas premidas (setas ou WASD)
        const pos = clawMachine.mecanismoTeto.position;
        let dx = 0, dz = 0;
        if (keys.up)    dz -= 1;
        if (keys.down)  dz += 1;
        if (keys.left)  dx -= 1;
        if (keys.right) dx += 1;

        // Normaliza o movimento diagonal para evitar velocidade superior em diagonal
        if (dx !== 0 && dz !== 0) {
            const len = Math.sqrt(dx * dx + dz * dz);
            dx /= len; dz /= len;
        }

        // Aplica o movimento com verificação de limites e colisão com o buraco
        if (dz < 0) { const np = pos.z + dz * moveSpeed; if (np - CLAW_RADIUS > -limits.z) pos.z = np; }
        if (dz > 0) { const np = pos.z + dz * moveSpeed; if (np + CLAW_RADIUS < limits.z && !collidesWithHole(pos.x, np)) pos.z = np; }
        if (dx < 0) { const np = pos.x + dx * moveSpeed; if (np - CLAW_RADIUS > -limits.x && !collidesWithHole(np, pos.z)) pos.x = np; }
        if (dx > 0) { const np = pos.x + dx * moveSpeed; if (np + CLAW_RADIUS < limits.x) pos.x = np; }

        // Inclina o mecanismo da garra ligeiramente na direção do movimento (efeito visual)
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, dz * 0.05, 0.1);
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, -dx * 0.05, 0.1);
    }

    // Anima o joystick e o botão na máquina para dar feedback visual ao jogador
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.x,
        keys.up ? -Math.PI / 8 : keys.down ? Math.PI / 8 : 0, 0.2);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        keys.left ? Math.PI / 8 : keys.right ? -Math.PI / 8 : 0, 0.2);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, keys.action ? 0.45 : 0.65, 0.3);

    // DESCIDA: o cabo desce até ao fundo
    if (newState === "DESCEND") {
        openClaw(clawMachine);
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.1;
        } else {
            newState = "GRAB";
            newTime = 0;
        }
    }

    // AGARRE: a garra fecha e espera alguns frames antes de subir
    if (newState === "GRAB") {
        closeClaw(clawMachine);
        newTime++;
        if (newTime > 150) newState = "ASCEND";
    }

    // SUBIDA: o cabo sobe com um efeito de balanço (intensidade depende da dificuldade)
    if (newState === "ASCEND") {
        closeClaw(clawMachine);
        const shake = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;
        const t = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(t) * shake;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(t * 1.5) * shake;

        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.08;
        } else {
            newState = "RETURN";
        }
    }

    // REGRESSO: a garra move-se horizontalmente para a posição de largada
    if (newState === "RETURN") {
        closeClaw(clawMachine);
        const pos = clawMachine.mecanismoTeto.position;
        pos.x = THREE.MathUtils.lerp(pos.x, -7.8, 0.01);
        pos.z = THREE.MathUtils.lerp(pos.z, 7.5, 0.01);

        const shake = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;
        const t = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(t) * shake;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(t * 1.5) * shake;

        if (Math.abs(pos.x - (-7.8)) < 0.3 && Math.abs(pos.z - 7.5) < 0.3) {
            newState = "DROP";
            newTime = 0;
        }
    }

    // LARGADA: a garra abre e aguarda antes de voltar ao estado IDLE
    if (newState === "DROP") {
        openClaw(clawMachine);
        newTime++;
        if (newTime > 80) newState = "IDLE";
    }

    // Ajusta o comprimento visual do cabo com base na posição do mecanismo
    const cableLength = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, cableLength);

    return { newState, newTime };
}
