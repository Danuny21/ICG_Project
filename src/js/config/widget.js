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

    gui.add(config, 'difficulty', ['fácil', 'normal', 'difícil']).name("Dificuldade").onChange(val => {
        if (val === 'normal') window.CONFIG_JOGO = NORMAL_MODE;
        else if (val === 'difícil') window.CONFIG_JOGO = HARD_MODE;
        else window.CONFIG_JOGO = EASY_MODE;
    });

    gui.add(config, 'theme', Object.keys(THEMES)).name("Tema").onChange(val => {
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

        const shadow = val === 'escuro' ? '#ff00ff' : '#cc0000';

        const uiElements = document.querySelectorAll('.game-ui, .game-ui-hint');
        uiElements.forEach(el => {
            el.style.boxShadow = `4px 4px 0px ${shadow}`;
        });

        const helpItems = document.querySelectorAll('.help-item');
        if (helpItems) {
            const color = val === 'escuro' ? '#00E5FF' : '#ffcc00';
            helpItems.forEach(item => {
                item.style.boxShadow = `4px 4px 0px ${shadow}`;
                const title = item.querySelector('.help-title');
                if (title) {
                    title.style.color = color;
                }
            });
        }
    });

    gui.add(config, 'timeOfDay', ['dia', 'noite']).name("Tempo").onChange(val => {
        updateLightsForTimeOfDay(scene, val === 'noite');
    });

    gui.add(config, 'showStats').name("Mostrar FPS").onChange(val => {
        stats.domElement.style.display = val ? 'block' : 'none';
    });

    const audioFolder = gui.addFolder("Áudio");
    audioFolder.add(config, 'musicVolume', 0, 1).name("Música").onChange(val => {
        if (sounds?.bgMusic) sounds.bgMusic.setVolume(val);
    });
    audioFolder.add(config, 'prizeVolume', 0, 1).name("Som de Prémio").onChange(val => {
        if (sounds?.capsuleSound) sounds.capsuleSound.setVolume(val);
    });

    const actionsFolder = gui.addFolder("Ações");
    
    // Objeto temporário para guardar as funções a serem mapeadas no GUI
    const actionsParams = {
        resetCapsules: () => {
            if (!scene || !capsules) return;

            // 1. Remove todas as cápsulas actuais da cena, da física e liberta memória
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

            // 2. Gera novas cápsulas com os mesmos parâmetros originais
            if (typeof machinePos !== "undefined" && machinePos) {
                // ...existing code...
                const novasCapsulas = CapsuleSpawner.spawnCapsules(scene, 200, machinePos, typeof machineRotY !== "undefined" ? machineRotY : 0);
                novasCapsulas.forEach(c => capsules.push(c));

                // 3. Regista os novos corpos Rapier no mundo físico existente
                if (typeof physicsWorld !== "undefined" && physicsWorld && physicsWorld.world) {
                    physicsWorld._createCapsuleBodies(capsules);
                }

                // 4. Actualiza as referências de limpeza do CapsuleOpener
                if (capsuleOpener && typeof capsuleOpener.setCleanupRefs === "function") {
                    capsuleOpener.setCleanupRefs(physicsWorld, capsules);
                }

                console.log(`[Repor Cápsulas] ${capsules.length} novas cápsulas geradas.`);
            }
        },
        completeCollection: () => {
            // collectionManager não é passado pelo widget setup.
            // Contudo podemos usar objectos globais se expostos, caso contrário tentamos chegar a ele.
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
