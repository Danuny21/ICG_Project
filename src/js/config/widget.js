import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';
import { EASY_MODE, NORMAL_MODE, HARD_MODE } from "./dificulty.js";
import { THEMES } from "./theme.js";
import { updateLightsForTimeOfDay } from "./lighting.js";
import { CapsuleSpawner } from "../systems/CapsuleSpawner.js";

// Configura o painel de interface (GUI) para ajustar definições como dificuldade, tema e áudio.
export function setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, sounds, arcadeBuilding, isNightInit = false, physicsWorld = null, machinePos = null, machineRotY = 0) {
    const config = {
        difficulty: "normal",
        theme: "clássico",
        timeOfDay: isNightInit ? "noite" : "dia",
        showStats: false,
        allShadows: false,
        musicVolume: 0.08,
        prizeVolume: 0.2
    };

    const gui = new GUI({ title: "Configurações" });

    const stats = new Stats();
    stats.setMode(0);
    Object.assign(stats.domElement.style, {
        position: 'fixed', right: '0px', bottom: '0px',
        left: 'auto', top: 'auto', zIndex: '10000'
    });
    document.body.appendChild(stats.domElement);
    stats.domElement.style.display = config.showStats ? 'block' : 'none';

    // Mudar a escala do GUI e Stats para melhor se adaptar a mobile
    const updateUIScale = () => {
        const w = window.innerWidth;
        const scale = w < 400 ? 0.7 : w < 600 ? 0.8 : 1;
        gui.domElement.style.transform = `scale(${scale})`;
        gui.domElement.style.transformOrigin = "top right";
        if (stats) {
            stats.domElement.style.transform = `scale(${scale})`;
            stats.domElement.style.transformOrigin = "bottom right";
        }
    };
    window.addEventListener('resize', updateUIScale);
    setTimeout(updateUIScale, 100);

    // Configurações de dificuldade
    gui.add(config, 'difficulty', ['fácil', 'normal', 'difícil']).name("Dificuldade").onChange(val => {
        if (val === 'normal') window.CONFIG_JOGO = NORMAL_MODE;
        else if (val === 'difícil') window.CONFIG_JOGO = HARD_MODE;
        else window.CONFIG_JOGO = EASY_MODE;
    });

    // Configurações de tema
    gui.add(config, 'theme', { 'clássico': 'classic', 'escuro': 'dark' }).name("Tema").onChange(val => {
        const theme = THEMES[val];
        if (clawMachine) clawMachine.updateTheme(theme);
        if (confetti) confetti.updateColors(theme.COLOR_PALETTE);
        if (capsuleOpener) capsuleOpener.updateTheme(val);
        if (scene) scene.background.set(theme.BACKGROUND);
        if (arcadeBuilding && arcadeBuilding.updateTheme) arcadeBuilding.updateTheme(theme);

        if (capsules) {
            capsules.forEach(c => {
                c.mesh.traverse(child => {
                    if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                        if (child.geometry.parameters.phiStart === 0 && child.geometry.parameters.phiLength === Math.PI * 2) {
                            if (child.geometry.parameters.thetaStart === 0) {
                                child.material.color.set(theme.CAPSULE_TOP);
                            } else {
                                child.material.color.set(theme.COLOR_PALETTE[Math.floor(Math.random() * theme.COLOR_PALETTE.length)]);
                            }
                        }
                    }
                });
            });
        }

        // Mudar a cor das divs do UI
        const shadow = val === 'dark' ? '#0c0a5e' : '#cc0000';
        const uiElements = document.querySelectorAll('.game-ui, .game-ui-hint');
        uiElements.forEach(el => {
            el.style.boxShadow = `4px 4px 0px ${shadow}`;
        });

        // Mudar a cor dos títulos das dicas de ajuda
        const helpItems = document.querySelectorAll('.help-item');
        if (helpItems) {
            const color = val === 'dark' ? '#00E5FF' : '#ffcc00';
            helpItems.forEach(item => {
                item.style.boxShadow = `4px 4px 0px ${shadow}`;
                const title = item.querySelector('.help-title');
                if (title) {
                    title.style.color = color;
                }
            });
        }
    });

    // Configurações de tempo do dia
    gui.add(config, 'timeOfDay', ['dia', 'noite']).name("Tempo").onChange(val => {
        updateLightsForTimeOfDay(scene, val === 'noite');
    });

    // Mostrar ou esconder o painel de estatísticas (FPS)
    gui.add(config, 'showStats').name("Mostrar FPS").onChange(val => {
        stats.domElement.style.display = val ? 'block' : 'none';
    });

    // Ativar ou desativar sombras para os candeeiros de teto
    gui.add(config, 'allShadows').name("Sombras").onChange(val => {
        if (scene) {
            // Devido ao limite de hardware MAX_TEXTURE_IMAGE_UNITS(16) do WebGL, ligar apenas as sombras dos candeiros
            // Kinda pesado

            const extraLightsGrp = [
                scene.userData.clawLamp,
                scene.userData.poolLamp,
                scene.userData.counterLamp,
                ...(scene.userData.tableLamps || [])
            ];

            extraLightsGrp.forEach(lamp => {
                if (lamp) lamp.traverse(child => {
                    // Apenas SpotLights maiores. PointLights e Spots secundários ficam de fora.
                    if (child.isSpotLight) {
                        child.castShadow = val;
                    }
                });
            });

            // Forçar atualização dos materiais para re-compilar os shaders com mapas de sombras novos
            scene.traverse(child => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.needsUpdate = true);
                    } else {
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    });

    // Configurações de volume da música
    const audioFolder = gui.addFolder("Áudio");
    audioFolder.add(config, 'musicVolume', 0, 1).name("Música").onChange(val => {
        if (sounds?.bgMusic) sounds.bgMusic.setVolume(val);
    });
    // Configurações de volume dos sons de ganhar um prémio
    audioFolder.add(config, 'prizeVolume', 0, 1).name("Som de Prémio").onChange(val => {
        if (sounds?.capsuleSound) sounds.capsuleSound.setVolume(val);
    });

    const actionsFolder = gui.addFolder("Ações");
    
    // Guardar as funções a serem mapeadas no GUI
    const actionsParams = {
        // Remove as cápsulas atuais e cria novas (igual ao spawn inicial)
        resetCapsules: () => {
            if (!scene || !capsules) return;

            // Remove todas as cápsulas actuais da cena
            while (capsules.length > 0) {
                const c = capsules.pop();
                // Remove da cena Three.js
                scene.remove(c.mesh);
                // Liberta geometria e materiais da GPU
                c.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.geometry?.dispose();
                        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                        else child.material?.dispose();
                    }
                });
                // Remove o corpo Rapier
                if (typeof physicsWorld !== "undefined" && physicsWorld) physicsWorld.removeCapsuleBody(c);
            }

            // Gera novas cápsulas com os mesmos parâmetros originais
            if (typeof machinePos !== "undefined" && machinePos) {
                const novasCapsulas = CapsuleSpawner.spawnCapsules(scene, 200, machinePos, typeof machineRotY !== "undefined" ? machineRotY : 0);
                novasCapsulas.forEach(c => capsules.push(c));

                if (typeof physicsWorld !== "undefined" && physicsWorld && physicsWorld.world) {
                    physicsWorld._createCapsuleBodies(capsules);
                }

                if (capsuleOpener && typeof capsuleOpener.setCleanupRefs === "function") {
                    capsuleOpener.setCleanupRefs(physicsWorld, capsules);
                }
            }
        },

        // Desbloquear todos os p´remios da coleçaõ
        completeCollection: () => {
            if (window.collectionManager) {
                window.collectionManager.unlockAll();
            }
        },
        clearCollection: () => {
            if (window.collectionManager) {
                window.collectionManager.lockAll();
            }
        }
    };

    actionsFolder.add(actionsParams, 'resetCapsules').name("Repor Cápsulas");
    actionsFolder.add(actionsParams, 'completeCollection').name("Completar Coleção");
    actionsFolder.add(actionsParams, 'clearCollection').name("Apagar Coleção");

    return { gui, stats };
}
