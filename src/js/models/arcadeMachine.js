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
    shape.lineTo(depth, height); // Topo do letreiro
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

    // --- Frente Inferior (Painel preto) ---
    const lowerFront = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.1, height * 0.6, 0.1),
        blackMat
    );
    lowerFront.position.set(0, height * 0.3, depth - 0.05);
    arcadeGroup.add(lowerFront);

    // --- Painel de Controlo ---
    const controlPanel = new THREE.Group();

    // Base do painel
    const cpBase = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.1, 0.2, depth * 0.4),
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

    // CORREÇÃO 2: Posição e rotação exatas para seguir a linha do extrude
    controlPanel.position.set(0, height * 0.62, depth * 0.88);
    controlPanel.rotation.x = Math.PI * 0.15;
    arcadeGroup.add(controlPanel);

    // --- Ecrã (Recuado) ---
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.3, height * 0.25, 0.1),
        screenMat
    );
    // CORREÇÃO 3: Assentar o ecrã precisamente no buraco do shape
    screen.position.set(0, height * 0.8, depth * 0.68);
    screen.rotation.x = -Math.PI * 0.05;
    arcadeGroup.add(screen);

    // --- Letreiro (Marquee) no Topo ---
    const marqueeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffcc,
        emissiveIntensity: 0.5
    });
    const marquee = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.1, 0.6, 0.1),
        marqueeMat
    );
    // CORREÇÃO 4: Seguir a inclinação do painel superior
    marquee.position.set(0, height * 0.95, depth * 0.85);
    marquee.rotation.x = -Math.PI * 0.12;
    arcadeGroup.add(marquee);

    // O pivot está agora centrado na base (X = 0, Y = 0, Z a partir das costas da máquina).
    // Removi o ajuste forçado do pivot no final para ser mais fácil de posicionares na cena!

    return arcadeGroup;
}