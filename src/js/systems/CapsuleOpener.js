import * as THREE from "three";

/**
 * CapsuleOpener — Fluxo completo de abertura de cápsula
 *
 * Estados:
 *  INATIVA        → à espera de ser ativada via .ativar()
 *  TRANSPORTANDO  → cápsula voa suavemente para a frente da câmara
 *  AGUARDAR       → cápsula parada à frente, à espera de SPACE
 *  ABRINDO        → animação da dobradiça a abrir
 *  EXPULSAR       → cápsula parte-se, modelo cresce
 *  CONTROLO_LIVRE → modelo flutua, câmara orbita à volta
 */
export class CapsuleOpener {
    constructor(scene, camera, controls, confetis) {
        this.scene    = scene;
        this.camera   = camera;
        this.controls = controls;
        this.confetis = confetis;

        this.estado           = "INATIVA";
        this.modelo           = null;
        this.capsula          = null;       // { grupo, dobradica }
        this.capsulaFisica    = null;       // Entrada no array de física (para marcar apanhada)
        this.escalaAlvo       = 2;
        this.opacidadeCapsula = 1.0;

        // Posição alvo no mundo (frente da câmara)
        this._alvoMundo = new THREE.Vector3();
        // Posição inicial da cápsula no mundo (para interpolar)
        this._origemMundo = new THREE.Vector3();
        this._frameTransporte = 0;
        this._FRAMES_TRANSPORTE = 60; // Duração do voo em frames

        // Hint de UI
        this._hintEl = null;
        this._criarHint();

        // Listener de teclado (só ativo quando necessário)
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    // ── API pública ──────────────────────────────────────────────────────────────
    /**
     * Chama quando o utilizador clica numa cápsula.
     * @param {object} capsulaObj   { grupo: THREE.Group, dobradica: THREE.Group }
     * @param {object} capsulaFis   Entrada no array de física { mesh, vel, apanhada, ... }
     * @param {object} modeloObj    THREE.Object3D do prémio (já adicionado à cena)
     * @param {number} escalaFinal  Escala alvo do modelo após abertura
     */
    ativar(capsulaObj, capsulaFis, modeloObj, escalaFinal = 2) {
        if (this.estado !== "INATIVA") return; // Ignora se já está em uso

        this.capsula       = capsulaObj;
        this.capsulaFisica = capsulaFis;
        this.modelo        = modeloObj;
        this.escalaAlvo    = escalaFinal;

        // Congela a cápsula na física
        if (this.capsulaFisica) {
            this.capsulaFisica.apanhada = true;
            this.capsulaFisica.vel.set(0, 0, 0);
        }

        // Guarda posição de origem (world space)
        this._origemMundo.copy(this.capsula.grupo.position);

        // Calcula posição alvo: 20 unidades à frente da câmara
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        
        // A cápsula vem parar à frente do utilizador, a uma altura confortável
        this._alvoMundo.copy(this.camera.position).add(dir.multiplyScalar(20));
        this._alvoMundo.y -= 2; // Desce ligeiramente (offset visual)

        // Reset do modelo (escondido)
        if (this.modelo) {
            this.modelo.scale.set(0, 0, 0);
            this.modelo.rotation.set(0, 0, 0);
        }

        // Reset opacidade da cápsula
        this.opacidadeCapsula = 1.0;
        this.capsula.grupo.traverse(child => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 1.0;
            }
        });

        // Reset dobradiça
        this.capsula.dobradica.rotation.set(0, 0, 0);
        this.capsula.dobradica.position.set(0, 0, -1.5);
        this.capsula.grupo.children[0].position.set(0, 0, 0);

        this._frameTransporte = 0;
        this.estado = "TRANSPORTANDO";

