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
    const pocketGeom = new THREE.CircleGeometry(0.3, 16); // Maior para ser visível
    pocketGeom.rotateX(-Math.PI / 2);

    const pocketY = height - 0.19; // Um pouco mais acima do feltro
    // Posicionar no limite interno da madeira (railWidth = 0.4, width/2 = 2.25 => limite feltro = 1.85)
    const pX = (width / 2) - railWidth;
    const pZ = (length / 2) - railWidth;

    const pocketCoords = [
        [pX, pZ], [-pX, pZ],          // Cantos
        [pX + 0.1, 0], [-pX - 0.1, 0], // Meio (ligeiramente mais para a madeira)
        [pX, -pZ], [-pX, -pZ]         // Cantos
    ];

    pocketCoords.forEach(coord => {
        const pocket = new THREE.Mesh(pocketGeom, pocketMat);
        pocket.position.set(coord[0], pocketY, coord[1]);
        tableGroup.add(pocket);
    });

    // --- Lógica para as 15 Bolas em Formação de Triângulo (Rack) ---
    const ballRadius = 0.08;
    const ballY = height - 0.17;
    const ballGeom = new THREE.SphereGeometry(ballRadius, 16, 16);

    const startZ = -1.5;
    const gap = 0.005; // folga minúscula
    const diam = ballRadius * 2 + gap;

    // Cores padrão do bilhar (1 a 15)
    const ballColors = [
        0xffcc00, 0x0033cc, 0xcc0000, 0x660099, 0xff6600, 0x006600, 0x800000, // 1-7 LISAS
        0x111111, // 8 PRETA
        0xffd700, 0x4169e1, 0xdc143c, 0x9370db, 0xff8c00, 0x228b22, 0xa52a2a  // 9-15 RISCADAS
    ];

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

    // Gerar a Bola Branca (Cue ball) numa posição fixa
    const cueBallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const cueBall = new THREE.Mesh(ballGeom, cueBallMat);
    cueBall.position.set(0, ballY, 1.8);
    cueBall.castShadow = true;
    cueBall.receiveShadow = true;
    tableGroup.add(cueBall);

    // --- Taco de bilhar deitado na mesa ---
    const cueStickMat = new THREE.MeshStandardMaterial({ color: 0xeecc88, roughness: 0.5 });
    const cueStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.035, 5.0),
        cueStickMat
    );
    // Deitado paralelamente à tabela lateral
    cueStick.position.set(width / 2 - 1, ballY, 0.5);
    cueStick.rotation.set(Math.PI / 2, 0, 0.05);
    cueStick.castShadow = true;
    tableGroup.add(cueStick);

    return tableGroup;
}