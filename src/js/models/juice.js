import * as THREE from "three";

export function createJuiceGlass() {
    const group = new THREE.Group();

    // Copo de vidro transparente
    const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.1 })
    );
    glass.position.y = 0.3;
    group.add(glass);

    // Sumo laranja
    const juice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.14, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 })
    );
    juice.position.y = 0.25;
    group.add(juice);

    // Palhinha inclinada
    const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xff3333 })
    );
    straw.position.set(0.05, 0.4, 0);
    straw.rotation.z = -Math.PI * 0.1;
    group.add(straw);

    return group;
}
