import * as THREE from "three";

export function setupLighting(scene) {
    // Luz de Preenchimento
    // Céu: azul-escuro/roxo noturno | Chão: cinzento escuro
    const hemiLight = new THREE.HemisphereLight(0x0a0a2e, 0x222222, 0.15);
    scene.add(hemiLight);

    // ── Luz Direcional (Sol de dia / Lua de noite) ───────────────────────────
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.1);
    dirLight.position.set(36, 72, 24);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -150;
    dirLight.shadow.camera.right = 150;
    dirLight.shadow.camera.top = 150;
    dirLight.shadow.camera.bottom = -150;
    scene.add(dirLight);

    // Guardar referências na scene para controlo de dia/noite
    scene.userData.hemiLight = hemiLight;
    scene.userData.dirLight = dirLight;
}

export function updateLightsForTimeOfDay(scene, isNight) {
    // Cor de fundo da cena (céu)
    scene.background?.set(isNight ? 0x0a0a1a : 0x87ceeb);
    if (scene.userData.hemiLight) {
        if (isNight) {
            scene.userData.hemiLight.color.set(0x1a1a3e);           // Céu noturno
            scene.userData.hemiLight.groundColor.set(0x333333);     // Chão cinza claro
            scene.userData.hemiLight.intensity = 0.35;
        } else {
            scene.userData.hemiLight.color.set(0x87ceeb);          // Céu azul claro
            scene.userData.hemiLight.groundColor.set(0x886644);    // Chão castanho quente
            scene.userData.hemiLight.intensity = 0.6;
        }
    }

    // Luz Direcional (Sol/Lua)
    if (scene.userData.dirLight) {
        scene.userData.dirLight.intensity = isNight ? 0.05 : 1.0;
        scene.userData.dirLight.color.set(isNight ? 0x8888cc : 0xffffff);
    }

    // Luz interior da Máquina de Garras — intensidade baixa de dia, alta de noite
    if (scene.userData.clawInteriorLight) {
        scene.userData.clawInteriorLight.intensity = isNight ? 2000 : 80;
    }

    // Candeeiro em cima da Máquina de Garras
    if (scene.userData.clawLamp) {
        scene.userData.clawLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 500 : 0;         // Ilumina o chão
            if (child.isPointLight) child.intensity = isNight ? 150 : 0;        // Ilumina a interior do candeiro
            if (child.isMesh && child.material && child.material.emissive) {    // Faz o interior do candeiro brilhar
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // Candeeiro em cima da Mesa de Bilhar
    if (scene.userData.poolLamp) {
        scene.userData.poolLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 600 : 0;
            if (child.isPointLight) child.intensity = isNight ? 150 : 0;
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // Candeeiros em cima das Mesas Redondas
    if (scene.userData.tableLamps) {
        scene.userData.tableLamps.forEach(lamp => {
            lamp.traverse(child => {
                if (child.isSpotLight) child.intensity = isNight ? 500 : 0;
                if (child.isPointLight) child.intensity = isNight ? 150 : 0;
                if (child.isMesh && child.material && child.material.emissive) {
                    child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
                }
            });
        });
    }

    // 9. Candeeiro em cima do Balcão
    if (scene.userData.counterLamp) {
        scene.userData.counterLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 500 : 0;
            if (child.isPointLight) child.intensity = isNight ? 150 : 0;
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // Ecrãs e letreiros das Máquinas de Arcade
    // Menos itensidade pa parecer "neon"
    if (scene.userData.arcadeEmissives) {
        scene.userData.arcadeEmissives.forEach(({ screenMat, marqueeMat, screenLight }) => {
            screenMat.emissiveIntensity = isNight ? 2.0 : 0;
            marqueeMat.emissiveIntensity = isNight ? 3.0 : 0.5;
            screenLight.intensity = isNight ? 2 : 0;
        });
    }
}
