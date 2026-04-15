import * as THREE from "three";

/**
 * CapsuleOpener — Fluxo completo de abertura da cápsula
 *
 * Estados:
 *  INATIVA        → à espera de ser ativada através de .ativar()
 *  TRANSPORTAR    → a cápsula voa suavemente para a frente da câmara
 *  AGUARDAR       → a cápsula está parada à frente, à espera da tecla ESPAÇO
 *  ABRIR          → animação da dobradiça a abrir
 *  DESAPARECER    → a cápsula parte-se, o modelo cresce
 *  CONTROLO_LIVRE → o modelo flutua, a câmara orbita à volta
 */
export class CapsuleOpener {
    constructor(scene, camera, controls, confetis) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.confetis = confetis;

        this.estado = "INATIVA";
        this.modelo = null;
        this.capsula = null;       // { grupo, dobradica }
        this.capsulaFisica = null;       // Entrada no array de física (para marcar apanhada)
        this.escalaAlvo = 2;
        this.opacidadeCapsula = 1.0;

        // Animação do prémio
        this.mixer = null;
        this._prevTime = 0;

        // Posição alvo no mundo (frente da câmara)
        this._alvoMundo = new THREE.Vector3();
        // Posição inicial da cápsula no mundo (para interpolar)
        this._origemMundo = new THREE.Vector3();
        this._frameTransporte = 0;
        this._FRAMES_TRANSPORTE = 60; // Duração do voo em frames

        // Dica de interface
        this._hintEl = null;
        this._criarHint();

        // Ouvinte do teclado (só ativo quando necessário)
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    // ── API pública ──────────────────────────────────────────────────────────────
    /**
     * Chamado quando o utilizador clica numa cápsula.
     * @param {object} capsulaObj   { grupo: THREE.Group, dobradica: THREE.Group }
     * @param {object} capsulaFis   Entrada no array de física { mesh, vel, apanhada, ... }
     * @param {object} modeloObj    THREE.Object3D do prémio (já adicionado à cena)
     * @param {number} escalaFinal  Escala alvo do modelo após abertura
     */
    ativar(capsulaObj, capsulaFis, modeloObj, escalaFinal = 2, clipes = [], nomeAnimacao = null) {
        if (this.estado !== "INATIVA") return; // Ignora se já estiver a ser usado

        this.capsula = capsulaObj;
        this.capsulaFisica = capsulaFis;
        this.modelo = modeloObj;
        this.escalaAlvo = escalaFinal;

        // Setup Animações se existirem
        if (clipes && clipes.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.modelo);
            
            // Prioriza o nome configurado, senão procura por "Idle", senão usa a primeira
            let idleClip = null;
            if (nomeAnimacao) {
                idleClip = clipes.find(c => c.name === nomeAnimacao);
            }
            if (!idleClip) {
                idleClip = clipes.find(c => c.name.toLowerCase().includes("idle")) || clipes[0];
            }

            const action = this.mixer.clipAction(idleClip);
            action.play();
        }

        // Congela a cápsula na física
        if (this.capsulaFisica) {
            this.capsulaFisica.apanhada = true;
            this.capsulaFisica.vel.set(0, 0, 0);
        }

        // Guarda a posição de origem (world space)
        this._origemMundo.copy(this.capsula.grupo.position);

        // Calcula a posição alvo: 20 unidades à frente da câmara
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        // A cápsula vem parar à frente do utilizador, a uma altura confortável
        this._alvoMundo.copy(this.camera.position).add(dir.multiplyScalar(20));
        this._alvoMundo.y -= 2; // Desce ligeiramente (desvio visual)

        // Reposição da opacidade da cápsula (inicializa variável base para o fade-out)
        this.opacidadeCapsula = 1.0;
        this.capsula.grupo.traverse(child => {
            if (child.isMesh) {
                // Guarda a opacidade original se ainda não tiver sido guardada
                if (child.material.userData.originalOpacity === undefined) {
                    child.material.userData.originalOpacity = child.material.opacity;
                }
                child.material.transparent = true;
                // Restaura a opacidade original em vez de forçar 1.0 (para manter o vidro)
                child.material.opacity = child.material.userData.originalOpacity;
            }
        });

        // Reset dobradiça e orientação da cápsula
        this.capsula.grupo.rotation.set(0, 0, 0); // Fica horizontal
        this.capsula.dobradica.rotation.set(0, 0, 0);
        this.capsula.dobradica.position.set(0, 0, -1.5);
        this.capsula.grupo.children[0].position.set(0, 0, 0);

        this._frameTransporte = 0;
        this.estado = "TRANSPORTAR";

