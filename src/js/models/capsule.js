import * as THREE from "three";
import { THEME } from "../config/theme.js";
import { loadTextureSet } from "../systems/TextureLoader.js";

// Carrega as texturas do plástico uma única vez para todas as cápsulas
const tp = loadTextureSet(
    "./src/js/textures/plastic/Plastic017B_1K-JPG",
    ["NormalGL", "Roughness"],
    { x: 2, y: 1 } // Repetição leve para envolver a cápsula
);

export function createCapsule() {
    const group = new THREE.Group();

    const colors = THEME.COLOR_PALETTE;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const baseMat = new THREE.MeshPhongMaterial({ 
        color: randomColor, 
        normalMap: tp.normal,
        specularMap: tp.roughness,
        flatShading: true, 
        shininess: 100, 
        side: THREE.DoubleSide 
    });
    const topMat = new THREE.MeshPhongMaterial({ 
        color: THEME.CAPSULE_TOP, 
        normalMap: tp.normal,
        specularMap: tp.roughness,
        flatShading: true, 
        shininess: 100, 
        transparent: false, 
        opacity: 1.0, 
        side: THREE.DoubleSide 
    });
    topMat.userData.originalOpacity = 0.4;

    const baseGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const topGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);

    // Bottom half
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Hinge (allows opening)
    const hinge = new THREE.Group();
    hinge.position.set(0, 0, -1.5);
    group.add(hinge);

    // Top half
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(0, 0, 1.5);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    hinge.add(topMesh);

    // Ring
    const ringGeo = new THREE.TorusGeometry(1.54, 0.075, 6, 12);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: THEME.CAPSULE_RING, flatShading: true }));
    ring.rotation.x = Math.PI / 2;
    baseMesh.add(ring);

    // Exporta o grupo e a dobradiça
    return {
        group: group,
        hinge: hinge
    };
}
