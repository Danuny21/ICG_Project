import * as THREE from 'three';

export function createFloatingShelf(width = 30) {
    const shelfGroup = new THREE.Group();
    shelfGroup.name = "FloatingShelf";

    // Material da estante (tipo madeira escura)
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.8,
        metalness: 0.1
    });

    // Material dos suportes de metal
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.8
    });

    const depth = 4;
    const thickness = 0.5;

    // A Tábua Principal
    const boardGeom = new THREE.BoxGeometry(width, thickness, depth);
    const board = new THREE.Mesh(boardGeom, woodMaterial);
    board.position.set(0, thickness / 2, 0);
    shelfGroup.add(board);

    // Suportes metálicos por baixo da prateleira
    const supportGeom = new THREE.BoxGeometry(0.2, 2, depth - 0.5);
    
    // Distribuir suportes dependendo da largura
    const numSupports = Math.max(2, Math.floor(width / 10) + 1);
    const spacing = (width - 2) / (numSupports - 1);
    
    for (let i = 0; i < numSupports; i++) {
        const support = new THREE.Mesh(supportGeom, metalMaterial);
        const posX = -width / 2 + 1 + i * spacing;
        // Posicionar abaixo da tábua, alinhado com a parte de trás
        support.position.set(posX, -1 + thickness / 2, -0.25);
        shelfGroup.add(support);
    }

    // Centrar o pivot na base da tábua
    shelfGroup.position.set(0, 0, 0);

    return shelfGroup;
}