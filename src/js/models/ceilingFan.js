import * as THREE from 'three';

export function createCeilingFan() {
    const fanGroup = new THREE.Group();
    fanGroup.name = "CeilingFan";

    // Materiais
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.2 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3c31, roughness: 0.8 }); // Madeira escura

    // Haste de suspensão
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3), metalMat);
    rod.position.y = 1.5; 
    fanGroup.add(rod);

    // Base das pás
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), metalMat);
    motor.position.y = 0;
    fanGroup.add(motor);

    // Grupo de rotação das pás
    const bladesGroup = new THREE.Group();
    bladesGroup.position.y = -0.1;
    fanGroup.add(bladesGroup);

    // 4 Pás
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 0.8), woodMat);
        blade.position.x = 2.5;
        blade.rotation.x = Math.PI / 12;

        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI) / 2;
        pivot.add(blade);
        bladesGroup.add(pivot);
    }

    return {
        group: fanGroup,
        blades: bladesGroup
    };
}
