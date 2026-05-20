import * as THREE from 'three';

export function createFloatingShelf(width = 30) {
    const shelfGroup = new THREE.Group();
    shelfGroup.name = "FloatingShelf";

    // Material da estante
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

    // Suportes metálicos inclinados
    const supportGeom = new THREE.BoxGeometry(0.8, 2.5, 0.8);

    // Distribuir suportes dependendo da largura
    const numSupports = Math.max(2, Math.floor(width / 10) + 1);
    const spacing = (width - 2) / (numSupports - 1);

    for (let i = 0; i < numSupports; i++) {
        const support = new THREE.Mesh(supportGeom, metalMaterial);
        const posX = -width / 2 + 1 + i * spacing;
        support.rotation.x = Math.PI / 8;
        support.position.set(posX, -1, 0);

        shelfGroup.add(support);
    }

    shelfGroup.position.set(0, 0, 0);

    return shelfGroup;
}