        // Desabilita o orbit durante o transporte
        if (this.controls) this.controls.enabled = false;
    }

    update(time) {
        if (this.estado === "INATIVA") return;

        // Calcula delta para o mixer
        const delta = this._prevTime === 0 ? 0 : (time - this._prevTime) / 1000;
        this._prevTime = time;

        if (this.mixer) this.mixer.update(delta);

        // ── TRANSPORTAR ────────────────────────────────────────────────────────────
        if (this.estado === "TRANSPORTAR") {
            this._frameTransporte++;
            const t = Math.min(this._frameTransporte / this._FRAMES_TRANSPORTE, 1);
            // Easing suave (ease-in-out cúbico)
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.capsula.grupo.position.lerpVectors(this._origemMundo, this._alvoMundo, ease);

            // Faz a cápsula rodar suavemente num único sentido
            this.capsula.grupo.rotation.y += 0.04;
            this.capsula.grupo.rotation.x = 0;
            this.capsula.grupo.rotation.z = 0;

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
            this.capsula.grupo.position.x = this._alvoMundo.x;
            this.capsula.grupo.position.z = this._alvoMundo.z;
            this.capsula.grupo.rotation.y += 0.01;
            this.capsula.grupo.rotation.x = 0;
            this.capsula.grupo.rotation.z = 0;

            // Câmara suavemente focada na cápsula
            if (this.controls) {
                this.controls.target.lerp(this._alvoMundo, 0.08);
                this.controls.update();
            }
        }

        // ── ABRIR ──────────────────────────────────────────────────────────────────
        if (this.estado === "ABRIR") {
            const dobradica = this.capsula.dobradica;
            this.capsula.grupo.position.y = this._alvoMundo.y + Math.sin(time * 0.003) * 0.15;
            this.capsula.grupo.position.x = this._alvoMundo.x;
            this.capsula.grupo.position.z = this._alvoMundo.z;

            if (dobradica.rotation.x > -Math.PI / 1.2) {
                dobradica.rotation.x -= 0.08;
            } else {
                this.estado = "DESAPARECER";
                if (this.confetis) this.confetis.disparar();
            }

            // Mantém a câmara focada
            if (this.controls) {
                this.controls.target.lerp(this.capsula.grupo.position, 0.1);
                this.controls.update();
            }
        }

        // ── DESAPARECER ─────────────────────────────────────────────────────────────────
        if (this.estado === "DESAPARECER") {
            const parteDebaixo = this.capsula.grupo.children[0];
            const parteCima = this.capsula.dobradica;

            // Cápsula parte-se
            parteDebaixo.position.y -= 0.2;
            parteDebaixo.position.z += 0.1;
            parteCima.position.y -= 0.2;
            parteCima.position.z -= 0.1;

            // Se o modelo ainda for filho da cápsula, extrair para a root da cena (sem alterar posição/rotação visuais)
            if (this.modelo && this.modelo.parent !== this.scene) {
                this.scene.add(this.modelo);
                this.modelo.position.copy(this._alvoMundo);
            }

            // Modelo cresce
            if (this.modelo && this.modelo.scale.x < this.escalaAlvo) {
                const passo = this.escalaAlvo / 20;
                // Aumenta 25% o tamanho do prémio face à escalaAlvo
                const limiteTam = this.escalaAlvo * 1.25;
                const novoTam = Math.min(this.modelo.scale.x + passo, limiteTam);
                this.modelo.scale.set(novoTam, novoTam, novoTam);
                // Posiciona o modelo ligeiramente acima do alvo mundo para não ficar no chão
                this.modelo.position.y = this._alvoMundo.y + 0.5;
            }

            // Fade-out da cápsula baseando-se na opacidade base de cada componente
            this.opacidadeCapsula -= 0.02;
            this.capsula.grupo.traverse(child => {
                if (child.isMesh) {
                    const opOriginal = child.material.userData.originalOpacity ?? 1.0;
                    child.material.transparent = true;
                    // Multiplica, de forma a ir desaparecendo consoante o início
                    child.material.opacity = Math.max(0, opOriginal * this.opacidadeCapsula);
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
                // Posição fixa focada (removida a flutuação vertical)
                this.modelo.position.y = this._alvoMundo.y + 0.5;
                this.modelo.position.x = this._alvoMundo.x;
                this.modelo.position.z = this._alvoMundo.z;
            }
        }

        // ── ENCERRAR (encolhe antes de sair) ──────────────────────────────────────
        if (this.estado === "ENCERRAR") {
            if (this.modelo) {
                // Diminui 10% do tamanho atual por frame
                this.modelo.scale.multiplyScalar(0.9);
                this.modelo.rotation.y += 0.1;

                // Quando estiver quase invisível, desaparece de vez e reseta
                if (this.modelo.scale.x < 0.001) {
                    this.scene.remove(this.modelo);
                    this.modelo = null;
                    this._finalizarEncerramento();
                }
            } else {
                this._finalizarEncerramento();
            }
        }
    }

    _finalizarEncerramento() {
        this.capsula = null;
        this.capsulaFisica = null;
        this.estado = "INATIVA";
        this._prevTime = 0;

        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }

        if (this.controls) {
            this.controls.enabled = true;
            this.controls.target.set(0, 18, 0);
            this.camera.position.set(0, 30, 60);
            this.controls.update();
        }
    }

    // ── Privado ──────────────────────────────────────────────────────────────────
    _onKeyDown(e) {
        if (e.code === "Space" && this.estado === "AGUARDAR") {
            e.preventDefault();
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
            this.estado = "ABRIR";
        }

        if (e.code === "Space" && this.estado === "CONTROLO_LIVRE") {
            e.preventDefault();
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
            // Inicia o encolhimento progressivo
            this.estado = "ENCERRAR";
        }
    }

    _criarHint() {
        this._hintEl = document.createElement("div");
        Object.assign(this._hintEl.style, {
            position: "fixed",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: "24px",
            fontFamily: "sans-serif",
            fontSize: "1.1rem",
            letterSpacing: "0.04em",
            pointerEvents: "none",
            display: "none",
            zIndex: "999",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.2)"
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