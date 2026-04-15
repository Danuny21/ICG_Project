import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MODO_FACIL, MODO_REALISTA } from "./dificulty.js";
import { TEMAS } from "./theme.js";

/**
 * Configura o widget de controlo lil-gui
 * @param {THREE.Scene} scene 
 * @param {object} clawMachine 
 * @param {object} confetisObj 
 * @param {Array} capsulas 
 * @param {object} capsuleOpener
 */
export function setupWidget(scene, clawMachine, confetisObj, capsulas, capsuleOpener) {
    const configUI = {
        dificuldade: "realista",
        tema: "classico"
    };

    const gui = new GUI({ title: "Configurações" });

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

    return gui;
}
