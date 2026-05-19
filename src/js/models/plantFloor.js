import * as THREE from "three";

export function createFloorPlant() {
    const plantaGroup = new THREE.Group();

    // --- Materiais ---
    const matVaso = new THREE.MeshStandardMaterial({ color: 0xc4a482, roughness: 0.8 }); // Vaso de cerâmica/bambu
    const matAro = new THREE.MeshStandardMaterial({ color: 0xe8dcd0, roughness: 0.6 });   // Aro claro do vaso
    const matTerra = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 1.0 }); // Terra escura
    const matTronco = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }); // Tronco castanho fosco
    const matFolhas = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 }); // Verde árvore vivo

    // --- Vaso ---
    const vasoGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.0, 16);
    const vaso = new THREE.Mesh(vasoGeo, matVaso);
    vaso.position.y = 0.5;
    vaso.castShadow = true;
    vaso.receiveShadow = true;
    plantaGroup.add(vaso);

    // Aros decorativos do vaso
    const rimGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
    
    const rimTopo = new THREE.Mesh(rimGeo, matAro);
    rimTopo.rotation.x = Math.PI / 2;
    rimTopo.position.y = 1.0;
    plantaGroup.add(rimTopo);


    // Terra 
    const terraGeo = new THREE.CylinderGeometry(0.62, 0.60, 0.1, 16);
    const terra = new THREE.Mesh(terraGeo, matTerra);
    terra.position.y = 0.96; // Topo fica em 0.95, ligeiramente abaixo da borda do vaso (1.0)
    plantaGroup.add(terra);

    // --- Tronco Principal (Base) ---
    const baseTronco = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.0, 8), matTronco);
    baseTronco.position.set(0, 1.4, 0); // y=1.4 é do meio da base (1.0 + 0.5 = 1.5)
    baseTronco.castShadow = true;
    plantaGroup.add(baseTronco);

    // --- Ramos/Bifurcação (Y-Split) ---
    // Ramo 1 (Direita)
    const ramo1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8), matTronco);
    ramo1.position.set(0.2, 2.3, 0.0);
    ramo1.rotation.z = -Math.PI / 8; // Inclina para a direita
    ramo1.castShadow = true;
    plantaGroup.add(ramo1);

    // Ramo 2 (Esquerda)
    const ramo2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 8), matTronco);
    ramo2.position.set(-0.2, 2.25, -0.05);
    ramo2.rotation.z = Math.PI / 6; // Inclina para a esquerda
    ramo2.castShadow = true;
    plantaGroup.add(ramo2);

    // --- Folhagem (Exatamente 3 Blobs Grandes e Organizados) ---
    
    // Blob 1: O maior, por cima do ramo da direita
    const blob1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), matFolhas);
    blob1.position.set(0.45, 3.1, 0.0);
    blob1.scale.set(1.2, 0.9, 1.2); // Ligeiramente achatado na vertical
    blob1.castShadow = true;
    plantaGroup.add(blob1);

    // Blob 2: Médio, por cima do ramo da esquerda
    const blob2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 14), matFolhas);
    blob2.position.set(-0.5, 2.8, -0.1);
    blob2.scale.set(1.1, 0.95, 1.1);
    blob2.castShadow = true;
    plantaGroup.add(blob2);

    // Blob 3: Topo/Trás para dar volume 3D
    const blob3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), matFolhas);
    blob3.position.set(0.0, 3.5, 0.2);
    blob3.scale.set(1.1, 1.0, 1.1);
    blob3.castShadow = true;
    plantaGroup.add(blob3);

    return plantaGroup;
}