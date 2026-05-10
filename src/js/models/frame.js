import * as THREE from 'three';

export function createFrame(width = 10, height = 14) {
    const frameGroup = new THREE.Group();
    frameGroup.name = "Frame";

    // Moldura
    const frameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        shininess: 50 
    });
    const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.5), 
        frameMaterial
    );
    frameMesh.castShadow = true;
    frameGroup.add(frameMesh);

    // Fundo (onde ficaria a arte)
    const backMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x050505, 
        shininess: 10 
    });
    const backMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width - 1, height - 1, 0.1), 
        backMaterial
    );
    backMesh.position.z = 0.25;
    frameGroup.add(backMesh);

    return frameGroup;
}
