import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';
import { MODO_FACIL, MODO_REALISTA } from "./dificulty.js";
import { TEMAS } from "./theme.js";

export function setupWidget(scene, clawMachine, confetti, capsules, capsuleOpener, sounds) {
    const config = {
        difficulty: "realista",
        theme: "classico",
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

    gui.add(config, 'difficulty', ['fácil', 'realista']).name("Dificuldade").onChange(val => {
        window.CONFIG_JOGO = val === 'realista' ? MODO_REALISTA : MODO_FACIL;
    });

    gui.add(config, 'theme', Object.keys(TEMAS)).name("Tema").onChange(val => {
        const theme = TEMAS[val];
        if (clawMachine) clawMachine.atualizarTema(theme);
        if (confetti) confetti.atualizarCores(theme.PALETA_CORES);
        if (capsuleOpener) capsuleOpener.updateTheme(val);
        if (scene) scene.background.set(theme.FUNDO);

        if (capsules) {
            capsules.forEach(c => {
                c.mesh.traverse(child => {
                    if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                        if (child.geometry.parameters.phiStart === 0 && child.geometry.parameters.phiLength === Math.PI * 2) {
                            if (child.geometry.parameters.thetaStart === 0) {
                                child.material.color.set(theme.CAPSULA_TOPO);
                            } else {
                                child.material.color.set(theme.PALETA_CORES[Math.floor(Math.random() * theme.PALETA_CORES.length)]);
                            }
                        }
                    }
                });
            });
        }

        const uiEl = document.getElementById("ui");
        if (uiEl) {
            const shadow = val === 'cyberpunk' ? '#ff00ff' : (val === 'floresta' ? '#1b4d3e' : '#cc0000');
            uiEl.style.boxShadow = `4px 4px 0px ${shadow}`;
        }
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
