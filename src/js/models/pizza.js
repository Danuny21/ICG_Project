import * as THREE from 'three';

export function createPizza() {
    const group = new THREE.Group();

    // Massa
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0xedc9af, roughness: 0.9 })
    );
    group.add(base);

    // Queijo
    const cheese = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6 })
    );
    cheese.position.y = 0.01;
    group.add(cheese);

    // Pepperoni
    const pepMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.7 });
    const pepGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.07, 8);
    [
        [0.3, 0.2], [-0.2, 0.4], [-0.4, -0.1],
        [0.1, -0.4], [0.4, -0.2], [0, 0]
    ].forEach(([x, z]) => {
        const pep = new THREE.Mesh(pepGeo, pepMat);
        pep.position.set(x, 0.015, z);
        group.add(pep);
    });

    return group;
}
