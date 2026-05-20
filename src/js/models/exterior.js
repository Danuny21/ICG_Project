import * as THREE from 'three';
import { createTree } from './tree.js';
import { createBuilding } from './building.js';

// Cria o exterior visível pela janela traseira: chão, céu, árvores e prédios
export function createExterior(windowWidth, windowHeight, windowSill, backWallZ) {
    const group = new THREE.Group();

    const DEPTH = 120;

    // Chão exterior (relva)
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(windowWidth * 6, DEPTH),
        new THREE.MeshStandardMaterial({ color: 0x2d5a1b, roughness: 1.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, backWallZ - DEPTH / 2);
    group.add(ground);

    // Céu de fundo
    const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(windowWidth * 6, windowHeight * 5),
        new THREE.MeshBasicMaterial({ color: 0x000033, side: THREE.BackSide })
    );
    sky.position.set(0, windowSill + windowHeight * 1.5, backWallZ - DEPTH);
    group.add(sky);

    // Árvores afastadas da janela
    [
        { x: -22, z: backWallZ - 22, h: 10, r: 5 },
        { x:  -9, z: backWallZ - 28, h: 14, r: 6 },
        { x:   4, z: backWallZ - 24, h: 11, r: 5 },
        { x:  16, z: backWallZ - 20, h:  9, r: 4 },
        { x:  24, z: backWallZ - 30, h: 13, r: 6 },
        { x: -30, z: backWallZ - 35, h: 16, r: 7 },
        { x:  32, z: backWallZ - 38, h: 15, r: 6 },
        { x:  -5, z: backWallZ - 45, h: 18, r: 8 },
        { x:  14, z: backWallZ - 50, h: 17, r: 7 },
        { x: -18, z: backWallZ - 55, h: 12, r: 5 },
    ].forEach(cfg => {
        const tree = createTree(cfg.h, cfg.r);
        tree.position.set(cfg.x, 0, cfg.z);
        group.add(tree);
    });

    // Prédios ao fundo, entre e atrás das árvores
    [
        { x: -40, z: backWallZ - 40, w: 12, h: 35, d: 10 },
        { x: -20, z: backWallZ - 55, w:  9, h: 50, d:  9 },
        { x:   0, z: backWallZ - 60, w: 14, h: 42, d: 12 },
        { x:  22, z: backWallZ - 50, w: 10, h: 38, d: 10 },
        { x:  42, z: backWallZ - 42, w: 11, h: 45, d: 11 },
        { x: -55, z: backWallZ - 60, w: 16, h: 28, d: 14 },
        { x:  55, z: backWallZ - 58, w: 13, h: 32, d: 12 },
        { x:  -8, z: backWallZ - 80, w: 18, h: 60, d: 14 },
        { x:  20, z: backWallZ - 75, w: 12, h: 55, d: 10 },
    ].forEach(cfg => {
        const building = createBuilding(cfg.w, cfg.h, cfg.d);
        building.position.set(cfg.x, 0, cfg.z);
        group.add(building);
    });

    return group;
}
