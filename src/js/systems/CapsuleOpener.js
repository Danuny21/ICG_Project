import * as THREE from "three";

/**
 * CapsuleOpener — Fluxo completo de abertura da cápsula
 *
 * Estados:
 *  INATIVA        → à espera de ser ativada através de .abrirCapsula()
 *  TRANSPORTAR    → a cápsula voa suavemente para a frente da câmara
 *  AGUARDAR       → a cápsula está parada à frente, à espera da tecla ESPAÇO
 *  ABRIR          → animação da dobradiça a abrir
 *  DESAPARECER    → a cápsula parte-se, o modelo cresce
 *  CONTROLO_LIVRE → o modelo flutua, a câmara orbita à volta
 */
export class CapsuleOpener {
    constructor(scene, camera, controls, confetis, basePos = new THREE.Vector3(0, 0, 0), baseRotY = 0, openSound = null) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.confetis = confetis;
        this.basePos = basePos;
        this.baseRotY = baseRotY;
        this.openSound = openSound;


        this.estado = "INATIVA";
        this.modelo = null;
        this.capsula = null;
        this.capsulaFisica = null;
        this.escalaAlvo = 2;
        this.opacidadeCapsula = 1.0;

        // Luzes de destaque para o prémio
        this._luzCima = new THREE.PointLight(0xffffff, 0, 50);
        this._luzBaixo = new THREE.PointLight(0xffffff, 0, 50);
        
        this.scene.add(this._luzCima);
        this.scene.add(this._luzBaixo);

        // Animação do prémio
        this.mixer = null;
        this._prevTime = 0;

        // Posição alvo no mundo (frente da câmara)
        this._alvoMundo = new THREE.Vector3();
        // Posição inicial da cápsula no mundo (para interpolar)
        this._origemMundo = new THREE.Vector3();
        this._frameTransporte = 0;
        this._FRAMES_TRANSPORTE = 100; // Duração do voo aumentada de 60

        // Dica de interface
        this._hintEl = null;
        this._nomePremioEl = null;
        this._criarHint();
        this._criarNomePremioUI();

        this.nomeExibicao = "";
        this.temaAtual = "classico";

