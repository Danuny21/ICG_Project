import * as THREE from 'three';

export function createBilliardTable() {
    const tableGroup = new THREE.Group();
    tableGroup.name = "BilliardTable";

    // Materiais Base
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x663300, roughness: 0.8 });
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x008822, roughness: 1.0 }); // Verde pano
    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Interior preto

    const width = 4.5;
    const length = 8.0;
    const height = 2.8;
    const railWidth = 0.4;
    const legRadius = 0.25;

    // --- Pernas (4) ---
    const legGeom = new THREE.CylinderGeometry(legRadius, legRadius * 0.7, height - 0.5);
    const legCoords = [
        [width / 2 - legRadius, length / 2 - legRadius],
        [-(width / 2 - legRadius), length / 2 - legRadius],
        [width / 2 - legRadius, -(length / 2 - legRadius)],
        [-(width / 2 - legRadius), -(length / 2 - legRadius)]
    ];

    legCoords.forEach(coord => {
        const leg = new THREE.Mesh(legGeom, woodMat);
        leg.position.set(coord[0], (height - 0.5) / 2, coord[1]);
        tableGroup.add(leg);
    });

    // --- Estrutura Inferior de Madeira ---
    const baseFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.4, length),
        woodMat
    );
    baseFrame.position.y = height - 0.5;
    tableGroup.add(baseFrame);

    // --- Superfície de Feltro ---
    const felt = new THREE.Mesh(
        new THREE.BoxGeometry(width - railWidth, 0.1, length - railWidth),
        feltMat
    );
    felt.position.y = height - 0.25;
    tableGroup.add(felt);

    // --- Tabelas / Rails ---
    const longRailGeom = new THREE.BoxGeometry(railWidth, 0.3, length);
    const shortRailGeom = new THREE.BoxGeometry(width, 0.3, railWidth);

    const railL = new THREE.Mesh(longRailGeom, woodMat);
    railL.position.set(-width / 2 + railWidth / 2, height - 0.15, 0);
    tableGroup.add(railL);

    const railR = new THREE.Mesh(longRailGeom, woodMat);
    railR.position.set(width / 2 - railWidth / 2, height - 0.15, 0);
    tableGroup.add(railR);

    const railT = new THREE.Mesh(shortRailGeom, woodMat);
    railT.position.set(0, height - 0.15, length / 2 - railWidth / 2);
    tableGroup.add(railT);

    const railB = new THREE.Mesh(shortRailGeom, woodMat);
    railB.position.set(0, height - 0.15, -length / 2 + railWidth / 2);
    tableGroup.add(railB);

    // --- Buracos (Pockets) ---
    const pocketGeom = new THREE.CircleGeometry(0.18, 16);
    pocketGeom.rotateX(-Math.PI / 2);

    const pocketY = height - 0.24;
    const pX = width / 2 - railWidth / 2;
    const pZ = length / 2 - railWidth / 2;

    const pocketCoords = [
        [pX, pZ], [-pX, pZ],
        [pX, 0], [-pX, 0],
        [pX, -pZ], [-pX, -pZ]
    ];

    pocketCoords.forEach(coord => {
        const pocket = new THREE.Mesh(pocketGeom, pocketMat);
        pocket.position.set(coord[0], pocketY, coord[1]);
        tableGroup.add(pocket);
    });

    // --- Lógica para as 16 Bolas Espalhadas ---
    const ballRadius = 0.08;
    const ballY = height - 0.17; // Altura em que assentam na mesa

    // Cores padrão do bilhar (1 a 15)
    const ballColors = [
        0xffcc00, 0x0033cc, 0xcc0000, 0x660099, 0xff6600, 0x006600, 0x800000, // 1-7 LISAS
        0x111111, // 8 PRETA
        0xffd700, 0x4169e1, 0xdc143c, 0x9370db, 0xff8c00, 0x228b22, 0xa52a2a  // 9-15 RISCADAS (aqui usamos tons ligeiramente diferentes para distinguir)
    ];

    const ballGeom = new THREE.SphereGeometry(ballRadius, 16, 16);

    // Limites de onde as bolas podem estar para não saírem da mesa
    const limitX = (width / 2) - railWidth - ballRadius;
    const limitZ = (length / 2) - railWidth - ballRadius;

    // Array para guardar as posições e verificar colisões
    const positions = [];

    // Gerar as 15 bolas coloridas
    for (let i = 0; i < 15; i++) {
        let x, z;
        let overlapping = true;
        let attempts = 0;

        // Loop para encontrar uma posição que não colida com as bolas já colocadas
        while (overlapping && attempts < 100) {
            // Random entre os limites negativos e positivos
            x = (Math.random() * (limitX * 2)) - limitX;
            z = (Math.random() * (limitZ * 2)) - limitZ;
            overlapping = false;

            for (let pos of positions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
                if (distance < ballRadius * 2.1) { // 2.1 garante uma folga minúscula
                    overlapping = true;
                    break;
                }
            }
            attempts++;
        }

        positions.push({ x, z });

        const ballMat = new THREE.MeshStandardMaterial({ color: ballColors[i], roughness: 0.1 });
        const ball = new THREE.Mesh(ballGeom, ballMat);
        ball.position.set(x, ballY, z);
        tableGroup.add(ball);
    }

    // Gerar a Bola Branca (Cue ball) num ponto específico com espaço livre garantido
    const cueBallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const cueBall = new THREE.Mesh(ballGeom, cueBallMat);
    // Colocamos a bola branca de um lado para simular uma jogada a decorrer
    cueBall.position.set(0, ballY, limitZ - 0.5);
    tableGroup.add(cueBall);

    // --- Taco de bilhar ---
    const cueStickMat = new THREE.MeshStandardMaterial({ color: 0xeecc88, roughness: 0.5 });
    const cueStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.04, 5.0),
        cueStickMat
    );
    cueStick.position.set(1.0, height - 0.15, -1.0);
    cueStick.rotation.set(Math.PI / 2, 0, Math.PI * 0.1);
    tableGroup.add(cueStick);

    return tableGroup;
}