import * as THREE from "three";
import { carregarConjuntoTexturas } from "../systems/TextureLoader.js";
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

export function createArcadeBuilding(scene) {
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const LARGURA = 100;
    const ALTURA = 50;
    const PROFUNDIDADE = 140;
    const ESPESSURA = 2;
    const SCALE_FACTOR = 3;

    // --- Materiais ---
    let matParede = new THREE.MeshPhongMaterial({ color: 0x1a1a3e, shininess: 30 });
    const matNeonAzul = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 });
    const matVidro = new THREE.MeshPhongMaterial({ color: 0x88ddff, transparent: true, opacity: 0.15, shininess: 100, side: THREE.DoubleSide });
    const matPorta = new THREE.MeshPhongMaterial({ color: 0x222233, shininess: 40 });
    const matMetal = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });
    const matPerciana = new THREE.MeshPhongMaterial({ color: 0x33333d, shininess: 80, side: THREE.DoubleSide });

    // --- Texturas ---
    const floorTex = carregarConjuntoTexturas(
        "./src/js/textures/floor/Tiles074_1K-JPG",
        ["Color", "NormalGL", "Roughness", "Displacement"],
        { x: LARGURA / 20, y: PROFUNDIDADE / 20 }
    );
    const matChao = new THREE.MeshPhongMaterial({
        map: floorTex.color, normalMap: floorTex.normal,
        specularMap: floorTex.roughness, shininess: 60, specular: 0x444444
    });

    const wallTex = carregarConjuntoTexturas(
        "./src/js/textures/wall/PaintedPlaster017_1K-JPG",
        ["Color", "NormalGL", "Roughness", "Displacement"],
        { x: 4, y: 2 }
    );
    matParede.map = wallTex.color;
    matParede.normalMap = wallTex.normal;
    matParede.specularMap = wallTex.roughness;
    matParede.color.set(0x666688);

    const loader = new THREE.TextureLoader();
    const posters = [1, 2, 3, 4].map(i => loader.load(`./src/js/textures/frames/poster${i}.png`));

    // --- Piso ---
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA, PROFUNDIDADE), matChao);
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    buildingGroup.add(chao);

    // --- Parede Traseira com janela ---
    const paredeTraseiraZ = -(PROFUNDIDADE / 2) - ESPESSURA / 2;
    const janelaLargura = 30;
    const janelaAltura = 18;
    const janelaPeitoril = 12;
    const largAsa = (LARGURA - janelaLargura) / 2;

    [
        [largAsa, ALTURA, -(LARGURA / 2) + largAsa / 2, ALTURA / 2],
        [largAsa, ALTURA, LARGURA / 2 - largAsa / 2, ALTURA / 2],
    ].forEach(([w, h, x, y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, ESPESSURA), matParede);
        m.position.set(x, y, paredeTraseiraZ);
        buildingGroup.add(m);
    });

    const trasBaixo = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura, janelaPeitoril, ESPESSURA), matParede);
    trasBaixo.position.set(0, janelaPeitoril / 2, paredeTraseiraZ);
    buildingGroup.add(trasBaixo);

    const altCimaTras = ALTURA - janelaPeitoril - janelaAltura;
    const trasCima = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura, altCimaTras, ESPESSURA), matParede);
    trasCima.position.set(0, ALTURA - altCimaTras / 2, paredeTraseiraZ);
    buildingGroup.add(trasCima);

    const vidroTras = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura - 0.1, janelaAltura - 0.1, ESPESSURA * 0.1), matVidro);
    vidroTras.position.set(0, janelaPeitoril + janelaAltura / 2, paredeTraseiraZ + ESPESSURA * 0.3);
    buildingGroup.add(vidroTras);

    // --- Exterior (rua fora da janela) ---
    const streetTex = loader.load("./src/js/textures/night_street.png");
    const exterior = new THREE.Mesh(
        new THREE.PlaneGeometry(janelaLargura * 3, janelaAltura * 3),
        new THREE.MeshBasicMaterial({ map: streetTex, side: THREE.DoubleSide })
    );
    exterior.position.set(0, 25, paredeTraseiraZ - 20);
    buildingGroup.add(exterior);

    const luzJanela = new THREE.PointLight(0x4444ff, 15, 100);
    luzJanela.position.set(0, 21, paredeTraseiraZ - 5);
    buildingGroup.add(luzJanela);

    const focoJanela = new THREE.SpotLight(0x4444ff, 20, 150, Math.PI / 3, 0.5);
    focoJanela.position.set(0, 21, paredeTraseiraZ - 2);
    focoJanela.target.position.set(0, 10, 0);
    buildingGroup.add(focoJanela);
    buildingGroup.add(focoJanela.target);

    // --- Parede Esquerda ---
    const compLateral = PROFUNDIDADE + ESPESSURA * 2;
    const paredeEsq = new THREE.Mesh(new THREE.BoxGeometry(ESPESSURA, ALTURA, compLateral), matParede);
    paredeEsq.position.set(-(LARGURA / 2) - ESPESSURA / 2, ALTURA / 2, 0);
    buildingGroup.add(paredeEsq);

    // --- Parede Frontal com porta ---
    const portaLargura = 14;
    const portaAltura = 22;
    const paredeFrenteZ = PROFUNDIDADE / 2 + ESPESSURA / 2;
    const largPilar = (LARGURA - portaLargura) / 2;

    [
        [-(LARGURA / 2) + largPilar / 2, ALTURA / 2],
        [LARGURA / 2 - largPilar / 2, ALTURA / 2],
    ].forEach(([x, y]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(largPilar, ALTURA, ESPESSURA), matParede);
        p.position.set(x, y, paredeFrenteZ);
        buildingGroup.add(p);
    });

    const altViga = ALTURA - portaAltura;
    const vigaFrente = new THREE.Mesh(new THREE.BoxGeometry(portaLargura, altViga, ESPESSURA), matParede);
    vigaFrente.position.set(0, ALTURA - altViga / 2, paredeFrenteZ);
    buildingGroup.add(vigaFrente);

    // --- Porta ---
    const portaGroup = new THREE.Group();
    portaGroup.position.set(portaLargura / 2, portaAltura / 2, paredeFrenteZ);
    const espessuraPorta = ESPESSURA * 0.4;
    const portaMalha = new THREE.Mesh(new THREE.BoxGeometry(portaLargura, portaAltura, espessuraPorta), matPorta);
    portaMalha.position.set(-portaLargura / 2, 0, 0);
    portaGroup.add(portaMalha);
    const macaneta = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), matMetal);
    macaneta.position.set(-portaLargura + 2, 0, espessuraPorta / 2 + 0.4);
    portaGroup.add(macaneta);
    const macanetaInt = macaneta.clone();
    macanetaInt.position.set(-portaLargura + 2, 0, -espessuraPorta / 2 - 0.4);
    portaGroup.add(macanetaInt);
    buildingGroup.add(portaGroup);

    // --- Parede Direita ---
    const paredeDir = new THREE.Mesh(new THREE.BoxGeometry(ESPESSURA, ALTURA, compLateral), matParede);
    paredeDir.position.set(LARGURA / 2 + ESPESSURA / 2, ALTURA / 2, 0);
    buildingGroup.add(paredeDir);

    // --- Perciana ---
    const percianaGroup = new THREE.Group();
    percianaGroup.position.set(0, janelaPeitoril + janelaAltura, paredeTraseiraZ + ESPESSURA * 0.3);
    const numLaminas = 22;
    const alturaLamina = 0.6;
    const espacamentoLamina = 0.1;
    for (let i = 0; i < Math.round(numLaminas * 0.7); i++) {
        const lamina = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura - 0.1, alturaLamina, ESPESSURA * 0.2), matPerciana);
        lamina.rotation.x = -Math.PI / 8;
        lamina.position.y = -(i * (alturaLamina + espacamentoLamina)) - alturaLamina / 2;
        percianaGroup.add(lamina);
    }
    const barraInferior = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura - 0.1, 1.2, ESPESSURA * 0.4), matMetal);
    barraInferior.position.y = -(Math.round(numLaminas * 0.7) * (alturaLamina + espacamentoLamina)) - 0.6;
    percianaGroup.add(barraInferior);
    buildingGroup.add(percianaGroup);

    // --- Balcão ---
    const balcaoGroup = createCounter();
    balcaoGroup.position.set(-(LARGURA / 2) + 15, 0, PROFUNDIDADE / 2 - 28);
    balcaoGroup.scale.setScalar(0.8);
    buildingGroup.add(balcaoGroup);

    // --- Teto ---
    const teto = new THREE.Mesh(new THREE.BoxGeometry(LARGURA + ESPESSURA * 2, ESPESSURA, PROFUNDIDADE + ESPESSURA * 2), matParede);
    teto.position.y = ALTURA + ESPESSURA / 2;
    buildingGroup.add(teto);

    // --- Neons de rodapé ---
    const addNeon = (w, h, d, x, y, z) => {
        const n = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matNeonAzul);
        n.position.set(x, y, z);
        buildingGroup.add(n);
    };
    addNeon(LARGURA, 0.5, 0.5, 0, 0.25, -(PROFUNDIDADE / 2));
    addNeon(0.5, 0.5, PROFUNDIDADE, -(LARGURA / 2), 0.25, 0);
    addNeon(0.5, 0.5, PROFUNDIDADE, LARGURA / 2, 0.25, 0);

    // --- Máquinas de Arcade ---
    [0xff3333, 0x33ff33, 0x3333ff, 0xffff33].forEach((cor, i) => {
        const m = createArcadeMachine(cor);
        m.scale.setScalar(SCALE_FACTOR);
        m.position.set(50, 0, -55 + i * 12);
        m.rotation.y = -Math.PI / 2;
        buildingGroup.add(m);
    });

    // --- Mesa de Bilhar ---
    const bilhar = createBilliardTable();
    const bilharScale = SCALE_FACTOR * 1.5 * 0.80;
    bilhar.scale.setScalar(bilharScale);
    bilhar.position.set(0, 0, -55);
    bilhar.rotation.y = Math.PI / 2;
    buildingGroup.add(bilhar);

    // --- Mesas Redondas com cadeiras ---
    const mesaScale = SCALE_FACTOR * 0.90;
    [{ x: 32, z: 15 }, { x: 32, z: 45 }].forEach((pos, index) => {
        const mesa = createRoundTable();
        mesa.scale.setScalar(mesaScale);
        mesa.position.set(pos.x, 0, pos.z);

        if (index === 0) {
            const pizza = createPizza();
            pizza.position.set(0, 3.1, 0);
            mesa.add(pizza);
            [{ x: 1.2, z: 0.5 }, { x: -1.0, z: -0.8 }].forEach(p => {
                const j = createJuiceGlass();
                j.position.set(p.x, 3.1, p.z);
                mesa.add(j);
            });
        } else {
            const plant = createTablePlant();
            plant.position.set(0, 3.1, 0);
            mesa.add(plant);
            const juice = createJuiceGlass();
            juice.position.set(1.0, 3.1, -0.5);
            mesa.add(juice);
        }
        buildingGroup.add(mesa);

        const offsetCadeira = 9;
        [0, Math.PI, Math.PI / 2, -Math.PI / 2].forEach((rot, i) => {
            const cadeira = createChair();
            cadeira.scale.setScalar(SCALE_FACTOR);
            const px = i < 2 ? pos.x : (i === 2 ? pos.x - offsetCadeira : pos.x + offsetCadeira);
            const pz = i < 2 ? (i === 0 ? pos.z - offsetCadeira : pos.z + offsetCadeira) : pos.z;
            cadeira.position.set(px, 0, pz);
            cadeira.rotation.y = rot;
            buildingGroup.add(cadeira);
        });
    });

    // --- Plantas de chão ---
    [{ x: -45, z: 65 }, { x: 45, z: -65 }].forEach(pos => {
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

    // --- Quadros ---
    const addFrame = (x, y, z, rotY, texIndex, w = 6, h = 8) => {
        const q = createFrame(w, h, posters[texIndex % posters.length]);
        q.position.set(x, y, z);
        q.rotation.y = rotY;
        buildingGroup.add(q);
    };
    addFrame(-42, 28, -(PROFUNDIDADE / 2), 0, 0);
    addFrame(-35, 22, -(PROFUNDIDADE / 2), 0, 1);
    addFrame(30, 28, -(PROFUNDIDADE / 2), 0, 2);
    addFrame(37, 22, -(PROFUNDIDADE / 2), 0, 3);
    addFrame(27, 20, -(PROFUNDIDADE / 2) + 0.6, 0, 0, 4, 5);
    addFrame(-(LARGURA / 2) + 0.6, 25, 0, Math.PI / 2, 2, 8, 10);

    return {
        grupo: buildingGroup,
        porta: portaGroup,
        balcao: balcaoGroup,
        perciana: percianaGroup,
    };
}