        // Desabilita o orbit durante o transporte
        if (this.controls) this.controls.enabled = false;
    }

    update(time) {
        if (this.estado === "INATIVA") return;

        // ── TRANSPORTANDO ────────────────────────────────────────────────────────────
        if (this.estado === "TRANSPORTANDO") {
            this._frameTransporte++;
            const t = Math.min(this._frameTransporte / this._FRAMES_TRANSPORTE, 1);
            // Easing suave (ease-in-out cúbico)
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.capsula.grupo.position.lerpVectors(this._origemMundo, this._alvoMundo, ease);

            // Faz a cápsula rodar levemente durante o voo
            this.capsula.grupo.rotation.y += 0.04;

            if (t >= 1) {
                this.estado = "AGUARDAR";
                this._mostrarHint("Prima ESPAÇO para abrir a cápsula");
                window.addEventListener("keydown", this._onKeyDown);
            }
        }

        // ── AGUARDAR (à espera de SPACE) ─────────────────────────────────────────────
        if (this.estado === "AGUARDAR") {
            // Pequena flutuação para indicar que está interativa
            this.capsula.grupo.position.y = this._alvoMundo.y + Math.sin(time * 0.003) * 0.15;
            this.capsula.grupo.rotation.y += 0.01;

            // Câmara suavemente focada na cápsula
            if (this.controls) {
                this.controls.target.lerp(this._alvoMundo, 0.08);
                this.controls.update();
            }
        }

        // ── ABRINDO ──────────────────────────────────────────────────────────────────
        if (this.estado === "ABRINDO") {
            const dobradica = this.capsula.dobradica;
            if (dobradica.rotation.x > -Math.PI / 1.2) {
                dobradica.rotation.x -= 0.08;
            } else {
                this.estado = "EXPULSAR";
                if (this.confetis) this.confetis.disparar();
            }

            // Mantém a câmara focada
            if (this.controls) {
                this.controls.target.lerp(this.capsula.grupo.position, 0.1);
                this.controls.update();
            }
        }

        // ── EXPULSAR ─────────────────────────────────────────────────────────────────
        if (this.estado === "EXPULSAR") {
            const parteDebaixo = this.capsula.grupo.children[0];
            const parteCima    = this.capsula.dobradica;

            // Cápsula parte-se
            parteDebaixo.position.y -= 0.2;
            parteDebaixo.position.z += 0.1;
            parteCima.position.y    -= 0.2;
            parteCima.position.z    -= 0.1;

            // Modelo cresce
            if (this.modelo && this.modelo.scale.x < this.escalaAlvo) {
                // Coloca o modelo na mesma posição da cápsula (world space)
                this.modelo.position.copy(this.capsula.grupo.position);
                const passo   = this.escalaAlvo / 20;
                // Aumenta 25% o tamanho do prémio
                const novoTam = Math.min(this.modelo.scale.x + passo, this.escalaAlvo * 1.25);
                this.modelo.scale.set(novoTam, novoTam, novoTam);
                this.modelo.position.y += 0.05;
            }

            // Fade-out da cápsula
            this.opacidadeCapsula -= 0.02;
            this.capsula.grupo.traverse(child => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity     = Math.max(0, this.opacidadeCapsula);
                }
            });

            if (this.opacidadeCapsula <= 0) {
                // Remove a cápsula da cena
                this.scene.remove(this.capsula.grupo);
                // Reativa o orbit
                if (this.controls) this.controls.enabled = true;
                this.estado = "CONTROLO_LIVRE";
                this._mostrarHint("Prima ESPAÇO para voltar a jogar");
                window.addEventListener("keydown", this._onKeyDown);
            }
        }

        // ── CONTROLO_LIVRE ───────────────────────────────────────────────────────────
        if (this.estado === "CONTROLO_LIVRE") {
            if (this.modelo) {
                this.modelo.rotation.y += 0.005;
                // Flutuação suave (igual à versão original)
                this.modelo.position.y = (this._alvoMundo.y + 1.5) + Math.sin(time * 0.005) * 1;
            }
        }
    }

    // ── Privado ──────────────────────────────────────────────────────────────────
    _onKeyDown(e) {
        if (e.code === "Space" && this.estado === "AGUARDAR") {
            e.preventDefault();
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
            this.estado = "ABRINDO";
        }

        if (e.code === "Space" && this.estado === "CONTROLO_LIVRE") {
            if (this.modelo) {
                this.scene.remove(this.modelo);
                this.modelo = null;
            }
            this.capsula = null;
            this.capsulaFisica = null;
            this.estado = "INATIVA";
            if (this.controls) {
                this.controls.enabled = true;
                this.controls.target.set(0, 18, 0);  
                this.camera.position.set(0, 30, 60);
                this.controls.update();
            }
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
        }
    }

    _criarHint() {
        this._hintEl = document.createElement("div");
        Object.assign(this._hintEl.style, {
            position:        "fixed",
            bottom:          "10%",
            left:            "50%",
            transform:       "translateX(-50%)",
            background:      "rgba(0,0,0,0.65)",
            color:           "#fff",
            padding:         "10px 24px",
            borderRadius:    "24px",
            fontFamily:      "sans-serif",
            fontSize:        "1.1rem",
            letterSpacing:   "0.04em",
            pointerEvents:   "none",
            display:         "none",
            zIndex:          "999",
            backdropFilter:  "blur(4px)",
            border:          "1px solid rgba(255,255,255,0.2)"
        });
        document.body.appendChild(this._hintEl);
    }

    _mostrarHint(texto) {
        this._hintEl.textContent = texto;
        this._hintEl.style.display = "block";
    }

    _esconderHint() {
        this._hintEl.style.display = "none";
    }
}