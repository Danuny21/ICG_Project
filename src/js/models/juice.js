import * as THREE from "three";

export function createJuiceGlass() {
    const copoGroup = new THREE.Group();

    // Vidro
    const matGlass = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1
    });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16), matGlass);
    glass.position.y = 0.3; // Levanta para a base ficar no Y=0
    copoGroup.add(glass);

    // Sumo
    const matJuice = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 });
    const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.45, 16), matJuice);
    juice.position.y = 0.25;
    copoGroup.add(juice);

    // Palhinha
    const matStraw = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8), matStraw);
    straw.position.set(0.05, 0.4, 0);
    straw.rotation.z = -Math.PI * 0.1; 
    copoGroup.add(straw);

    return copoGroup;
}