import * as THREE from 'three';

export function createArcadeMachine(mainColor = 0x3366ff) {
    const arcadeGroup = new THREE.Group();
    arcadeGroup.name = "ArcadeMachine";

    // Materiais
    const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Ecrã desligado
    const controlPanelMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 });

    // Dimensões base
    const width = 2.5;
    const height = 6.0;
    const depth = 2.5;

    // --- Corpo Principal (Estrutura lateral) ---
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(depth, 0);
    shape.lineTo(depth, height * 0.6); // Fim da frente vertical
    shape.lineTo(depth * 0.7, height * 0.7); // Inclinação do painel
    shape.lineTo(depth * 0.7, height * 0.9); // Recuo do ecrã
    // Paralelepípedo no topo para o letreiro
    shape.lineTo(depth, height * 0.9); // Base do paralelepípedo (avanço para a frente)
    shape.lineTo(depth, height); // Topo do letreiro (face vertical)
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    const extrudeSettings = { depth: width, bevelEnabled: false };
    const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // CORREÇÃO 1: Centrar a geometria no eixo antes de rodar a mesh
    // Isto garante que o corpo principal fica no X=0 como o resto das peças
    bodyGeom.translate(0, 0, -width / 2);

    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.y = -Math.PI / 2;
    arcadeGroup.add(body);

    // (Sólido preto frontal removido)

    // --- Painel de Controlo ---
    const controlPanel = new THREE.Group();

    // Base do painel (Profundidade reduzida para 0.85 para não sair das bordas)
    const cpBase = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.15, 0.2, 0.85),
        controlPanelMat
    );
    controlPanel.add(cpBase);

    // Joystick 
    const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3),
        blackMat
    );
    stick.position.set(-0.6, 0.2, 0);
    controlPanel.add(stick);

    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    ball.position.set(-0.6, 0.35, 0);
    controlPanel.add(ball);

    // Botões
    const buttonGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.05);
    const redBtnMat = new THREE.MeshStandardMaterial({ color: 0xee2222 });
    const blueBtnMat = new THREE.MeshStandardMaterial({ color: 0x2222ee });

    const btn1 = new THREE.Mesh(buttonGeom, redBtnMat);
    btn1.position.set(0.2, 0.1, -0.1);
    controlPanel.add(btn1);

    const btn2 = new THREE.Mesh(buttonGeom, redBtnMat);
    btn2.position.set(0.5, 0.1, -0.1);
    controlPanel.add(btn2);

    const btn3 = new THREE.Mesh(buttonGeom, blueBtnMat);
    btn3.position.set(0.35, 0.1, 0.1);
    controlPanel.add(btn3);

    // CORREÇÃO 2: Posição e rotação exatas para o segmento do extrude
    // Afundado ligeiramente para dentro da máquina (Y=3.86, Z=2.09)
    controlPanel.position.set(0, 3.86, 2.09);
    controlPanel.rotation.x = 0.674;
    arcadeGroup.add(controlPanel);

    // --- Ecrã (Recuado) ---
    // Altura exata do segmento vertical = 1.2
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.3, 1.2, 0.1),
        screenMat
    );
    // CORREÇÃO 3: Assentar o ecrã precisamente no buraco do shape
    // Deslocado 0.05 (metade de 0.1) ao longo da normal (+Z)
    screen.position.set(0, 4.8, 1.80);
    screen.rotation.x = 0;
    arcadeGroup.add(screen);

    // --- Letreiro (Marquee) no Topo ---
    const marqueeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffcc,
        emissiveIntensity: 0.5
    });
    const marquee = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.1, 0.6, 0.1), // Altura vertical da face = 0.6
        marqueeMat
    );
    // CORREÇÃO 4: Seguir a face vertical do novo paralelepípedo superior
    // Face em Z = 2.5, Y de 5.4 a 6.0. Midpoint: Y = 5.7.
    marquee.position.set(0, 5.7, 2.55);
    marquee.rotation.x = 0; // Vertical
    arcadeGroup.add(marquee);

    // O pivot está agora centrado na base (X = 0, Y = 0, Z a partir das costas da máquina).
    // Removi o ajuste forçado do pivot no final para ser mais fácil de posicionares na cena!

    return arcadeGroup;
}