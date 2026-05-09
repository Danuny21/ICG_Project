import * as THREE from "three";

export function createJuiceGlass() {
    const copoGroup = new THREE.Group();

    // Vidro (Cilindro transparente)
    const matVidro = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1
    });
    const vidro = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16), matVidro);
    vidro.position.y = 0.3; // Levanta para a base ficar no Y=0
    copoGroup.add(vidro);

    // Sumo (Laranja)
    const matSumo = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 });
    const sumo = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.45, 16), matSumo);
    sumo.position.y = 0.25;
    copoGroup.add(sumo);

    // Palhinha (Cilindro fino inclinado)
    const matPalhinha = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    const palhinha = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8), matPalhinha);
    palhinha.position.set(0.05, 0.4, 0);
    palhinha.rotation.z = -Math.PI * 0.1; // Inclina um pouco
    copoGroup.add(palhinha);

    return copoGroup;
}