import * as THREE from 'three';
import { loadTextureSet } from "../systems/TextureLoader.js";

export function createArcadeMachine(mainColor = 0x3366ff, machineIndex = 0) {
    const arcadeGroup = new THREE.Group();
    arcadeGroup.name = "ArcadeMachine";

    // Materiais
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: mainColor, 
        roughness: 0.4,
        metalness: 0.3
    });

    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    // Ecrã que brilha à noite com a cor da máquina
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: mainColor,
        emissiveIntensity: 0
    });
    const controlPanelMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 });

    // Dimensões base
    const width = 2.5;
    const height = 6.0;
    const depth = 2.5;

    // Corpo Principal
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(depth, 0);
    shape.lineTo(depth, height * 0.6);           // Fim da frente vertical
    shape.lineTo(depth * 0.7, height * 0.7);     // Inclinação do painel
    shape.lineTo(depth * 0.7, height * 0.9);     // Recuo do ecrã
    shape.lineTo(depth, height * 0.9);           // Base do paralelepípedo
    shape.lineTo(depth, height);                 // Topo do letreiro
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    const extrudeSettings = { depth: width, bevelEnabled: false };
    const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    bodyGeom.translate(0, 0, -width / 2);

    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.y = -Math.PI / 2;
    arcadeGroup.add(body);

    // Painel de Controlo
    const controlPanel = new THREE.Group();

    const cpBase = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.15, 0.2, 0.85),
        controlPanelMat
    );
    controlPanel.add(cpBase);

    // Haste do joystick
    const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3),
        blackMat
    );
    stick.position.set(-0.6, 0.2, 0);
    controlPanel.add(stick);

    // Bola do joystick
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

    // Base dos botões
    controlPanel.position.set(0, 3.86, 2.09);
    controlPanel.rotation.x = 0.674;
    arcadeGroup.add(controlPanel);

    // Ecrã
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.3, 1.2, 0.1),
        screenMat
    );
    screen.position.set(0, 4.8, 1.80);
    screen.rotation.x = 0;
    arcadeGroup.add(screen);

    // Letreiro
    const marqueeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffcc,
        emissiveIntensity: 0.5
    });
    const marquee = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.1, 0.6, 0.1),
        marqueeMat
    );
    marquee.position.set(0, 5.7, 2.55);
    marquee.rotation.x = 0;
    arcadeGroup.add(marquee);

    // PointLight do Ecrã 
    const screenLight = new THREE.PointLight(mainColor, 0, 15);
    screenLight.position.set(0, 4.8, 2.5);
    arcadeGroup.add(screenLight);

    return {
        group: arcadeGroup,
        screenMat,
        marqueeMat,
        screenLight,
        updateTheme: (theme) => { // Atualiza as cores do ecrã e letreiro para brilhar com a cor da máquina
            if (theme.ARCADE_COLORS && theme.ARCADE_COLORS[machineIndex % theme.ARCADE_COLORS.length] !== undefined) {
                bodyMat.color.setHex(theme.ARCADE_COLORS[machineIndex % theme.ARCADE_COLORS.length]);
            } else {
                bodyMat.color.setHex(theme.STRUCTURE);
            }
        }
    };
}