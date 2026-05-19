import * as THREE from "three";
import { loadTextureSet } from "../systems/TextureLoader.js";
import { createRoundTable } from './table.js';
import { createChair } from './chair.js';
import { createBilliardTable } from './poolTable.js';
import { createArcadeMachine } from './arcadeMachine.js';
import { createPizza } from './pizza.js';
import { createJuiceGlass } from './juice.js';
import { createFloorPlant } from './plantFloor.js';
import { createTablePlant } from './plantTable.js';
import { createBalloons } from './ballon.js';
import { createFrame } from './frame.js';
import { createCounter } from './counter.js';
import { createLamp } from './lamp.js';
import { createCeilingFan } from './ceilingFan.js';
import { createTokens } from './tokens.js';

// Cria a estrutura do edifício do arcade, incluindo paredes, chão, mobiliário e iluminação.
export function createArcadeBuilding(scene) {
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const WIDTH = 100;
    const HEIGHT = 50;
    const DEPTH = 140;
    const THICKNESS = 2;
    const SCALE_FACTOR = 3;

    // --- Materiais ---
    let wallMat = new THREE.MeshPhongMaterial({ color: 0x1a1a3e, shininess: 30 });
    const blueNeonMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 });
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ddff, transparent: true, opacity: 0.15, shininess: 100, side: THREE.DoubleSide });
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x222233, shininess: 40 });
    const metalMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });
    const blindMat = new THREE.MeshPhongMaterial({ color: 0x33333d, shininess: 80, side: THREE.DoubleSide });

    // --- Texturas ---
    const floorTex = loadTextureSet(
        "./src/js/textures/floor/Tiles074_1K-JPG",
        ["Color", "NormalGL", "Roughness", "Displacement"],
        { x: WIDTH / 20, y: DEPTH / 20 }
    );
    const floorMat = new THREE.MeshPhongMaterial({
        map: floorTex.color, normalMap: floorTex.normal,
        specularMap: floorTex.roughness, shininess: 60, specular: 0x444444
    });

    const wallTex = loadTextureSet(
        "./src/js/textures/wall/PaintedPlaster017_1K-JPG",
        ["Color", "NormalGL", "Roughness", "Displacement"],
        { x: 4, y: 2 }
    );
    wallMat.map = wallTex.color;
    wallMat.normalMap = wallTex.normal;
    wallMat.specularMap = wallTex.roughness;
    wallMat.color.set(0x666688);

    const loader = new THREE.TextureLoader();
    const posters = [
        loader.load("./src/js/textures/posters/donkeyKong.jpg"),
        loader.load("./src/js/textures/posters/pacman.jpg"),
        loader.load("./src/js/textures/posters/spaceInvaders.jpeg"),
        loader.load("./src/js/textures/posters/sonic.jpeg"),
        loader.load("./src/js/textures/posters/pinball.jpeg"),
        loader.load("./src/js/textures/posters/streetFighter.jpg")
    ];

    // --- Piso ---
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, DEPTH), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    buildingGroup.add(floor);

    // --- Parede Traseira com janela ---
    const backWallZ = -(DEPTH / 2) - THICKNESS / 2;
    const windowWidth = 30;
    const windowHeight = 18;
    const windowSill = 12;
    const wingWidth = (WIDTH - windowWidth) / 2;

    [
        [wingWidth, HEIGHT, -(WIDTH / 2) + wingWidth / 2, HEIGHT / 2],
        [wingWidth, HEIGHT, WIDTH / 2 - wingWidth / 2, HEIGHT / 2],
    ].forEach(([w, h, x, y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, THICKNESS), wallMat);
        m.position.set(x, y, backWallZ);
        buildingGroup.add(m);
    });

    const backBottom = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowSill, THICKNESS), wallMat);
    backBottom.position.set(0, windowSill / 2, backWallZ);
    buildingGroup.add(backBottom);

    const backTopHeight = HEIGHT - windowSill - windowHeight;
    const backTop = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, backTopHeight, THICKNESS), wallMat);
    backTop.position.set(0, HEIGHT - backTopHeight / 2, backWallZ);
    buildingGroup.add(backTop);

    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, windowHeight - 0.1, THICKNESS * 0.1), glassMat);
    backGlass.position.set(0, windowSill + windowHeight / 2, backWallZ + THICKNESS * 0.3);
    buildingGroup.add(backGlass);

    // --- Exterior (rua fora da janela) ---
    const exteriorMat = new THREE.MeshBasicMaterial({ color: 0x000088, side: THREE.DoubleSide });
    const exterior = new THREE.Mesh(
        new THREE.PlaneGeometry(windowWidth * 3, windowHeight * 3),
        exteriorMat
    );
    exterior.position.set(0, 25, backWallZ - 20);
    buildingGroup.add(exterior);

    const windowLight = new THREE.PointLight(0x4444ff, 15, 100);
    windowLight.position.set(0, 21, backWallZ - 5);
    buildingGroup.add(windowLight);

    const windowSpot = new THREE.SpotLight(0x4444ff, 20, 150, Math.PI / 3, 0.5);
    windowSpot.position.set(0, 21, backWallZ - 2);
    windowSpot.target.position.set(0, 10, 0);
    buildingGroup.add(windowSpot);
    buildingGroup.add(windowSpot.target);

    // Guardar na scene para controlo de dia/noite
    scene.userData.exteriorMat = exteriorMat;
    scene.userData.windowLight = windowLight;
    scene.userData.windowSpot = windowSpot;

    // --- Parede Esquerda ---
    const sideLength = DEPTH + THICKNESS * 2;
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(THICKNESS, HEIGHT, sideLength), wallMat);
    leftWall.position.set(-(WIDTH / 2) - THICKNESS / 2, HEIGHT / 2, 0);
    buildingGroup.add(leftWall);

    // --- Parede Frontal com porta ---
    const doorWidth = 14;
    const doorHeight = 22;
    const frontWallZ = DEPTH / 2 + THICKNESS / 2;
    const pillarWidth = (WIDTH - doorWidth) / 2;

    [
        [-(WIDTH / 2) + pillarWidth / 2, HEIGHT / 2],
        [WIDTH / 2 - pillarWidth / 2, HEIGHT / 2],
    ].forEach(([x, y]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(pillarWidth, HEIGHT, THICKNESS), wallMat);
        p.position.set(x, y, frontWallZ);
        buildingGroup.add(p);
    });

    const beamHeight = HEIGHT - doorHeight;
    const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, beamHeight, THICKNESS), wallMat);
    frontBeam.position.set(0, HEIGHT - beamHeight / 2, frontWallZ);
    buildingGroup.add(frontBeam);

    // --- Porta ---
    const doorGroup = new THREE.Group();
    doorGroup.position.set(doorWidth / 2, doorHeight / 2, frontWallZ - 1);
    const doorThickness = THICKNESS * 0.4;
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    doorMesh.position.set(-doorWidth / 2, 0, 0);
    doorGroup.add(doorMesh);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), metalMat);
    knob.position.set(-doorWidth + 2, 0, doorThickness / 2 + 0.4);
    doorGroup.add(knob);
    const knobInt = knob.clone();
    knobInt.position.set(-doorWidth + 2, 0, -doorThickness / 2 - 0.4);
    doorGroup.add(knobInt);
    buildingGroup.add(doorGroup);

    // --- Parede Direita ---
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(THICKNESS, HEIGHT, sideLength), wallMat);
    rightWall.position.set(WIDTH / 2 + THICKNESS / 2, HEIGHT / 2, 0);
    buildingGroup.add(rightWall);

    // --- Perciana ---
    const blindGroup = new THREE.Group();
    blindGroup.position.set(0, windowSill + windowHeight, backWallZ + THICKNESS * 0.3);
    const numSlats = 22;
    const slatHeight = 0.6;
    const slatSpacing = 0.1;
    for (let i = 0; i < Math.round(numSlats * 0.7); i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, slatHeight, THICKNESS * 0.2), blindMat);
        slat.rotation.x = -Math.PI / 8;
        slat.position.y = -(i * (slatHeight + slatSpacing)) - slatHeight / 2;
        blindGroup.add(slat);
    }
    const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, 1.2, THICKNESS * 0.4), metalMat);
    bottomBar.position.y = -(Math.round(numSlats * 0.7) * (slatHeight + slatSpacing)) - 0.6;
    blindGroup.add(bottomBar);
    buildingGroup.add(blindGroup);

    // --- Balcão ---
    const counterObj = createCounter();
    counterObj.group.position.set(-(WIDTH / 2) + 15, 0, DEPTH / 2 - 28);
    counterObj.group.scale.setScalar(0.8);
    buildingGroup.add(counterObj.group);

    // --- Teto ---
    const roof = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + THICKNESS * 2, THICKNESS, DEPTH + THICKNESS * 2), wallMat);
    roof.position.y = HEIGHT + THICKNESS / 2;
    buildingGroup.add(roof);

    // --- Neons de rodapé ---
    const addNeon = (w, h, d, x, y, z) => {
        const n = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blueNeonMat);
        n.position.set(x, y, z);
        buildingGroup.add(n);
    };
    addNeon(WIDTH, 0.5, 0.5, 0, 0.25, -(DEPTH / 2));
    addNeon(0.5, 0.5, DEPTH, -(WIDTH / 2), 0.25, 0);
    addNeon(0.5, 0.5, DEPTH, WIDTH / 2, 0.25, 0);

    // --- Máquinas de Arcade ---
    const arcadeMachines = [];
    [0xff3333, 0x33ff33, 0x3333ff, 0xffff33].forEach((color, i) => {
        const m = createArcadeMachine(color, i);
        m.group.scale.setScalar(SCALE_FACTOR);
        m.group.position.set(50, 0, -55 + i * 12);
        m.group.rotation.y = -Math.PI / 2;
        buildingGroup.add(m.group);
        arcadeMachines.push(m);
    });

    // --- Mesa de Bilhar ---
    const poolTable = createBilliardTable();
    const poolScale = SCALE_FACTOR * 1.0; // Diminuído de 1.2 (1.5*0.8) para 1.0
    poolTable.scale.setScalar(poolScale);
    poolTable.position.set(0, 0, -45);
    poolTable.rotation.y = 0;
    buildingGroup.add(poolTable);

    // --- Mesas Redondas com cadeiras ---
    const tableScale = SCALE_FACTOR * 0.90;
    const roundTables = [];
    const chairs = [];
    [{ x: 32, z: 15 }, { x: 32, z: 45 }].forEach((pos, index) => {
        const tableObj = createRoundTable();
        const table = tableObj.group;
        roundTables.push(tableObj);
        table.scale.setScalar(tableScale);
        table.position.set(pos.x, 0, pos.z);

        if (index === 0) {
            const pizza = createPizza();
            pizza.position.set(0, 3.1, 0);
            table.add(pizza);
            [{ x: 1.2, z: 0.5 }, { x: -1.0, z: -0.8 }].forEach(p => {
                const j = createJuiceGlass();
                j.position.set(p.x, 3.1, p.z);
                table.add(j);
            });
        } else {
            const plant = createTablePlant();
            plant.position.set(0, 3.1, 0);
            table.add(plant);
            const juice = createJuiceGlass();
            juice.position.set(1.0, 3.1, -0.5);
            table.add(juice);
            
            const tableTokens = createTokens();
            tableTokens.position.set(-1.0, 3.1, 0.5);
            tableTokens.scale.setScalar(0.4);
            table.add(tableTokens);
        }
        buildingGroup.add(table);

        const chairOffset = 9;
        [0, Math.PI, Math.PI / 2, -Math.PI / 2].forEach((rot, i) => {
            const chairObj = createChair();
            const chair = chairObj.group;
            chairs.push(chairObj);
            chair.scale.setScalar(SCALE_FACTOR);
            const px = i < 2 ? pos.x : (i === 2 ? pos.x - chairOffset : pos.x + chairOffset);
            const pz = i < 2 ? (i === 0 ? pos.z - chairOffset : pos.z + chairOffset) : pos.z;
            chair.position.set(px, 0, pz);
            chair.rotation.y = rot;
            buildingGroup.add(chair);
        });
    });

    // --- Plantas de chão ---
    [{ x: 45, z: -65 }, { x: -45, z: -65 }].forEach(pos => {
        const p = createFloorPlant();
        p.scale.setScalar(SCALE_FACTOR);
        p.position.set(pos.x, 0, pos.z);
        buildingGroup.add(p);
    });

    // --- Balões ---
    [{ x: 48, z: 0 }, { x: 48, z: 30 }, { x: 48, z: 60 }].forEach(pos => {
        const b = createBalloons();
        b.scale.setScalar(SCALE_FACTOR);
        b.position.set(pos.x, 0, pos.z);
        buildingGroup.add(b);
    });

    // --- Quadros (Posters) ---
    const addFrame = (x, y, z, rotY, texIndex, w = 6, h = 8) => {
        const q = createFrame(w, h, posters[texIndex % posters.length]);
        q.position.set(x, y, z);
        q.rotation.y = rotY;
        buildingGroup.add(q);
    };
    // Agora usando todos os 6 posters disponíveis e ajustando o offset para garantir visibilidade fora da parede
    addFrame(-42, 28, backWallZ + 1.1, 0, 0); // Donkey Kong
    addFrame(-35, 22, backWallZ + 1.1, 0, 1); // Pacman
    addFrame(30, 28, backWallZ + 1.1, 0, 2);  // Space Invaders
    addFrame(37, 22, backWallZ + 1.1, 0, 3);  // Sonic
    addFrame(27, 20, backWallZ + 1.1, 0, 4, 4, 5); // Pinball
    addFrame(-(WIDTH / 2) + 1.1, 25, 0, Math.PI / 2, 5, 8, 10); // Street Fighter

    // --- Novos Elementos Decorativos ---

    // 1. Candeeiro de Bilhar (com lâmpada)
    const poolLamp = createLamp(true, 150);
    poolLamp.position.set(0, 35, -45); // Exatamente por cima da mesa de bilhar
    poolLamp.scale.setScalar(SCALE_FACTOR * 1.0); // Ajustado para condizer com a mesa mais pequena
    buildingGroup.add(poolLamp);
    scene.userData.poolLamp = poolLamp;

    // 1.2. Luzes focadas nas Coleções
    scene.userData.shelfSpots = [];
    [{x: -20, y: 35, z: 25}, {x: -20, y: 35, z: 60}].forEach(pos => {
        const spot = new THREE.SpotLight(0xffffff, 150);
        spot.position.set(pos.x, pos.y, pos.z);
        spot.angle = Math.PI / 4;
        spot.penumbra = 0.5;
        spot.decay = 1.5;
        spot.distance = 70;
        spot.castShadow = true;
        const target = new THREE.Object3D();
        target.position.set(-48.5, 20, 43); // Aponta para o meio das estantes
        buildingGroup.add(target);
        spot.target = target;
        buildingGroup.add(spot);
        scene.userData.shelfSpots.push(spot);
    });

    // 1.3. Luzes focadas nas Mesas Redondas (apenas a luz, sem o modelo)
    scene.userData.tableSpots = [];
    const tablePositions = [{ x: 32, z: 15 }, { x: 32, z: 45 }];
    tablePositions.forEach((pos) => {
        // Spot 1 (esquerda/frente)
        const spot1 = new THREE.SpotLight(0xffffff, 100);
        spot1.position.set(pos.x - 15, 35, pos.z - 15);
        spot1.angle = Math.PI / 4;
        spot1.penumbra = 0.5;
        spot1.decay = 1.5;
        spot1.distance = 60;
        spot1.castShadow = true;
        const target1 = new THREE.Object3D();
        target1.position.set(pos.x, 5, pos.z);
        buildingGroup.add(target1);
        spot1.target = target1;
        buildingGroup.add(spot1);
        scene.userData.tableSpots.push(spot1);

        // Spot 2 (direita/trás)
        const spot2 = new THREE.SpotLight(0xffffff, 100);
        spot2.position.set(pos.x + 15, 35, pos.z + 15);
        spot2.angle = Math.PI / 4;
        spot2.penumbra = 0.5;
        spot2.decay = 1.5;
        spot2.distance = 60;
        spot2.castShadow = true;
        const target2 = new THREE.Object3D();
        target2.position.set(pos.x, 5, pos.z);
        buildingGroup.add(target2);
        spot2.target = target2;
        buildingGroup.add(spot2);
        scene.userData.tableSpots.push(spot2);
    });

    // 1.4 Luzes direcionais para as Máquinas de Arcade
    scene.userData.arcadeSpots = [];
    [{x: 15, y: 35, z: -40, tx: 50, tz: -49}, {x: 15, y: 35, z: -15, tx: 50, tz: -25}].forEach(spec => {
        const spot = new THREE.SpotLight(0xffffff, 150);
        spot.position.set(spec.x, spec.y, spec.z);
        spot.angle = Math.PI / 3;
        spot.penumbra = 0.5;
        spot.decay = 1.5;
        spot.distance = 70;
        spot.castShadow = true;
        const target = new THREE.Object3D();
        target.position.set(spec.tx, 10, spec.tz);
        buildingGroup.add(target);
        spot.target = target;
        buildingGroup.add(spot);
        scene.userData.arcadeSpots.push(spot);
    });

    // 1.5 Luz para o balcão
    const counterSpot = new THREE.SpotLight(0xffffff, 150);
    counterSpot.position.set(-10, 35, -5); // Em ângulo
    counterSpot.angle = Math.PI / 3;
    counterSpot.penumbra = 0.5;
    counterSpot.decay = 1.5;
    counterSpot.distance = 60;
    counterSpot.castShadow = true;
    const counterTarget = new THREE.Object3D();
    counterTarget.position.set(-35, 10, 22);
    buildingGroup.add(counterTarget);
    counterSpot.target = counterTarget;
    buildingGroup.add(counterSpot);
    scene.userData.counterSpot = counterSpot;

    // 4. Ventoinha de Teto
    const fanObj = createCeilingFan();
    fanObj.group.position.set(0, HEIGHT - 13.5, 0); // Rebaixado para ser visível na câmara
    fanObj.group.scale.setScalar(SCALE_FACTOR * 1.5);
    buildingGroup.add(fanObj.group);

    // A ventoinha e os tokens da mesa redonda já foram adicionados antes

    return {
        group: buildingGroup,
        door: doorGroup,
        counter: counterObj.group,
        blinds: blindGroup,
        fan: fanObj.blades, // Exportamos as pás para animar no main.js
        updateTheme: (theme) => {
            roundTables.forEach(t => t.updateTheme(theme));
            arcadeMachines.forEach(m => m.updateTheme(theme));
            counterObj.updateTheme(theme);
            chairs.forEach(c => c.updateTheme(theme));
            blueNeonMat.color.setHex(theme.FRAME);
            blueNeonMat.emissive.setHex(theme.FRAME);
        },
        // Função para alternar entre dia e noite
        setExteriorTheme: (theme) => {
            if (theme === 'dia') {
                exterior.material.color.setHex(0x87ceeb); // Light blue for day
                windowLight.color.set(0xffffff);
                windowLight.intensity = 2;
                windowSpot.color.set(0xffcc88);
                windowSpot.intensity = 10;
            } else {
                exterior.material.color.setHex(0x000088); // Dark blue for night
                windowLight.color.set(0x4444ff);
                windowLight.intensity = 15;
                windowSpot.color.set(0x4444ff);
                windowSpot.intensity = 20;
            }
        }
    };
}
