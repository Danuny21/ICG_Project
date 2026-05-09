import * as THREE from 'three';

export function createTablePlant() {
    const plantaGroup = new THREE.Group();

    // Vaso pequeno (Terracota)
    const matVaso = new THREE.MeshStandardMaterial({ color: 0xcd5c5c, roughness: 0.9 });
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12), matVaso);
    vaso.position.y = 0.15;
    plantaGroup.add(vaso);

    // Cato principal (Cilindro arredondado simulado com cápsula ou esfera esticada)
    const matCato = new THREE.MeshStandardMaterial({ color: 0x32cd32, roughness: 0.8 });
    const cato = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matCato);
    cato.position.y = 0.4;
    cato.scale.y = 1.5; // Estica para cima
    plantaGroup.add(cato);

    // Braço do cato
    const braco = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matCato);
    braco.position.set(0.15, 0.45, 0);
    braco.rotation.z = Math.PI * 0.2;
    plantaGroup.add(braco);

    return plantaGroup;
}