import * as THREE from "three";
import { THEME } from "./theme.js";

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(THEME.BACKGROUND);

    // Câmara perspetiva com FOV 60°
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 60);
    scene.add(camera);

    // Renderer com anti-aliasing e sombras PCF
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(renderer.domElement);

    // Atualiza câmara e renderer ao redimensionar a janela
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}
