import * as THREE from 'three';

export function createTablePlant() {
    const group = new THREE.Group();

    // Vaso pequeno de terracota
    const matVase = new THREE.MeshStandardMaterial({ color: 0xcd5c5c, roughness: 0.9 });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12), matVase);
    vase.position.y = 0.15;
    group.add(vase);

    // Corpo principal do cacto
    const matCactus = new THREE.MeshStandardMaterial({ color: 0x32cd32, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matCactus);
    body.position.y = 0.4;
    body.scale.y = 1.5;
    group.add(body);

    // Braço lateral do cacto
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matCactus);
    arm.position.set(0.15, 0.45, 0);
    arm.rotation.z = Math.PI * 0.2;
    group.add(arm);

    return group;
}
