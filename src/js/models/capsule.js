import * as THREE from "three";
import { THEME } from "../config/theme.js";
import { loadTextureSet } from "../systems/TextureLoader.js";

// Carrega as texturas do plástico uma única vez para todas as cápsulas
const tp = loadTextureSet(
    "./src/js/textures/plastic/Plastic017B_1K-JPG",
    ["NormalGL", "Roughness"],
    { x: 2, y: 1 } // Repetição leve para envolver a cápsula
);

// Função para criar uma cápsula
export function createCapsule() {
    const group = new THREE.Group();

    // Depende do tema
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

    // Parte inferior da cápsula
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = false; // Controlado pelo toggle de sombras no GUI
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Dobradiça
    const hinge = new THREE.Group();
    hinge.position.set(0, 0, -1.5);
    group.add(hinge);

    // Parte superior da cápsula
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(0, 0, 1.5);
    topMesh.castShadow = false; // Controlado pelo toggle de sombras no GUI
    topMesh.receiveShadow = true;
    hinge.add(topMesh);

    // Anel
    const ringGeo = new THREE.TorusGeometry(1.54, 0.075, 6, 12);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: THEME.CAPSULE_RING, flatShading: true }));
    ring.rotation.x = Math.PI / 2;
    baseMesh.add(ring);

    return {
        group: group, // O grupo principal da cápsula
        hinge: hinge //Dobradiça pa animar a cápsula a abrir
    };
}
