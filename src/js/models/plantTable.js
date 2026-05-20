import * as THREE from 'three';

export function createTablePlant() {
    const plantaGroup = new THREE.Group();

    // Vaso pequeno (Terracota)
    const matVase = new THREE.MeshStandardMaterial({ color: 0xcd5c5c, roughness: 0.9 });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12), matVase);
    vase.position.y = 0.15;
    plantaGroup.add(vase);

    // Cato principal (Cilindro arredondado simulado com cápsula ou esfera esticada)
    const matCactus = new THREE.MeshStandardMaterial({ color: 0x32cd32, roughness: 0.8 });
    const cactus = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matCactus);
    cactus.position.y = 0.4;
    cactus.scale.y = 1.5; // Estica para cima
    plantaGroup.add(cactus);

    // Braço do cato
    const branch = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matCactus);
    branch.position.set(0.15, 0.45, 0);
    branch.rotation.z = Math.PI * 0.2;
    plantaGroup.add(branch);

    return plantaGroup;
}