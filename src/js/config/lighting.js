import * as THREE from "three";

export function setupLighting(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(36, 72, 24);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -24;
    dirLight.shadow.camera.right = 24;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    // Luz no teto da máquina para iluminar as cápsulas
    const ceilingLight = new THREE.PointLight(0xffffff, 1.2, 50);
    ceilingLight.position.set(0, 40, 0);
    scene.add(ceilingLight);

    // Luz do lado esquerdo para melhorar a visibilidade lateral
    const leftLight = new THREE.PointLight(0xffffff, 0.8, 60);
    leftLight.position.set(-30, 30, 20);
    scene.add(leftLight);
}
