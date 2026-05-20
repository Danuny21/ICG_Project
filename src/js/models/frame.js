import * as THREE from 'three';

export function createFrame(width = 10, height = 14, texture = null) {
    const group = new THREE.Group();
    group.name = "Frame";

    // Moldura exterior
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.5),
        new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 50 })
    );
    frame.castShadow = true;
    group.add(frame);

    // Painel interior (poster ou fundo escuro)
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(width - 1, height - 1, 0.1),
        new THREE.MeshPhongMaterial({ color: texture ? 0xffffff : 0x050505, map: texture, shininess: 10 })
    );
    back.position.z = 0.25;
    group.add(back);

    return group;
}
