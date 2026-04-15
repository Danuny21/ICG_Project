import * as THREE from "three";

export function estadoRepousoGarra(clawMachine) {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 3.2, 0.05);
    });
}

export function abrirGarra(clawMachine) {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 2.2, 0.05);
    });
}

export function fecharGarra(clawMachine) {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 7, 0.05);
    });
}

export function updateClawAnimation(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento) {
    let novoEstado = estadoJogo;
    let novoTime = timeAnim;

    // Movimento livre (setas)
    if (novoEstado === "LIVRE") {
        estadoRepousoGarra(clawMachine);
        if (teclas.up    && clawMachine.mecanismoTeto.position.z > -limites.z) clawMachine.mecanismoTeto.position.z -= velMovimento;
        if (teclas.down  && clawMachine.mecanismoTeto.position.z <  limites.z) clawMachine.mecanismoTeto.position.z += velMovimento;
        if (teclas.left  && clawMachine.mecanismoTeto.position.x > -limites.x) clawMachine.mecanismoTeto.position.x -= velMovimento;
        if (teclas.right && clawMachine.mecanismoTeto.position.x <  limites.x) clawMachine.mecanismoTeto.position.x += velMovimento;
    }

    // Animação joystick / botão
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.x,
        teclas.up ? -Math.PI / 8 : teclas.down ? Math.PI / 8 : 0, 0.15);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        teclas.left ? Math.PI / 8 : teclas.right ? -Math.PI / 8 : 0, 0.15);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, teclas.action ? 0.45 : 0.65, 0.3);

    // ── A DESCER ─────────────────────────────────────────────────────────────────
    if (novoEstado === "A DESCER") {
        abrirGarra(clawMachine);
        // Alterado de -24.5 para -20.5 para a garra não descer tão fundo
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.4;
        } else {
            novoEstado = "A FECHAR";
            novoTime   = 0;
        }
    }

    // ── A FECHAR ─────────────────────────────────────────────────────────────────
    if (novoEstado === "A FECHAR") {
        fecharGarra(clawMachine);
        novoTime++;
        if (novoTime > 70) novoEstado = "A SUBIR";
    }

    // ── A SUBIR ──────────────────────────────────────────────────────────────────
    if (novoEstado === "A SUBIR") {
        fecharGarra(clawMachine);
        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.2;
        } else {
            novoEstado = "A REGRESSAR";
        }
    }

    // ── A REGRESSAR ───────────────────────────────────────────────────────────────
    if (novoEstado === "A REGRESSAR") {
        fecharGarra(clawMachine);
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.05);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z,  9.0, 0.05);

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
            novoEstado = "ABRINDO";
            novoTime   = 0;
        }
    }

    // ── ABRINDO (larga cápsula no buraco) ────────────────────────────────────────
    if (novoEstado === "ABRINDO") {
        abrirGarra(clawMachine);
        novoTime++;
        if (novoTime > 50) novoEstado = "LIVRE";
    }

    // Escalar cabo (animação visual)
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, dif);

    return { novoEstado, novoTime };
}
