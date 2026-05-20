import * as THREE from 'three';

// Criar pizza
export function createPizza() {
    const pizzaGroup = new THREE.Group();

    // Massa
    const matBase = new THREE.MeshStandardMaterial({ color: 0xedc9af, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16), matBase);
    pizzaGroup.add(base);

    // Queijoo
    const matCheese = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6 });
    const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16), matCheese);
    cheese.position.y = 0.01;
    pizzaGroup.add(cheese);

    // Pepperoni
    const matPepperoni = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.7 });
    const positions = [
        { x: 0.3, z: 0.2 }, { x: -0.2, z: 0.4 }, { x: -0.4, z: -0.1 },
        { x: 0.1, z: -0.4 }, { x: 0.4, z: -0.2 }, { x: 0, z: 0 }
    ];

    // Criar os pepperonis
    positions.forEach(pos => {
        const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 8), matPepperoni);
        pep.position.set(pos.x, 0.015, pos.z);
        pizzaGroup.add(pep);
    });

    return pizzaGroup;
}