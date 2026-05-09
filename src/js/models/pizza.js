import * as THREE from 'three';

// --------------------------------------------------------
// 1. PIZZA
// --------------------------------------------------------
export function createPizza() {
    const pizzaGroup = new THREE.Group();

    // Massa (Cilindro muito achatado)
    const matMassa = new THREE.MeshStandardMaterial({ color: 0xedc9af, roughness: 0.9 });
    const massa = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16), matMassa);
    pizzaGroup.add(massa);

    // Queijo/Molho (Cilindro ligeiramente mais pequeno e mais fino, por cima da massa)
    const matQueijo = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6 });
    const queijo = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16), matQueijo);
    queijo.position.y = 0.01;
    pizzaGroup.add(queijo);

    // Pepperoni (Pequenos cilindros vermelhos espalhados)
    const matPepperoni = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.7 });
    const posicoes = [
        { x: 0.3, z: 0.2 }, { x: -0.2, z: 0.4 }, { x: -0.4, z: -0.1 },
        { x: 0.1, z: -0.4 }, { x: 0.4, z: -0.2 }, { x: 0, z: 0 }
    ];

    posicoes.forEach(pos => {
        const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 8), matPepperoni);
        pep.position.set(pos.x, 0.015, pos.z);
        pizzaGroup.add(pep);
    });

    return pizzaGroup;
}