import * as THREE from "three";

export function setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Luz ambiente bem baixa
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.1); // Luz direcional muito fraca
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

    // Luz no teto da máquina para iluminar as cápsulas (diminuída para escurecer o arcade)
    const ceilingLight = new THREE.PointLight(0xffffff, 0.15, 50);
    ceilingLight.position.set(0, 40, 0);
    scene.add(ceilingLight);

    // Luz do lado esquerdo (diminuída para escurecer o arcade)
    const leftLight = new THREE.PointLight(0xffffff, 0.1, 60);
    leftLight.position.set(-30, 30, 20);
    scene.add(leftLight);

    // Luz focada em cima da Máquina de Garra (apenas luz, sem modelo)
    const clawSpot = new THREE.SpotLight(0xffffff, 150); // Forte
    clawSpot.position.set(-86, 48, 1);
    clawSpot.angle = Math.PI / 4;
    clawSpot.penumbra = 0.6;
    clawSpot.decay = 1.5;
    clawSpot.distance = 60;
    clawSpot.castShadow = true;
    const clawTarget = new THREE.Object3D();
    clawTarget.position.set(-86, 15, 1); // Direcionado para o corpo da máquina de garras
    scene.add(clawTarget);
    clawSpot.target = clawTarget;
    scene.add(clawSpot);

    // Guardar referências na scene para controlo de dia/noite
    scene.userData.ambientLight = ambientLight;
    scene.userData.dirLight = dirLight;
    scene.userData.ceilingLight = ceilingLight;
    scene.userData.leftLight = leftLight;
    scene.userData.clawSpot = clawSpot;
}

export function updateLightsForTimeOfDay(scene, isNight) {
    // 1. Luz Ambiente
    if (scene.userData.ambientLight) {
        scene.userData.ambientLight.intensity = isNight ? 0.05 : 0.7;
    }
    // 2. Luz Direcional (Sol/Lua)
    if (scene.userData.dirLight) {
        scene.userData.dirLight.intensity = isNight ? 0.1 : 1.0;
    }
    // 3. Luz no teto do arcade
    if (scene.userData.ceilingLight) {
        scene.userData.ceilingLight.intensity = isNight ? 0.15 : 0.8;
    }
    // 4. Luz lateral esquerda
    if (scene.userData.leftLight) {
        scene.userData.leftLight.intensity = isNight ? 0.1 : 0.6;
    }
    // 5. Spotlight da Máquina de Garras
    if (scene.userData.clawSpot) {
        scene.userData.clawSpot.intensity = isNight ? 150 : 0;
    }
    // 6. Spotlight da Mesa de Bilhar (e lâmpada física emissiva)
    if (scene.userData.poolLamp) {
        scene.userData.poolLamp.traverse(child => {
            if (child.isSpotLight) {
                child.intensity = isNight ? 150 : 0;
            }
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }
    // 7. Spotlight das Coleções
    if (scene.userData.shelfSpot) {
        scene.userData.shelfSpot.intensity = isNight ? 150 : 0;
    }
    // 8. Spotlights das Mesas Redondas
    if (scene.userData.tableSpots) {
        scene.userData.tableSpots.forEach(spot => {
            spot.intensity = isNight ? 100 : 0;
        });
    }
    // 9. Luz exterior e cor do céu na janela
    if (scene.userData.windowLight) {
        scene.userData.windowLight.color.set(isNight ? 0x4444ff : 0xffffee);
        scene.userData.windowLight.intensity = isNight ? 15 : 20;
    }
    if (scene.userData.windowSpot) {
        scene.userData.windowSpot.color.set(isNight ? 0x4444ff : 0xffeedd);
        scene.userData.windowSpot.intensity = isNight ? 20 : 30;
    }
    if (scene.userData.exteriorMat) {
        scene.userData.exteriorMat.color.set(isNight ? 0x00081e : 0x87ceeb); // Céu escuro ou azul celeste
    }
}
