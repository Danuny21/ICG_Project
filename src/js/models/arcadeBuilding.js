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
import { createExterior } from './exterior.js';

// Cria a estrutura do edifício do arcade, incluindo paredes, chão, mobíla e iluminação.
export function createArcadeBuilding(scene) {
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const WIDTH = 100;
    const HEIGHT = 50;
    const DEPTH = 140;
    const THICKNESS = 2;
    const SCALE_FACTOR = 3;

    // Materiais
    let wallMat = new THREE.MeshPhongMaterial({ color: 0x1a1a3e, shininess: 30 });
    const blueNeonMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 });
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ddff, transparent: true, opacity: 0.15, shininess: 100, side: THREE.DoubleSide });
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x222233, shininess: 40 });
    const metalMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });
    const blindMat = new THREE.MeshPhongMaterial({ color: 0x33333d, shininess: 80, side: THREE.DoubleSide });

    // Texturas
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

    // Chão
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, DEPTH), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    buildingGroup.add(floor);

    // Parede com a janela
    const backWallZ = -(DEPTH / 2) - THICKNESS / 2;
    const windowWidth = 30;
    const windowHeight = 18;
    const windowSill = 12;
    const wingWidth = (WIDTH - windowWidth) / 2;

    // Criar 2 paredes laterais à janela
    [[wingWidth, HEIGHT, -(WIDTH / 2) + wingWidth / 2, HEIGHT / 2], 
     [wingWidth, HEIGHT, WIDTH / 2 - wingWidth / 2, HEIGHT / 2],
    ].forEach(([w, h, x, y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, THICKNESS), wallMat);
        m.position.set(x, y, backWallZ);
        buildingGroup.add(m);
    });

    // Criar a parte superior da parede com a janela
    const backBottom = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowSill, THICKNESS), wallMat);
    backBottom.position.set(0, windowSill / 2, backWallZ);
    buildingGroup.add(backBottom);
    // Parte superior da parede acima da janela
    const backTopHeight = HEIGHT - windowSill - windowHeight;
    const backTop = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, backTopHeight, THICKNESS), wallMat);
    backTop.position.set(0, HEIGHT - backTopHeight / 2, backWallZ);
    buildingGroup.add(backTop);

    // Janela
    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, windowHeight - 0.1, THICKNESS * 0.1), glassMat);
    backGlass.position.set(0, windowSill + windowHeight / 2, backWallZ + THICKNESS * 0.3);
    buildingGroup.add(backGlass);

    // Exterior visível pela janela: chão, árvores e céu
    const exteriorGroup = createExterior(windowWidth, windowHeight, windowSill, backWallZ);
    buildingGroup.add(exteriorGroup);

    // Parede lateral esquerda
    const sideLength = DEPTH + THICKNESS * 2;
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(THICKNESS, HEIGHT, sideLength), wallMat);
    leftWall.position.set(-(WIDTH / 2) - THICKNESS / 2, HEIGHT / 2, 0);
    buildingGroup.add(leftWall);

    // Parede com a porta
    const doorWidth = 14;
    const doorHeight = 22;
    const frontWallZ = DEPTH / 2 + THICKNESS / 2;
    const pillarWidth = (WIDTH - doorWidth) / 2;
    // Paredes laterais à porta
    [[-(WIDTH / 2) + pillarWidth / 2, HEIGHT / 2],
      [WIDTH / 2 - pillarWidth / 2, HEIGHT / 2],
    ].forEach(([x, y]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(pillarWidth, HEIGHT, THICKNESS), wallMat);
        p.position.set(x, y, frontWallZ);
        buildingGroup.add(p);
    });

    // Viga superior da porta
    const beamHeight = HEIGHT - doorHeight;
    const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, beamHeight, THICKNESS), wallMat);
    frontBeam.position.set(0, HEIGHT - beamHeight / 2, frontWallZ);
    buildingGroup.add(frontBeam);

    // Porta
    const doorGroup = new THREE.Group();
    doorGroup.position.set(doorWidth / 2, doorHeight / 2, frontWallZ - 1);
    const doorThickness = THICKNESS * 0.4;
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    doorMesh.position.set(-doorWidth / 2, 0, 0);
    doorGroup.add(doorMesh);
    // Maçaneta exterior e interior
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), metalMat);
    knob.position.set(-doorWidth + 2, 0, doorThickness / 2 + 0.4);
    doorGroup.add(knob);
    const knobInt = knob.clone();
    knobInt.position.set(-doorWidth + 2, 0, -doorThickness / 2 - 0.4);
    doorGroup.add(knobInt);
    buildingGroup.add(doorGroup);

    // Parede lateral direita
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(THICKNESS, HEIGHT, sideLength), wallMat);
    rightWall.position.set(WIDTH / 2 + THICKNESS / 2, HEIGHT / 2, 0);
    buildingGroup.add(rightWall);

    // Perciana
    const blindGroup = new THREE.Group();
    blindGroup.position.set(0, windowSill + windowHeight, backWallZ + THICKNESS * 0.3);
    const numSlats = 22;
    const slatHeight = 0.6;
    const slatSpacing = 0.1;
    // Várias barras horizontais
    for (let i = 0; i < Math.round(numSlats * 0.7); i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, slatHeight, THICKNESS * 0.2), blindMat);
        slat.rotation.x = -Math.PI / 8;
        slat.position.y = -(i * (slatHeight + slatSpacing)) - slatHeight / 2;
        blindGroup.add(slat);
    }
    // Parapeito
    const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(windowWidth - 0.1, 1.2, THICKNESS * 0.4), metalMat);
    bottomBar.position.y = -(Math.round(numSlats * 0.7) * (slatHeight + slatSpacing)) - 0.6;
    blindGroup.add(bottomBar);
    buildingGroup.add(blindGroup);

    // Balcão + objetos em cima do balcão
    const counterObj = createCounter();
    counterObj.group.position.set(-(WIDTH / 2) + 15, 0, DEPTH / 2 - 28);
    counterObj.group.scale.setScalar(0.8);
    
    // Ativa sombras no grupo do balcão
    counterObj.group.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    buildingGroup.add(counterObj.group);

    // Teto
    const roof = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + THICKNESS * 2, THICKNESS, DEPTH + THICKNESS * 2), wallMat);
    roof.position.y = HEIGHT + THICKNESS / 2;
    buildingGroup.add(roof);

    // Neon 
    const addNeon = (w, h, d, x, y, z) => {
        const n = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blueNeonMat);
        n.position.set(x, y, z);
        buildingGroup.add(n);
    };
    addNeon(WIDTH, 0.5, 0.5, 0, 0.25, -(DEPTH / 2));
    addNeon(0.5, 0.5, DEPTH, -(WIDTH / 2), 0.25, 0);
    addNeon(0.5, 0.5, DEPTH, WIDTH / 2, 0.25, 0);

    // Máquinas de arcade
    const arcadeMachines = [];
    scene.userData.arcadeEmissives = []; // Guardar para por cor neon
    [0xff3333, 0x33ff33, 0x3333ff, 0xffff33].forEach((color, i) => {
        const m = createArcadeMachine(color, i);
        m.group.scale.setScalar(SCALE_FACTOR);
        m.group.position.set(50, 0, -55 + i * 12);
        m.group.rotation.y = -Math.PI / 2;
        buildingGroup.add(m.group);
        arcadeMachines.push(m);
        scene.userData.arcadeEmissives.push({
            screenMat: m.screenMat,
            marqueeMat: m.marqueeMat,
            screenLight: m.screenLight
        });
    });

    // Mesa de bilhar
    const poolTable = createBilliardTable();
    const poolScale = SCALE_FACTOR * 1.0;
    poolTable.scale.setScalar(poolScale);
    poolTable.position.set(0, 0, -45);
    poolTable.rotation.y = 0;
    
    // Ativa sombras em toda a meza de bilhar + acessórios
    poolTable.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    buildingGroup.add(poolTable);

    // Mesas com as cadeiras + coisas em cima
    const tableScale = SCALE_FACTOR * 0.90;
    const roundTables = [];
    const chairs = [];
    scene.userData.tableLamps = [];
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
            
        }
        
        // Aplica sombras na mesa e em todos os adereços em cima dela
        table.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        buildingGroup.add(table);

        // 4 cadeiras em volta da mesa
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
            
            // Ativa sombras nas cadeiras
            chair.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            buildingGroup.add(chair);
        });

        // Candeeiro pendente da mesa
        const tableLamp = createLamp(true, 120);
        tableLamp.position.set(pos.x, 35, pos.z);
        tableLamp.scale.setScalar(SCALE_FACTOR * 0.8);
        buildingGroup.add(tableLamp);
        scene.userData.tableLamps.push(tableLamp);
    });

    // Planta de chão
    [{ x: 45, z: -65 }, { x: -45, z: -65 }].forEach(pos => {
        const p = createFloorPlant();
        p.scale.setScalar(SCALE_FACTOR);
        p.position.set(pos.x, 0, pos.z);
        buildingGroup.add(p);
    });

    // Balões 
    [{ x: 48, z: 0 }, { x: 48, z: 30 }, { x: 48, z: 60 }].forEach(pos => {
        const b = createBalloons();
        b.scale.setScalar(SCALE_FACTOR);
        b.position.set(pos.x, 0, pos.z);
        buildingGroup.add(b);
    });

    // Posters
    const addFrame = (x, y, z, rotY, texIndex, w = 6, h = 8) => {
        const q = createFrame(w, h, posters[texIndex % posters.length]);
        q.position.set(x, y, z);
        q.rotation.y = rotY;
        buildingGroup.add(q);
    };

    addFrame(-42, 28, backWallZ + 1.1, 0, 0); // Donkey Kong
    addFrame(-35, 22, backWallZ + 1.1, 0, 1); // Pacman
    addFrame(30, 28, backWallZ + 1.1, 0, 2);  // Space Invaders
    addFrame(37, 22, backWallZ + 1.1, 0, 3);  // Sonic
    addFrame(27, 20, backWallZ + 1.1, 0, 4, 4, 5); // Pinball
    addFrame(-(WIDTH / 2) + 1.1, 25, 0, Math.PI / 2, 5, 8, 10); // Street Fighter

    // Candeeiro de Bilhar
    const poolLamp = createLamp(true, 150);
    poolLamp.position.set(0, 35, -45);
    poolLamp.scale.setScalar(SCALE_FACTOR * 1.0);
    buildingGroup.add(poolLamp);
    scene.userData.poolLamp = poolLamp;

    // Candeeiro de Balcão
    const counterLamp = createLamp(true, 120);
    counterLamp.position.set(-(WIDTH / 2) + 15, 45, DEPTH / 2 - 28); // Por cima do balcão (-35, 35, 42)
    counterLamp.scale.setScalar(SCALE_FACTOR * 0.8);
    buildingGroup.add(counterLamp);
    scene.userData.counterLamp = counterLamp;

    // Ventoinha de Teto
    const fanObj = createCeilingFan();
    fanObj.group.position.set(0, HEIGHT - 13.5, 0);
    fanObj.group.scale.setScalar(SCALE_FACTOR * 1.5);
    buildingGroup.add(fanObj.group);


    return {
        group: buildingGroup,
        door: doorGroup,            // Porta + maçanetas
        counter: counterObj.group,  // Balcão + coisas em cima
        blinds: blindGroup,         // Perciana
        fan: fanObj.blades,         // Necessário para animar a ventoinha
        updateTheme: (theme) => {   // Função para atualizar o tema em tudo de uma vez
            roundTables.forEach(t => t.updateTheme(theme));
            arcadeMachines.forEach(m => m.updateTheme(theme));
            counterObj.updateTheme(theme);
            chairs.forEach(c => c.updateTheme(theme));
            blueNeonMat.color.setHex(theme.NEON || theme.FRAME);
            blueNeonMat.emissive.setHex(theme.NEON || theme.FRAME);
        },
    };
}
