import * as THREE from "three";

export function createFloorPlant() {
    const plantaGroup = new THREE.Group();

    // Materiais
    const matVase = new THREE.MeshStandardMaterial({ color: 0xc4a482, roughness: 0.8 }); // Vaso de cerâmica/bambu
    const matRim = new THREE.MeshStandardMaterial({ color: 0xe8dcd0, roughness: 0.6 });   // Aro claro do vaso
    const matEarth = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 1.0 }); // Terra escura
    const matLog = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }); // Tronco castanho fosco
    const matLeafs = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 }); // Verde árvore vivo

    // Vaso
    const vaseGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.0, 16);
    const vase = new THREE.Mesh(vaseGeo, matVase);
    vase.position.y = 0.5;
    vase.castShadow = true;
    vase.receiveShadow = true;
    plantaGroup.add(vase);

    // Borda do vaso 
    const rimGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
    const rimTop = new THREE.Mesh(rimGeo, matRim);
    rimTop.rotation.x = Math.PI / 2;
    rimTop.position.y = 1.0;
    plantaGroup.add(rimTop);


    // Terra 
    const earthGeo = new THREE.CylinderGeometry(0.62, 0.60, 0.1, 16);
    const earth = new THREE.Mesh(earthGeo, matEarth);
    earth.position.y = 0.96;
    plantaGroup.add(earth);

    // Tronco Principal
    const baseLog = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.0, 8), matLog);
    baseLog.position.set(0, 1.4, 0);
    baseLog.castShadow = true;
    plantaGroup.add(baseLog);

    // Ramos/Bifurcação
    // Ramo 1 (Direita)
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8), matLog);
    branch1.position.set(0.2, 2.3, 0.0);
    branch1.rotation.z = -Math.PI / 8; // Inclina para a direita
    branch1.castShadow = true;
    plantaGroup.add(branch1);

    // Ramo 2 (Esquerda)
    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 8), matLog);
    branch2.position.set(-0.2, 2.25, -0.05);
    branch2.rotation.z = Math.PI / 6; // Inclina para a esquerda
    branch2.castShadow = true;
    plantaGroup.add(branch2);

    // Folhagem (3 blobs)
    
    // Blob 1: Maior
    const blob1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), matFolhas);
    blob1.position.set(0.45, 3.1, 0.0);
    blob1.scale.set(1.2, 0.9, 1.2); 
    blob1.castShadow = true;
    plantaGroup.add(blob1);

    // Blob 2: Médio
    const blob2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 14), matFolhas);
    blob2.position.set(-0.5, 2.8, -0.1);
    blob2.scale.set(1.1, 0.95, 1.1);
    blob2.castShadow = true;
    plantaGroup.add(blob2);

    // Blob 3: Pequeno
    const blob3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), matFolhas);
    blob3.position.set(0.0, 3.5, 0.2);
    blob3.scale.set(1.1, 1.0, 1.1);
    blob3.castShadow = true;
    plantaGroup.add(blob3);

    return plantaGroup;
}