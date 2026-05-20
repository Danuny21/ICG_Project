import * as THREE from "three";


const HOLE_ZONE = { xMin: -11.5, xMax: -4.0, zMin: 4.0, zMax: 11.5 };
const CLAW_RADIUS = 3.8;

// Checka se a posição (x,z) da garra colide com a zona do buraco
function collidesWithHole(x, z) {
    return (x + CLAW_RADIUS) > HOLE_ZONE.xMin && (x - CLAW_RADIUS) < HOLE_ZONE.xMax &&
           (z + CLAW_RADIUS) > HOLE_ZONE.zMin && (z - CLAW_RADIUS) < HOLE_ZONE.zMax;
}

// Por na posição de descanso
function restClaw(clawMachine) {
    clawMachine.fingers.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 3.2, 0.02);
    });
}

// Abrir a garra (para descer)
function openClaw(clawMachine) {
    clawMachine.fingers.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 2.2, 0.02);
    });
}

// Fechar a garra (depende da dificuldade)
function closeClaw(clawMachine) {
    const closeAngle = window.CONFIG_JOGO ? window.CONFIG_JOGO.gripRotation : -Math.PI / 7;
    clawMachine.fingers.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, closeAngle, 0.02);
    });
}

// Função principal
// Estados: IDLE → DESCEND → GRAB → ASCEND → RETURN → DROP → IDLE
export function updateClawAnimation(gameState, animTime, clawMachine, keys, limits, moveSpeed) {
    let newState = gameState;
    let newTime = animTime;

    // Se não estiver a descer, subir ou retornar, a garra volta à posição de descanso e pode ser movida
    if (newState !== "RETURN" && newState !== "ASCEND" && newState !== "IDLE") {
        clawMachine.clawMechanism.rotation.z = THREE.MathUtils.lerp(clawMachine.clawMechanism.rotation.z, 0, 0.1);
        clawMachine.clawMechanism.rotation.x = THREE.MathUtils.lerp(clawMachine.clawMechanism.rotation.x, 0, 0.1);
    }

    // IDLE: pode mover a garra com as setas ou WASD
    if (newState === "IDLE") {
        restClaw(clawMachine);

        // Move a garra com as setas ou WASD
        const pos = clawMachine.roofMechanism.position;
        let dx = 0, dz = 0;
        if (keys.up)    dz -= 1;
        if (keys.down)  dz += 1;
        if (keys.left)  dx -= 1;
        if (keys.right) dx += 1;

        // Normalizar movimento diagonal
        if (dx !== 0 && dz !== 0) {
            const len = Math.sqrt(dx * dx + dz * dz);
            dx /= len; dz /= len;
        }

        // Applicar movimento com limites e colisão com o buraco
        if (dz < 0) { const np = pos.z + dz * moveSpeed; if (np - CLAW_RADIUS > -limits.z) pos.z = np; }
        if (dz > 0) { const np = pos.z + dz * moveSpeed; if (np + CLAW_RADIUS < limits.z && !collidesWithHole(pos.x, np)) pos.z = np; }
        if (dx < 0) { const np = pos.x + dx * moveSpeed; if (np - CLAW_RADIUS > -limits.x && !collidesWithHole(np, pos.z)) pos.x = np; }
        if (dx > 0) { const np = pos.x + dx * moveSpeed; if (np + CLAW_RADIUS < limits.x) pos.x = np; }

        // Anima a garra pa rodar um pouco na direção do movimento
        clawMachine.clawMechanism.rotation.x = THREE.MathUtils.lerp(clawMachine.clawMechanism.rotation.x, dz * 0.05, 0.1);
        clawMachine.clawMechanism.rotation.z = THREE.MathUtils.lerp(clawMachine.clawMechanism.rotation.z, -dx * 0.05, 0.1);
    }

    // Animar o joystick
    clawMachine.controls.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controls.joystick.rotation.x,
        keys.up ? -Math.PI / 8 : keys.down ? Math.PI / 8 : 0, 0.2);

    clawMachine.controls.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controls.joystick.rotation.z,
        keys.left ? Math.PI / 8 : keys.right ? -Math.PI / 8 : 0, 0.2);

    // Animar o botão
    clawMachine.controls.button.position.y = THREE.MathUtils.lerp(
        clawMachine.controls.button.position.y, keys.action ? 0.45 : 0.65, 0.3);

    // DESCEND: cabo desce e a garra abre
    if (newState === "DESCEND") {
        openClaw(clawMachine);
        if (clawMachine.cableMechanism.position.y > -22) {
            clawMachine.cableMechanism.position.y -= 0.1;
        } else {
            newState = "GRAB";
            newTime = 0;
        }
    }

    // GRAB: a garra fecha, espera e volta ao topo
    if (newState === "GRAB") {
        closeClaw(clawMachine);
        newTime++;
        if (newTime > 150) newState = "ASCEND";
    }

    // ASCEND: A garra sobe com shake e via para o buraco
    if (newState === "ASCEND") {
        closeClaw(clawMachine);
        const shake = window.CONFIG_JOGO ? window.CONFIG_JOGO.shake : 0.02;
        const t = Date.now() * 0.01;
        clawMachine.clawMechanism.rotation.z = Math.sin(t) * shake;
        clawMachine.clawMechanism.rotation.x = Math.cos(t * 1.5) * shake;

        if (clawMachine.cableMechanism.position.y < -4) {
            clawMachine.cableMechanism.position.y += 0.08;
        } else {
            newState = "RETURN";
        }
    }

    // RETURN: A garra vai para o buraco
    if (newState === "RETURN") {
        closeClaw(clawMachine);
        const pos = clawMachine.roofMechanism.position;
        pos.x = THREE.MathUtils.lerp(pos.x, -7.8, 0.01);
        pos.z = THREE.MathUtils.lerp(pos.z, 7.5, 0.01);

        const shake = window.CONFIG_JOGO ? window.CONFIG_JOGO.shake : 0.02;
        const t = Date.now() * 0.01;
        clawMachine.clawMechanism.rotation.z = Math.sin(t) * shake;
        clawMachine.clawMechanism.rotation.x = Math.cos(t * 1.5) * shake;

        if (Math.abs(pos.x - (-7.8)) < 0.3 && Math.abs(pos.z - 7.5) < 0.3) {
            newState = "DROP";
            newTime = 0;
        }
    }

    // DROP: a garra abre e depois volta po idle
    if (newState === "DROP") {
        openClaw(clawMachine);
        newTime++;
        if (newTime > 80) newState = "IDLE";
    }

    // Altera o tamanho do cabo conforme a posição da garra
    const cableLength = Math.abs(clawMachine.cableMechanism.position.y);
    clawMachine.cable.scale.y = Math.max(0.1, cableLength);

    return { newState, newTime };
}
