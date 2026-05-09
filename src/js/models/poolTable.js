import * as THREE from 'three';

export function createBilliardTable() {
    const tableGroup = new THREE.Group();
    tableGroup.name = "BilliardTable";

    // Materiais
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x663300, roughness: 0.8 });
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x008822, roughness: 1.0 }); // Verde pano
    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Interior preto
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }); // Base branca

    const width = 4.5;  // Largura (curta)
    const length = 8.0; // Comprimento
    const height = 2.8; // Altura do chão ao topo
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

    // --- Superfície de Feltro (Onde as bolas rolam) ---
    const felt = new THREE.Mesh(
        new THREE.BoxGeometry(width - railWidth, 0.1, length - railWidth),
        feltMat
    );
    felt.position.y = height - 0.25;
    tableGroup.add(felt);

    // --- Tabelas / Rails (Bordas de madeira) ---
    const longRailGeom = new THREE.BoxGeometry(railWidth, 0.3, length);
    const shortRailGeom = new THREE.BoxGeometry(width, 0.3, railWidth);

    // Tabela Esquerda
    const railL = new THREE.Mesh(longRailGeom, woodMat);
    railL.position.set(-width / 2 + railWidth / 2, height - 0.15, 0);
    tableGroup.add(railL);

    // Tabela Direita
    const railR = new THREE.Mesh(longRailGeom, woodMat);
    railR.position.set(width / 2 - railWidth / 2, height - 0.15, 0);
    tableGroup.add(railR);

    // Tabela Topo
    const railT = new THREE.Mesh(shortRailGeom, woodMat);
    railT.position.set(0, height - 0.15, length / 2 - railWidth / 2);
    tableGroup.add(railT);

    // Tabela Fundo
    const railB = new THREE.Mesh(shortRailGeom, woodMat);
    railB.position.set(0, height - 0.15, -length / 2 + railWidth / 2);
    tableGroup.add(railB);

    // --- Buracos (Pockets - Discos pretos simples) ---
    const pocketGeom = new THREE.CircleGeometry(0.18, 16);
    // Rodar para ficar horizontal
    pocketGeom.rotateX(-Math.PI / 2);

    const pocketY = height - 0.24;
    const pX = width / 2 - railWidth / 2;
    const pZ = length / 2 - railWidth / 2;

    const pocketCoords = [
        [pX, pZ], [-pX, pZ], // Cantos topo
        [pX, 0], [-pX, 0],   // Meio
        [pX, -pZ], [-pX, -pZ] // Cantos fundo
    ];

    pocketCoords.forEach(coord => {
        const pocket = new THREE.Mesh(pocketGeom, pocketMat);
        pocket.position.set(coord[0], pocketY, coord[1]);
        tableGroup.add(pocket);
    });

    // --- Detalhes Espalhados (Bolas e Taco) ---
    // Bola Branca (Cue ball)
    const cueBall = new THREE.Mesh(new THREE.SphereGeometry(0.08), ballMat);
    cueBall.position.set(-0.5, height - 0.17, -1.5);
    tableGroup.add(cueBall);

    // Bola 8 (Preta)
    const blackBallMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });
    const ball8 = new THREE.Mesh(new THREE.SphereGeometry(0.08), blackBallMat);
    ball8.position.set(0.2, height - 0.17, 1.0);
    tableGroup.add(ball8);

    // Taco de bilhar (Cilindro longo e fino)
    const cueStickMat = new THREE.MeshStandardMaterial({ color: 0xeecc88, roughness: 0.5 });
    const cueStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.04, 5.0),
        cueStickMat
    );
    cueStick.position.set(1.0, height - 0.15, -1.0);
    cueStick.rotation.set(Math.PI / 2, 0, Math.PI * 0.1); // Deitado na mesa angulado
    tableGroup.add(cueStick);

    return tableGroup;
}