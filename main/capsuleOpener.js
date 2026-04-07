import * as THREE from "../node_modules/three/build/three.module.js";

export class CapsuleOpener {
    constructor(scene, camera, controls, confetis) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.confetis = confetis;
        
        this.estado = "FECHADO";
        this.modelo = null;
        this.capsula = null;
        this.escalaAlvo = 2;
        this.opacidadeCapsula = 1.0;
    }

    configurar(capsulaObj, modeloObj, escalaFinal = 2) {
        this.capsula = capsulaObj;
        this.modelo = modeloObj;
        this.escalaAlvo = escalaFinal;

        // Reset inicial do modelo
        if (this.modelo) {
            this.modelo.scale.set(0, 0, 0);
            this.modelo.position.set(0, 0, 0);
        }
    }

    abrir() {
        if (this.estado === "FECHADO") {
            this.estado = "ABRINDO";
            if (this.confetis) this.confetis.disparar();
        }
    }

    update(time) {
        if (!this.capsula) return;

        const parteDebaixo = this.capsula.grupo.children[0];
        const parteDecima = this.capsula.dobradica;

        if (this.estado === "ABRINDO") {
            if (parteDecima.rotation.x > -Math.PI / 1.2) {
                parteDecima.rotation.x -= 0.08;
            } else {
                this.estado = "EXPULSAR";
            }
        }

        if (this.estado === "EXPULSAR") {
            // Animando a cápsula a partir-se
            parteDebaixo.position.y -= 0.2;
            parteDebaixo.position.z += 0.1;
            parteDecima.position.y -= 0.2;
            parteDecima.position.z -= 0.1;

            // Modelo cresce
            if (this.modelo && this.modelo.scale.x < this.escalaAlvo) {
                const novoTam = this.modelo.scale.x + 0.02;
                this.modelo.scale.set(novoTam, novoTam, novoTam);
                this.modelo.position.y += 0.05;
            }

            // Fade out da cápsula
            this.opacidadeCapsula -= 0.02;
            this.capsula.grupo.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = this.opacidadeCapsula;
                }
            });

            if (this.opacidadeCapsula <= 0) {
                this.scene.remove(this.capsula.grupo);
                this.estado = "CONTROLO_LIVRE";
            }
        }

        if (this.estado === "CONTROLO_LIVRE") {
            if (this.modelo) {
                // 1. Rotação automática (comum a todos os modelos)
                this.modelo.rotation.y += 0.005;

                // 2. FLUTUAÇÃO MODULAR
                this.modelo.position.y = 1.5 + (Math.sin(time * 0.005) * 1);

                // 3. Focar a câmara no modelo (suavemente)
                this.controls.target.lerp(this.modelo.position, 0.1);
            }
        }
    }
}