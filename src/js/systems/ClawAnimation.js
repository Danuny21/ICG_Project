import * as THREE from "three";

export function estadoRepousoGarra(clawMachine) {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 3.2, 0.02);
    });
}

export function abrirGarra(clawMachine) {
    clawMachine.dedos.forEach(d => {
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, -Math.PI / 2.2, 0.02);
    });
}

export function fecharGarra(clawMachine) {
    const abertFecho = window.CONFIG_JOGO ? window.CONFIG_JOGO.aberturaFecho : -Math.PI / 7;

    clawMachine.dedos.forEach(d => {
        // -Math.PI / 5.5 deixa a garra ligeiramente mais aberta que / 7
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, abertFecho, 0.02);
    });
}

export function updateClawAnimation(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento) {
    let novoEstado = estadoJogo;
    let novoTime = timeAnim;

    // Suaviza a rotação da garra de volta para 0 se não estiver a regressar nem a subir
    if (novoEstado !== "A REGRESSAR" && novoEstado !== "A SUBIR") {
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, 0, 0.1);
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, 0, 0.1);
    }

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
        teclas.up ? -Math.PI / 8 : teclas.down ? Math.PI / 8 : 0, 0.02);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        teclas.left ? Math.PI / 8 : teclas.right ? -Math.PI / 8 : 0, 0.02);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, teclas.action ? 0.45 : 0.65, 0.3);

    // ── A DESCER ─────────────────────────────────────────────────────────────────
    if (novoEstado === "A DESCER") {
        abrirGarra(clawMachine);
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.15;
        } else {
            novoEstado = "A FECHAR";
            novoTime   = 0;
        }
    }

    // ── A FECHAR ─────────────────────────────────────────────────────────────────
    if (novoEstado === "A FECHAR") {
        fecharGarra(clawMachine);
        novoTime++;
        if (novoTime > 140) novoEstado = "A SUBIR";
    }

    // ── A SUBIR ──────────────────────────────────────────────────────────────────
    if (novoEstado === "A SUBIR") {
        fecharGarra(clawMachine);
        
        // Tremor para simular vida real também na subida
        const abano = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;

        const tremorTempo = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(tremorTempo) * abano;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(tremorTempo * 1.5) * abano;

        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.1;
        } else {
            novoEstado = "A REGRESSAR";
        }
    }

    // ── A REGRESSAR ───────────────────────────────────────────────────────────────
    if (novoEstado === "A REGRESSAR") {
        fecharGarra(clawMachine);
        const posTeto = clawMachine.mecanismoTeto.position;
        // Tornou-se ainda mais lento (de 0.02 para 0.01)
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.01);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z,  9.0, 0.01);

        // Abanar a garra para parecer vida real
        const abano = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;

        const tremorTempo = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(tremorTempo) * abano;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(tremorTempo * 1.5) * abano;

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 9) < 0.3) {
            novoEstado = "ABRINDO";
            novoTime   = 0;
        }
    }

    // ── ABRINDO (larga cápsula no buraco) ────────────────────────────────────────
    if (novoEstado === "ABRINDO") {
        abrirGarra(clawMachine);
        novoTime++;
        if (novoTime > 100) novoEstado = "LIVRE";
    }

    // Escalar cabo (animação visual)
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, dif);

    return { novoEstado, novoTime };
}
