import * as THREE from "three";

export function setupLighting(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(36, 72, 24);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left  = -24;
    dirLight.shadow.camera.right =  24;
    dirLight.shadow.camera.top   =  40;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 36);
    pointLight.position.set(0, 18, 0);
    scene.add(pointLight);
}