        // Ouvintes
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onSceneTouch = this._onSceneTouch.bind(this);
    }

    /**
     * Chamado quando o utilizador clica numa cápsula.
     * @param {object} capsulaObj   { grupo: THREE.Group, dobradica: THREE.Group }
     * @param {object} capsulaFis   Entrada no array de física { mesh, vel, apanhada, ... }
     * @param {string} nomeAnimacao  Nome da animação inicial (opcional) do modelo
     * @param {string} nomeExibicao  Nome legível para mostrar na UI do prémio
     */
    abrirCapsula(capsulaObj, capsulaFis, modeloObj, escalaFinal = 2, clipes = [], nomeAnimacao = null, nomeExibicao = "") {
        if (this.estado !== "INATIVA") return; // Ignora se já estiver a ser usado

        this.capsula = capsulaObj;
        this.capsulaFisica = capsulaFis;
        this.modelo = modeloObj;
        this.escalaAlvo = escalaFinal;
        this.nomeExibicao = nomeExibicao;

        // Setup Animações se existirem
        if (clipes && clipes.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.modelo);
            let idleClip = null;
            if (nomeAnimacao) {
                // Tenta correspondência exata
                idleClip = clipes.find(c => c.name === nomeAnimacao);

                // Se não encontrar, tenta case-insensitive ou se há sobreposição de nomes
                if (!idleClip) {
                    idleClip = clipes.find(c => {
                        const clipName = c.name.toLowerCase();
                        const targetName = nomeAnimacao.toLowerCase();
                        return clipName === targetName || clipName.includes(targetName) || targetName.includes(clipName);
                    });
                }
            }
            if (!idleClip) {
                // Fallback padrão se não houver nome configurado ou não for encontrado
                idleClip = clipes.find(c => c.name.toLowerCase().includes("idle")) || clipes[0];
            }
            // Rodar animação
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

        // A cápsula vem parar à frente do utilizador
        this._alvoMundo.copy(this.camera.position).add(dir.multiplyScalar(20));
        this._alvoMundo.y -= 6;

        // Reposição da opacidade da cápsula
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
        this.capsula.grupo.rotation.set(0, 0, 0);
        this.capsula.dobradica.rotation.set(0, 0, 0);
        this.capsula.dobradica.position.set(0, 0, -1.5);
        this.capsula.grupo.children[0].position.set(0, 0, 0);

        this._frameTransporte = 0;
        this.estado = "TRANSPORTAR";

        // Reset luzes
        this._luzCima.intensity = 0;
        this._luzBaixo.intensity = 0;
        
        this._luzCima.position.copy(this._alvoMundo).add(new THREE.Vector3(0, 8, 0));
        this._luzBaixo.position.copy(this._alvoMundo).add(new THREE.Vector3(0, -8, 0));

        // Desabilita o orbit durante o transporte
        if (this.controls) this.controls.enabled = false;
    }

    atualizarCapsula(time) {
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
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                this._mostrarHint(isTouch ? "Toque para abrir a cápsula" : "Prima ESPAÇO para abrir a cápsula");
                
                if (isTouch) {
                    window.addEventListener("touchstart", this._onSceneTouch, { once: true });
                } else {
                    window.addEventListener("keydown", this._onKeyDown);
                }
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

        // ABRIR
        if (this.estado === "ABRIR") {
            const dobradica = this.capsula.dobradica;
            this.capsula.grupo.position.y = this._alvoMundo.y + Math.sin(time * 0.003) * 0.15;
            this.capsula.grupo.position.x = this._alvoMundo.x;
            this.capsula.grupo.position.z = this._alvoMundo.z;

            if (dobradica.rotation.x > -Math.PI / 1.2) {
                dobradica.rotation.x -= 0.04; // Reduzido de 0.08
            } else {
                this.estado = "DESAPARECER";
                if (this.nomeExibicao) {
                    this._mostrarNomePremio(this.nomeExibicao);
                }
                if (this.confetis) this.confetis.disparar(this.capsula.grupo.position);
            }

            // Mantém a câmara focada
            if (this.controls) {
                this.controls.target.lerp(this.capsula.grupo.position, 0.1);
                this.controls.update();
            }
        }

        // DESAPARECER
        if (this.estado === "DESAPARECER") {
            const parteDebaixo = this.capsula.grupo.children[0];
            const parteCima = this.capsula.dobradica;

            // Cápsula parte-se (mais devagar)
            parteDebaixo.position.y -= 0.1;
            parteDebaixo.position.z += 0.05;
            parteCima.position.y -= 0.1;
            parteCima.position.z -= 0.05;

            // Se o modelo ainda for filho da cápsula, extrair para a root da cena (sem alterar posição/rotação visuais)
            if (this.modelo && this.modelo.parent !== this.scene) {
                this.scene.add(this.modelo);
                this.modelo.position.copy(this._alvoMundo);
            }

            // Modelo cresce (mais devagar)
            if (this.modelo && this.modelo.scale.x < this.escalaAlvo) {
                const passo = this.escalaAlvo / 50; // Reduzido de 20
                const limiteTam = this.escalaAlvo * 1.25;
                const novoTam = Math.min(this.modelo.scale.x + passo, limiteTam);
                this.modelo.scale.set(novoTam, novoTam, novoTam);
                this.modelo.position.y = this._alvoMundo.y + 0.5;
            }

            // Luzes aparecem progressivamente
            this._luzCima.intensity = THREE.MathUtils.lerp(this._luzCima.intensity, 3, 0.1);
            this._luzBaixo.intensity = THREE.MathUtils.lerp(this._luzBaixo.intensity, 2, 0.1);

            // Fade-out da cápsula (mais devagar)
            this.opacidadeCapsula -= 0.01; // Reduzido de 0.02
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
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                this._mostrarHint(isTouch ? "Toque para voltar a jogar" : "Prima ESPAÇO para voltar a jogar");
                
                if (isTouch) {
                    window.addEventListener("touchstart", this._onSceneTouch, { once: true });
                } else {
                    window.addEventListener("keydown", this._onKeyDown);
                }
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
            this._esconderNomePremio();
            if (this.modelo) {
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

        // Encolher luzes ao encerrar
        if (this.estado === "ENCERRAR") {
            this._luzCima.intensity *= 0.8;
            this._luzBaixo.intensity *= 0.8;
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
            this.controls.target.set(this.basePos.x, this.basePos.y + 18, this.basePos.z);
            
            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
            const camOffset = new THREE.Vector3(0, 30, 60).applyQuaternion(quat);
            this.camera.position.set(this.basePos.x + camOffset.x, this.basePos.y + camOffset.y, this.basePos.z + camOffset.z);
            
            this.controls.update();
        }
    }

    // ── Privado ──────────────────────────────────────────────────────────────────
    _onKeyDown(e) {
        if (e.code === "Space") {
            this._triggerAction();
        }
    }

    _onSceneTouch(e) {
        // Evita disparar se tocar em botões da UI (como o widget)
        if (e.target.closest('#gui-container') || e.target.closest('.dg')) return;
        
        this._triggerAction();
    }

    _triggerAction() {
        if (this.estado === "AGUARDAR") {
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
            window.removeEventListener("touchstart", this._onSceneTouch);
            
            // Tocar som de abertura
            if (this.openSound) {
                if (this.openSound.isPlaying) this.openSound.stop();
                this.openSound.play();
            }
            
            this.estado = "ABRIR";

        } else if (this.estado === "CONTROLO_LIVRE") {
            this._esconderHint();
            window.removeEventListener("keydown", this._onKeyDown);
            window.removeEventListener("touchstart", this._onSceneTouch);
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

    _criarNomePremioUI() {
        this._nomePremioEl = document.createElement("div");
        Object.assign(this._nomePremioEl.style, {
            position: "fixed",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%) scale(0.5)",
            color: "#fff",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "3.5rem",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            pointerEvents: "none",
            display: "none",
            zIndex: "1000",
            textShadow: "0 0 20px rgba(255,255,255,0.5), 4px 4px 0px #cc0000",
            transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            opacity: "0"
        });
        document.body.appendChild(this._nomePremioEl);
    }

    _mostrarNomePremio(nome) {
        this._nomePremioEl.textContent = nome;
        this._nomePremioEl.style.display = "block";

        // Aplicar cores do tema (condizente com o card de comandos)
        let shadowColor = "#cc0000"; // Clássico
        if (this.temaAtual === "cyberpunk") shadowColor = "#ff00ff";
        else if (this.temaAtual === "floresta") shadowColor = "#1b4d3e";

        this._nomePremioEl.style.textShadow = `0 0 20px rgba(255,255,255,0.5), 4px 4px 0px ${shadowColor}`;

        // Force reflow
        this._nomePremioEl.offsetHeight;
        this._nomePremioEl.style.transform = "translateX(-50%) scale(1)";
        this._nomePremioEl.style.opacity = "1";
    }

    _esconderNomePremio() {
        this._nomePremioEl.style.transform = "translateX(-50%) scale(1.5)";
        this._nomePremioEl.style.opacity = "0";
        setTimeout(() => {
            if (this.estado !== "DESAPARECER" && this.estado !== "CONTROLO_LIVRE") {
                this._nomePremioEl.style.display = "none";
            }
        }, 500);
    }

    /**
     * Atualiza o visual do nome do prémio para condizer com o tema
     * @param {string} nomeTema 
     */
    atualizarTema(nomeTema) {
        this.temaAtual = nomeTema;
    }
}