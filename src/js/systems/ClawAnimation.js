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

    // Suaviza a rotação da garra de volta para 0 se não estiver a regressar nem a subir
    if (novoEstado !== "REGRESSAR" && novoEstado !== "SUBIR") {
        clawMachine.mecanismoGarra.rotation.z = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.z, 0, 0.1);
        clawMachine.mecanismoGarra.rotation.x = THREE.MathUtils.lerp(clawMachine.mecanismoGarra.rotation.x, 0, 0.1);
    }

    // Movimento livre (setas)
    if (novoEstado === "LIVRE") {
        estadoRepousoGarra(clawMachine);

        const pos = clawMachine.mecanismoTeto.position;

        if (teclas.up) {
            const novaPos = pos.z - velMovimento;
            // O buraco está à frente (Z positivo), logo mover para cima (Z negativo) está sempre a sair ou a afastar-se do buraco
            if (novaPos - RAIO_GARRA > -limites.z) {
                pos.z = novaPos;
            }
        }
        if (teclas.down) {
            const novaPos = pos.z + velMovimento;
            // Bloqueia apenas se estiver a ENTAR no buraco vindo de trás
            if (novaPos + RAIO_GARRA < limites.z && !colideComBuraco(pos.x, novaPos)) {
                pos.z = novaPos;
            }
        }
        if (teclas.left) {
            const novaPos = pos.x - velMovimento;
            // Bloqueia apenas se estiver a ENTRAR no buraco vindo da direita
            if (novaPos - RAIO_GARRA > -limites.x && !colideComBuraco(novaPos, pos.z)) {
                pos.x = novaPos;
            }
        }
        if (teclas.right) {
            const novaPos = pos.x + velMovimento;
            // O buraco está à esquerda (X negativo), logo mover para a direita (X positivo) é sempre sair do buraco
            if (novaPos + RAIO_GARRA < limites.x) {
                pos.x = novaPos;
            }
        }
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

    // A DESCER
    if (novoEstado === "DESCER") {
        abrirGarra(clawMachine);
        if (clawMachine.mecanismoCabo.position.y > -22) {
            clawMachine.mecanismoCabo.position.y -= 0.15;
        } else {
            novoEstado = "FECHAR";
            novoTime = 0;
        }
    }

    // A FECHAR
    if (novoEstado === "FECHAR") {
        fecharGarra(clawMachine);
        novoTime++;
        if (novoTime > 140) novoEstado = "SUBIR";
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
            clawMachine.mecanismoCabo.position.y += 0.1;
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
        if (novoTime > 100) novoEstado = "LIVRE";
    }

    // Escalar cabo (animação visual)
    const dif = Math.abs(clawMachine.mecanismoCabo.position.y);
    clawMachine.cabo.scale.y = Math.max(0.1, dif);

    return { novoEstado, novoTime };
}
