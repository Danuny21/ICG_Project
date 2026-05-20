import * as THREE from 'three';
import { loadTextureSet } from '../systems/TextureLoader.js';

export function createBilliardTable() {
    const tableGroup = new THREE.Group();
    tableGroup.name = "BilliardTable";

    // Materiais Base
    // Materiais Base com Texturas
    function createWoodMat(repeatX, repeatY) {
        const tex = loadTextureSet(
            "./src/js/textures/wood/Wood066_1K-JPG",
            ["Color", "NormalGL", "Roughness"],
            { x: repeatX, y: repeatY }
        );
        return new THREE.MeshStandardMaterial({ 
            map: tex.color,
            normalMap: tex.normal,
            roughnessMap: tex.roughness,
            color: 0x885522,
            roughness: 0.7 
        });
    }

    // Materiais de madeira
    const woodMatLeg = createWoodMat(1, 1);
    const woodMatBase = createWoodMat(4, 8);
    const woodMatLong = createWoodMat(8, 1);
    const woodMatShort = createWoodMat(4, 1);
    
    const feltTex = loadTextureSet(
        "./src/js/textures/fabric/Fabric021_1K-JPG",
        ["Color", "NormalGL", "Roughness"],
        { x: 8, y: 16 }
    );
    // Material de feltro para a superfície da mesa
    const feltMat = new THREE.MeshStandardMaterial({
        map: feltTex.color,
        normalMap: feltTex.normal,
        roughnessMap: feltTex.roughness,
        color: 0x008822, 
        roughness: 1.0 
    });
    // Buracos
    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Interior preto

    const width = 4.5;
    const length = 8.0;
    const height = 2.8;
    const railWidth = 0.4;
    const legRadius = 0.25;

    // Pernas
    const legGeom = new THREE.CylinderGeometry(legRadius, legRadius * 0.7, height - 0.5);
    const legCoords = [
        [width / 2 - legRadius, length / 2 - legRadius],
        [-(width / 2 - legRadius), length / 2 - legRadius],
        [width / 2 - legRadius, -(length / 2 - legRadius)],
        [-(width / 2 - legRadius), -(length / 2 - legRadius)]
    ];

    legCoords.forEach(coord => {
        const leg = new THREE.Mesh(legGeom, woodMatLeg);
        leg.position.set(coord[0], (height - 0.5) / 2, coord[1]);
        tableGroup.add(leg);
    });

    // Estrutura Inferior de Madeira
    const baseFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.4, length),
        woodMatBase
    );
    baseFrame.position.y = height - 0.5;
    tableGroup.add(baseFrame);

    // Superfície de Feltro
    const felt = new THREE.Mesh(
        new THREE.BoxGeometry(width - 2 * railWidth, 0.1, length - 2 * railWidth),
        feltMat
    );
    felt.position.y = height - 0.25;
    tableGroup.add(felt);

    // Trilhos de Madeira (Moldura da mesa pa ra segurar o feltro e definir os buracos)
    const longRailGeom = new THREE.BoxGeometry(railWidth, 0.3, length);
    const shortRailGeom = new THREE.BoxGeometry(width - 2 * railWidth, 0.3, railWidth);

    // Esquerda
    const railL = new THREE.Mesh(longRailGeom, woodMatLong);
    railL.position.set(-width / 2 + railWidth / 2, height - 0.15, 0);
    tableGroup.add(railL);

    // Direita
    const railR = new THREE.Mesh(longRailGeom, woodMatLong);
    railR.position.set(width / 2 - railWidth / 2, height - 0.15, 0);
    tableGroup.add(railR);

    // Topo
    const railT = new THREE.Mesh(shortRailGeom, woodMatShort);
    railT.position.set(0, height - 0.15, length / 2 - railWidth / 2);
    tableGroup.add(railT);

    // Fundo
    const railB = new THREE.Mesh(shortRailGeom, woodMatShort);
    railB.position.set(0, height - 0.15, -length / 2 + railWidth / 2);
    tableGroup.add(railB);

    // Buracos
    const pocketRadius = 0.2; // Maior que o raio da bola (0.08)
    const pocketGeom = new THREE.CircleGeometry(pocketRadius, 32); 
    pocketGeom.rotateX(-Math.PI / 2);

    const pocketY = height - 0.19; // Um pouco mais acima do feltro
    const pX_edge = (width / 2) + 0.1 - railWidth;
    const pZ_edge = (length / 2) + 0.1 - railWidth;
    
    // Mover os buracos mais para o centro para ficarem totalmente redondos e visíveis
    const pX = pX_edge - pocketRadius + 0.02;
    const pZ = pZ_edge - pocketRadius + 0.02;

    const pocketCoords = [
        [pX, pZ], [-pX, pZ],          // Cantos topo
        [pX, 0], [-pX, 0],            // Meio
        [pX, -pZ], [-pX, -pZ]         // Cantos baixo
    ];

    pocketCoords.forEach(coord => {
        const pocket = new THREE.Mesh(pocketGeom, pocketMat);
        pocket.position.set(coord[0], pocketY, coord[1]);
        tableGroup.add(pocket);
    });

    // Lógica para as 15 Bolas em Formação de Triângulo
    const ballRadius = 0.08;
    const ballY = height - 0.12;
    const ballGeom = new THREE.SphereGeometry(ballRadius, 16, 16);

    const startZ = -1.5;
    const gap = 0.005; // folga minúscula
    const diam = ballRadius * 2 + gap;

    // Cores padrão do bilhar (1 a 15)
    // N consegui mudar as cores pa ter sólidas e listadas
    // Aka tudo sólido
    const ballColors = [
        0xffcc00, 0x0033cc, 0xcc0000, 0x660099, 0xff6600, 0x006600, 0x800000, // 1-7 LISAS
        0x111111, // 8 PRETA
        0xffd700, 0x4169e1, 0xdc143c, 0x9370db, 0xff8c00, 0x228b22, 0xa52a2a  // 9-15 RISCADAS
    ];

    // Criar as 15 bolas em formação de triângulo
    let ballIndex = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            const x = (col - row / 2) * diam;
            const z = startZ - row * (diam * 0.866); // Altura do triângulo equilátero

            const ballMat = new THREE.MeshStandardMaterial({ color: ballColors[ballIndex], roughness: 0.1 });
            const ball = new THREE.Mesh(ballGeom, ballMat);
            ball.position.set(x, ballY, z);
            ball.castShadow = true;
            ball.receiveShadow = true;
            tableGroup.add(ball);
            ballIndex++;
        }
    }

    // Bola Branca
    const cueBallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const cueBall = new THREE.Mesh(ballGeom, cueBallMat);
    cueBall.position.set(0, ballY, 1.8);
    cueBall.castShadow = true;
    cueBall.receiveShadow = true;
    tableGroup.add(cueBall);

    // Taco de bilhar 1
    const cueStickMat = new THREE.MeshStandardMaterial({ color: 0xeecc88, roughness: 0.5 });
    const cueStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.035, 5.0),
        cueStickMat
    );
    cueStick.position.set(width / 2 - 1, ballY, 0.5);
    cueStick.rotation.set(Math.PI / 2, 0, 0.05);
    cueStick.castShadow = true;
    tableGroup.add(cueStick);

    // Taco de bilhar 2
    const cueStick2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.035, 5.0),
        cueStickMat
    );
    cueStick2.position.set(width / 2 - 0.7, ballY, -0.5);
    cueStick2.rotation.set(Math.PI / 2, 0, -0.05);
    cueStick2.castShadow = true;
    tableGroup.add(cueStick2);

    // Giz
    const chalkMat = new THREE.MeshStandardMaterial({ color: 0x0044ff, roughness: 0.9 });
    const chalk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), chalkMat);
    chalk.position.set(width / 2 - railWidth / 2, height + 0.05, 0); 
    chalk.rotation.y = Math.PI / 6;
    chalk.castShadow = true;
    tableGroup.add(chalk);

    // Triângulo
    const L_rack = 0.9;
    const t_rack = 0.04;
    const h_rack = L_rack * Math.sqrt(3) / 2;
    const cy_rack = h_rack / 3;
    const r_rack = h_rack / 3;
    const k_rack = (r_rack - t_rack) / r_rack;

    const shape = new THREE.Shape();
    shape.moveTo(-L_rack/2, -cy_rack);
    shape.lineTo(L_rack/2, -cy_rack);
    shape.lineTo(0, h_rack - cy_rack);
    shape.lineTo(-L_rack/2, -cy_rack);

    const hole = new THREE.Path();
    hole.moveTo(-L_rack/2 * k_rack, -cy_rack * k_rack);
    hole.lineTo(L_rack/2 * k_rack, -cy_rack * k_rack);
    hole.lineTo(0, (h_rack - cy_rack) * k_rack);
    hole.lineTo(-L_rack/2 * k_rack, -cy_rack * k_rack);
    shape.holes.push(hole);

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.005, bevelThickness: 0.005 };
    const rackGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    rackGeom.translate(0, 0, -0.03); // Centrar na altura

    const rackMat = new THREE.MeshStandardMaterial({ color: 0x442200, roughness: 0.7 });
    const rackMesh = new THREE.Mesh(rackGeom, rackMat);
    rackMesh.rotation.x = Math.PI / 2; // Deitar na mesa
    rackMesh.castShadow = true;

    const triangleGroup = new THREE.Group();
    triangleGroup.add(rackMesh);
    triangleGroup.position.set(-1.0, ballY, 2.0);
    triangleGroup.rotation.y = Math.PI / 5;
    tableGroup.add(triangleGroup);

    return tableGroup;
}