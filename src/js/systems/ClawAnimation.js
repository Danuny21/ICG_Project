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
        d.rotation.x = THREE.MathUtils.lerp(d.rotation.x, abertFecho, 0.02);
    });
}

// Define os limites da moldura do buraco 
const ZONA_BURACO = {
    xMin: -11.5,
    xMax: -4.0,
    zMin: 4.0,
    zMax: 11.5
};

// Estimativa do raio máximo da garra
const RAIO_GARRA = 3.8;

function colideComBuraco(x, z) {
    const clawXMin = x - RAIO_GARRA;
    const clawXMax = x + RAIO_GARRA;
    const clawZMin = z - RAIO_GARRA;
    const clawZMax = z + RAIO_GARRA;

    return clawXMax > ZONA_BURACO.xMin && clawXMin < ZONA_BURACO.xMax &&
        clawZMax > ZONA_BURACO.zMin && clawZMin < ZONA_BURACO.zMax;
}

export function atualizarAnimacaoGarra(estadoJogo, timeAnim, clawMachine, teclas, limites, velMovimento) {
    let novoEstado = estadoJogo;
    let novoTime = timeAnim;

    // Suaviza a rotação da garra de volta para 0 se não estiver a regressar, a subir, nem livre a andar
    if (novoEstado !== "REGRESSAR" && novoEstado !== "SUBIR" && novoEstado !== "LIVRE") {
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, 0, 0.1);
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, 0, 0.1);
    }

    // Movimento livre (setas)
    if (novoEstado === "LIVRE") {
        estadoRepousoGarra(clawMachine);

        const pos = clawMachine.mecanismoTeto.position;
        let dx = 0;
        let dz = 0;

        if (teclas.up) dz -= 1;
        if (teclas.down) dz += 1;
        if (teclas.left) dx -= 1;
        if (teclas.right) dx += 1;

        // Normalização diagonal
        if (dx !== 0 && dz !== 0) {
            const length = Math.sqrt(dx * dx + dz * dz);
            dx /= length;
            dz /= length;
        }

        if (dz < 0) { // UP
            const novaPos = pos.z + dz * velMovimento;
            if (novaPos - RAIO_GARRA > -limites.z) pos.z = novaPos;
        }
        if (dz > 0) { // DOWN
            const novaPos = pos.z + dz * velMovimento;
            if (novaPos + RAIO_GARRA < limites.z && !colideComBuraco(pos.x, novaPos)) pos.z = novaPos;
        }
        if (dx < 0) { // LEFT
            const novaPos = pos.x + dx * velMovimento;
            if (novaPos - RAIO_GARRA > -limites.x && !colideComBuraco(novaPos, pos.z)) pos.x = novaPos;
        }
        if (dx > 0) { // RIGHT
            const novaPos = pos.x + dx * velMovimento;
            if (novaPos + RAIO_GARRA < limites.x) pos.x = novaPos;
        }

        // Abanar a garra levemente com a inércia do movimento
        const targetRotX = dz * 0.05;
        const targetRotZ = -dx * 0.05;
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, targetRotX, 0.1);
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, targetRotZ, 0.1);
    }

    // Animação joystick / botão (mais snappy: 0.2 em vez de 0.02)
    clawMachine.controles.joystick.rotation.x = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.x,
        teclas.up ? -Math.PI / 8 : teclas.down ? Math.PI / 8 : 0, 0.2);
    clawMachine.controles.joystick.rotation.z = THREE.MathUtils.lerp(
        clawMachine.controles.joystick.rotation.z,
        teclas.left ? Math.PI / 8 : teclas.right ? -Math.PI / 8 : 0, 0.2);
    clawMachine.controles.botao.position.y = THREE.MathUtils.lerp(
        clawMachine.controles.botao.position.y, teclas.action ? 0.45 : 0.65, 0.3);

    // A DESCER
    if (novoEstado === "DESCER") {
        abrirGarra(clawMachine);
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.1; // Reduzido para ser mais lento
        } else {
            novoEstado = "FECHAR";
            novoTime = 0;
        }
    }

    // A FECHAR
    if (novoEstado === "FECHAR") {
        fecharGarra(clawMachine);
        novoTime++;
        if (novoTime > 150) novoEstado = "SUBIR"; // Aumentado para dar peso
    }

    // A SUBIR
    if (novoEstado === "SUBIR") {
        fecharGarra(clawMachine);

        // Tremor para simular vida real também na subida
        const abano = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;

        const tremorTempo = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(tremorTempo) * abano;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(tremorTempo * 1.5) * abano;

        if (clawMachine.mecanismoCabo.position.y < -4) {
            clawMachine.mecanismoCabo.position.y += 0.08; // Reduzido para ser mais lento
        } else {
            novoEstado = "REGRESSAR";
        }
    }

    // A REGRESSAR
    if (novoEstado === "REGRESSAR") {
        fecharGarra(clawMachine);
        const posTeto = clawMachine.mecanismoTeto.position;
        posTeto.x = THREE.MathUtils.lerp(posTeto.x, -7.8, 0.01);
        posTeto.z = THREE.MathUtils.lerp(posTeto.z, 7.5, 0.01);

        const abano = window.CONFIG_JOGO ? window.CONFIG_JOGO.abano : 0.02;

        const tremorTempo = Date.now() * 0.01;
        clawMachine.mecanismoGarra.rotation.z = Math.sin(tremorTempo) * abano;
        clawMachine.mecanismoGarra.rotation.x = Math.cos(tremorTempo * 1.5) * abano;

        if (Math.abs(posTeto.x - (-7.8)) < 0.3 && Math.abs(posTeto.z - 7.5) < 0.3) {
            novoEstado = "ABRIR";
            novoTime = 0;
        }
    }

    // ABRIR (largar cápsula no buraco)
    if (novoEstado === "ABRIR") {
        abrirGarra(clawMachine);
        novoTime++;
        if (novoTime > 80) novoEstado = "LIVRE"; // Aumentado para ser mais lento
    }

    // Escalar cabo (animação visual)
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, dif);

    return { novoEstado, novoTime };
}
