import * as THREE from "three";

export function setupLighting(scene) {
    // ── Luz de Preenchimento ──────────────────────────────────────────────────
    // HemisphereLight simula luz que "vaza" da rua e reflete nas paredes.
    // Céu: azul-escuro/roxo noturno | Chão: cinza escuro
    const hemiLight = new THREE.HemisphereLight(0x0a0a2e, 0x222222, 0.15);
    scene.add(hemiLight);

    // ── Luz Direcional (Sol de dia / Lua de noite) ───────────────────────────
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.1);
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

    // Guardar referências na scene para controlo de dia/noite
    scene.userData.hemiLight = hemiLight;
    scene.userData.dirLight = dirLight;
}

export function updateLightsForTimeOfDay(scene, isNight) {
    // 1. HemisphereLight — preenchimento ambiente
    if (scene.userData.hemiLight) {
        if (isNight) {
            scene.userData.hemiLight.color.set(0x1a1a3e);      // Céu noturno ligeiramente mais claro
            scene.userData.hemiLight.groundColor.set(0x333333); // Chão cinza claro
            scene.userData.hemiLight.intensity = 0.35;         // Aumentado de 0.15
        } else {
            scene.userData.hemiLight.color.set(0x87ceeb);       // Céu azul claro
            scene.userData.hemiLight.groundColor.set(0x886644); // Chão castanho quente
            scene.userData.hemiLight.intensity = 0.6;
        }
    }

    // 2. Luz Direcional (Sol/Lua)
    if (scene.userData.dirLight) {
        scene.userData.dirLight.intensity = isNight ? 0.05 : 1.0;
        scene.userData.dirLight.color.set(isNight ? 0x8888cc : 0xffffff);
    }

    // 4. Luz interior da Máquina de Garras (ilumina cápsulas)
    if (scene.userData.clawInteriorLight) {
        scene.userData.clawInteriorLight.intensity = isNight ? 50 : 0; // A luz dentro da máquina é mantida
    }
    if (scene.userData.clawInteriorBottomLight) {
        scene.userData.clawInteriorBottomLight.intensity = isNight ? 50 : 0; // Ilumina cápsulas de perto
    }

    // 4.1. Candeeiro Físico em cima da Máquina de Garras
    if (scene.userData.clawLamp) {
        scene.userData.clawLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 500 : 0; // Mais forte porque está alto
            if (child.isPointLight) child.intensity = isNight ? 150 : 0; // Ilumina a interior do abajur
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // 5. Spotlight da Mesa de Bilhar (e lâmpada física emissiva)
    if (scene.userData.poolLamp) {
        scene.userData.poolLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 600 : 0;
            if (child.isPointLight) child.intensity = isNight ? 150 : 0;
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // 8. Candeeiros pendentes das Mesas Redondas
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

    // 9. Candeeiro pendente do Balcão
    if (scene.userData.counterLamp) {
        scene.userData.counterLamp.traverse(child => {
            if (child.isSpotLight) child.intensity = isNight ? 500 : 0;
            if (child.isPointLight) child.intensity = isNight ? 150 : 0;
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissiveIntensity = isNight ? 2.0 : 0.0;
            }
        });
    }

    // 11. Ecrãs e letreiros emissivos das Máquinas de Arcada
    if (scene.userData.arcadeEmissives) {
        scene.userData.arcadeEmissives.forEach(({ screenMat, marqueeMat, screenLight }) => {
            screenMat.emissiveIntensity = isNight ? 2.0 : 0;
            marqueeMat.emissiveIntensity = isNight ? 3.0 : 0.5;
            screenLight.intensity = isNight ? 2 : 0;
        });
    }
}
