import * as THREE from "three";

export function createFloorPlant() {
    const plantGroup = new THREE.Group();

    // Materiais
    const matVase = new THREE.MeshStandardMaterial({ color: 0xc4a482, roughness: 0.8 });  // Vaso de cerâmica
    const matRim = new THREE.MeshStandardMaterial({ color: 0xe8dcd0, roughness: 0.6 });   // Aro claro do vaso
    const matEarth = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 1.0 }); // Terra escura
    const matLog = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });   // Tronco castanho fosco
    const matLeaves = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 }); // Folhagem verde

    // Vaso
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.0, 16), matVase);
    vase.position.y = 0.5;
    vase.castShadow = true;
    vase.receiveShadow = true;
    plantGroup.add(vase);

    // Borda do vaso
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 24), matRim);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.0;
    plantGroup.add(rim);

    // Terra
    const earth = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.60, 0.1, 16), matEarth);
    earth.position.y = 0.96;
    plantGroup.add(earth);

    // Tronco principal
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.0, 8), matLog);
    trunk.position.set(0, 1.4, 0);
    trunk.castShadow = true;
    plantGroup.add(trunk);

    // Ramo direito
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8), matLog);
    branch1.position.set(0.2, 2.3, 0.0);
    branch1.rotation.z = -Math.PI / 8;
    branch1.castShadow = true;
    plantGroup.add(branch1);

    // Ramo esquerdo
    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 8), matLog);
    branch2.position.set(-0.2, 2.25, -0.05);
    branch2.rotation.z = Math.PI / 6;
    branch2.castShadow = true;
    plantGroup.add(branch2);

    // Folhagem — blob maior
    const blob1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), matLeaves);
    blob1.position.set(0.45, 3.1, 0.0);
    blob1.scale.set(1.2, 0.9, 1.2);
    blob1.castShadow = true;
    plantGroup.add(blob1);

    // Folhagem — blob médio
    const blob2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 14), matLeaves);
    blob2.position.set(-0.5, 2.8, -0.1);
    blob2.scale.set(1.1, 0.95, 1.1);
    blob2.castShadow = true;
    plantGroup.add(blob2);

    // Folhagem — blob pequeno
    const blob3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), matLeaves);
    blob3.position.set(0.0, 3.5, 0.2);
    blob3.scale.set(1.1, 1.0, 1.1);
    blob3.castShadow = true;
    plantGroup.add(blob3);

    return plantGroup;
}
