import * as THREE from 'three';

// Cria uma árvore com tronco e copa de blobs sobrepostos
export function createTree(trunkHeight = 8, canopyRadius = 4, trunkColor = 0x5c3d1e, canopyColor = 0x2d6a2d) {
    const group = new THREE.Group();
    group.name = "Tree";

    // Tronco
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.9, trunkHeight, 8),
        new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.9 })
    );
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Copa com 3 blobs sobrepostos para aspeto mais natural
    const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.8 });
    [
        { x: 0,                    y: trunkHeight + canopyRadius * 0.7, z: 0,                    r: canopyRadius },
        { x: canopyRadius * 0.4,   y: trunkHeight + canopyRadius * 0.4, z: 0,                    r: canopyRadius * 0.75 },
        { x: -canopyRadius * 0.3,  y: trunkHeight + canopyRadius * 0.5, z: canopyRadius * 0.3,   r: canopyRadius * 0.7 },
    ].forEach(o => {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(o.r, 8, 8), canopyMat);
        blob.position.set(o.x, o.y, o.z);
        blob.castShadow = true;
        group.add(blob);
    });

    return group;
}
