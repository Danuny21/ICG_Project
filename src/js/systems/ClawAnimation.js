import * as THREE from "three";

// Hole zone bounds (local claw machine space)
const HOLE_ZONE = { xMin: -11.5, xMax: -4.0, zMin: 4.0, zMax: 11.5 };
const CLAW_RADIUS = 3.8;

function collidesWithHole(x, z) {
    return (x + CLAW_RADIUS) > HOLE_ZONE.xMin && (x - CLAW_RADIUS) < HOLE_ZONE.xMax &&
           (z + CLAW_RADIUS) > HOLE_ZONE.zMin && (z - CLAW_RADIUS) < HOLE_ZONE.zMax;
}

function restClaw(clawMachine) {
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 3.2, 0.02);
    });
}

function openClaw(clawMachine) {
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -Math.PI / 2.2, 0.02);
    });
}

function closeClaw(clawMachine) {
    const closeAngle = window.CONFIG_JOGO ? window.CONFIG_JOGO.aberturaFecho : -Math.PI / 7;
    clawMachine.dedos.forEach(f => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, closeAngle, 0.02);
    });
}

export function updateClawAnimation(gameState, animTime, clawMachine, keys, limits, moveSpeed) {
    let newState = gameState;
    let newTime = animTime;

    if (newState !== "RETURN" && newState !== "ASCEND" && newState !== "IDLE") {
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, 0, 0.1);
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, 0, 0.1);
    }

    if (newState === "IDLE") {
        restClaw(clawMachine);

        const pos = clawMachine.mecanismoTeto.position;
        let dx = 0, dz = 0;
        if (keys.up)    dz -= 1;
        if (keys.down)  dz += 1;
        if (keys.left)  dx -= 1;
        if (keys.right) dx += 1;

        if (dx !== 0 && dz !== 0) {
            const len = Math.sqrt(dx * dx + dz * dz);
            dx /= len; dz /= len;
        }

        if (dz < 0) { const np = pos.z + dz * moveSpeed; if (np - CLAW_RADIUS > -limits.z) pos.z = np; }
        if (dz > 0) { const np = pos.z + dz * moveSpeed; if (np + CLAW_RADIUS < limits.z && !collidesWithHole(pos.x, np)) pos.z = np; }
        if (dx < 0) { const np = pos.x + dx * moveSpeed; if (np - CLAW_RADIUS > -limits.x && !collidesWithHole(np, pos.z)) pos.x = np; }
        if (dx > 0) { const np = pos.x + dx * moveSpeed; if (np + CLAW_RADIUS < limits.x) pos.x = np; }

        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, dz * 0.05, 0.1);
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, -dx * 0.05, 0.1);
    }

    // Joystick and button animation
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.x,
        keys.up ? -Math.PI / 8 : keys.down ? Math.PI / 8 : 0, 0.2);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        keys.left ? Math.PI / 8 : keys.right ? -Math.PI / 8 : 0, 0.2);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, keys.action ? 0.45 : 0.65, 0.3);

    if (newState === "DESCEND") {
        openClaw(clawMachine);
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.1;
        } else {
            newState = "GRAB";
            newTime = 0;
        }
    }

    if (newState === "GRAB") {
        closeClaw(clawMachine);
        newTime++;
        if (newTime > 150) newState = "ASCEND";
    }

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

    if (newState === "DROP") {
        openClaw(clawMachine);
        newTime++;
        if (newTime > 80) newState = "IDLE";
    }

    const cableLength = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, cableLength);

    return { newState, newTime };
}
