import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';
import { EASY_MODE, NORMAL_MODE, HARD_MODE } from "./dificulty.js";
import { THEMES } from "./theme.js";
import { updateLightsForTimeOfDay } from "./lighting.js";

// Configura o painel de interface (GUI) para ajustar definições como dificuldade, tema e áudio.
export function setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, sounds, arcadeBuilding, isNightInit = false) {
    const config = {
        difficulty: "normal",
        theme: "classic",
        timeOfDay: isNightInit ? "noite" : "dia",
        showStats: false,
        musicVolume: 0.08,
        prizeVolume: 0.6
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

        const uiEl = document.getElementById("ui");
        if (uiEl) {
            const shadow = val === 'cyberpunk' ? '#ff00ff' : (val === 'forest' ? '#1b4d3e' : '#cc0000');
            uiEl.style.boxShadow = `4px 4px 0px ${shadow}`;
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

    return { gui, stats };
}
