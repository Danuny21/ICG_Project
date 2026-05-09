import * as THREE from "three";

export function createFloorPlant() {
    const plantaGroup = new THREE.Group();

    // Vaso (Cilindro afunilado)
    const matVaso = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 1.2, 16), matVaso);
    vaso.position.y = 0.6;
    plantaGroup.add(vaso);

    // Terra
    const matTerra = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1 });
    const terra = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.21, 16), matTerra);
    terra.position.y = 0.6;
    plantaGroup.add(terra);

    // Folhagem (Uma esfera maior e algumas pequenas à volta)
    const matFolhas = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 });

    const folhaCentral = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), matFolhas);
    folhaCentral.position.y = 1.8;
    // Achatar ligeiramente a esfera para não ser perfeitamente redonda
    folhaCentral.scale.y = 0.8;
    plantaGroup.add(folhaCentral);

    const folhaLado1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), matFolhas);
    folhaLado1.position.set(0.5, 1.5, 0.3);
    plantaGroup.add(folhaLado1);

    const folhaLado2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), matFolhas);
    folhaLado2.position.set(-0.6, 1.4, -0.2);
    plantaGroup.add(folhaLado2);

    return plantaGroup;
}