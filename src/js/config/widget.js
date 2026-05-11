import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';
import { MODO_FACIL, MODO_REALISTA } from "./dificulty.js";
import { TEMAS } from "./theme.js";

/**
 * Configura o widget de controlo lil-gui
 * @param {THREE.Scene} scene 
 * @param {object} clawMachine 
 * @param {object} confetisObj 
 * @param {Array} capsulas 
 * @param {object} capsuleOpener
 * @param {object} sounds { bgMusic, capsuleSound }
 */
export function setupWidget(scene, clawMachine, confetisObj, capsulas, capsuleOpener, sounds) {
    const configUI = {
        dificuldade: "realista",
        tema: "classico",
        mostrarStats: false,
        volMusica: 0.08,
        volPremio: 0.6
    };



    const gui = new GUI({ title: "Configurações" });
    
    // Tornar o GUI responsivo
    const atualizarEscalaUI = () => {
        const largura = window.innerWidth;
        let escala = 1;
        
        if (largura < 600) escala = 0.8; // Smartphones pequenos
        if (largura < 400) escala = 0.7; // Smartphones muito pequenos

        // Aplicar escala ao lil-gui
        gui.domElement.style.transform = `scale(${escala})`;
        gui.domElement.style.transformOrigin = "top right";
        
        // Aplicar escala ao Stats
        if (stats) {
            stats.domElement.style.transform = `scale(${escala})`;
            stats.domElement.style.transformOrigin = "bottom right";
        }
    };

    window.addEventListener('resize', atualizarEscalaUI);

    // Inicializa o Stats (Painel de FPS/Performance)
    const stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'fixed';
    stats.domElement.style.right = '0px';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.left = 'auto';
    stats.domElement.style.top = 'auto';
    stats.domElement.style.zIndex = '10000';
    document.body.appendChild(stats.domElement);

    // Aplicar visibilidade inicial conforme configUI
    stats.domElement.style.display = configUI.mostrarStats ? 'block' : 'none';
    
    // Aplicar escala inicial
    setTimeout(atualizarEscalaUI, 100);

    gui.add(configUI, 'dificuldade', ['fácil', 'realista']).name("Dificuldade").onChange((val) => {
        window.CONFIG_JOGO = val === 'realista' ? MODO_REALISTA : MODO_FACIL;
    });

    gui.add(configUI, 'tema', Object.keys(TEMAS)).name("Tema").onChange((val) => {
        const novoTema = TEMAS[val];
        
        // Atualiza a máquina
        if (clawMachine) clawMachine.atualizarTema(novoTema);
        
        // Atualiza confetis
        if (confetisObj) confetisObj.atualizarCores(novoTema.PALETA_CORES);

        // Atualiza o abridor de cápsulas (tema do nome do prémio)
        if (capsuleOpener) capsuleOpener.atualizarTema(val);

        // Atualizar fundo da cena
        if (scene) scene.background.set(novoTema.FUNDO);

        // Atualizar cápsulas existentes
        if (capsulas) {
            capsulas.forEach(c => {
                c.mesh.traverse(child => {
                    if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                        // Se for a parte de cima
                        if (child.geometry.parameters.phiStart === 0 && child.geometry.parameters.phiLength === Math.PI * 2) {
                            if (child.geometry.parameters.thetaStart === 0) {
                                child.material.color.set(novoTema.CAPSULA_TOPO);
                            } else {
                                const novaCor = novoTema.PALETA_CORES[Math.floor(Math.random() * novoTema.PALETA_CORES.length)];
                                child.material.color.set(novaCor);
                            }
                        }
                    }
                });
            });
        }

        // Atualizar sombra do UI
        const uiElement = document.getElementById("ui");
        if (uiElement) {
            const shadowColor = val === 'cyberpunk' ? '#ff00ff' : (val === 'floresta' ? '#1b4d3e' : '#cc0000');
            uiElement.style.boxShadow = `4px 4px 0px ${shadowColor}`;
        }
    });

    gui.add(configUI, 'mostrarStats').name("Mostrar FPS").onChange((val) => {
        stats.domElement.style.display = val ? 'block' : 'none';
    });

    // --- PAINEL DE ÁUDIO ---
    const audioFolder = gui.addFolder("Áudio");
    
    audioFolder.add(configUI, 'volMusica', 0, 1).name("Música").onChange((val) => {
        if (sounds?.bgMusic) sounds.bgMusic.setVolume(val);
    });

    audioFolder.add(configUI, 'volPremio', 0, 1).name("Som de Prémio").onChange((val) => {
        if (sounds?.capsuleSound) sounds.capsuleSound.setVolume(val);
    });


    return { gui, stats };

}
