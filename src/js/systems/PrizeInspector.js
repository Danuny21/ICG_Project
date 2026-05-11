import * as THREE from "three";

/**
 * PrizeInspector — Sistema para inspecionar prémios já desbloqueados na coleção.
 * 
 * Funcionalidade:
 * - Transporta o prémio para a frente da câmara.
 * - Permite rotação 360º com OrbitControls.
 * - Executa animações do modelo.
 */
export class PrizeInspector {
    constructor(scene, camera, controls, basePos = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.basePos = basePos;

        this.estado = "INATIVA"; // INATIVA, TRANSPORTAR, INSPECAO, ENCERRAR
        this.modeloOriginal = null;
        this.modeloInspector = null;
        this.mixer = null;

        // Luzes de destaque
        this._luzCima = new THREE.PointLight(0xffffff, 0, 50);
        this._luzBaixo = new THREE.PointLight(0xffffff, 0, 50);
        this.scene.add(this._luzCima);
        this.scene.add(this._luzBaixo);

        // UI
        this._containerUI = null;
        this._nomeEl = null;
        this._hintEl = null;
        this._criarUI();

        // Variáveis de transição
        this._alvoMundo = new THREE.Vector3();
        this._origemMundo = new THREE.Vector3();
        this._frameTransporte = 0;
        this._FRAMES_TRANSPORTE = 60;

        // Backup do estado da câmara/controlos
        this._backupState = {
            target: new THREE.Vector3(),
            pos: new THREE.Vector3(),
            minAzimuth: 0,
            maxAzimuth: 0,
            minPolar: 0,
            maxPolar: 0,
            enabled: true
        };

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        this._isDragging = false;
        this._prevPointerPos = new THREE.Vector2();
    }

    _criarUI() {
        this._containerUI = document.getElementById('prize-inspector-ui');
        this._nomeEl = document.getElementById('inspector-title');
        this._hintEl = document.getElementById('inspector-hint');
    }

    inspect(modeloOriginal, nome) {
        if (this.estado !== "INATIVA") return;

        this.modeloOriginal = modeloOriginal;
        this.nomeExibicao = nome;

        // Guardar estado original para restaurar depois
        this._originalParent = modeloOriginal.parent;
        this._originalLocalPos = modeloOriginal.position.clone();
        this._originalLocalRot = modeloOriginal.quaternion.clone();
        this._originalLocalScale = modeloOriginal.scale.clone();

        // Calcular posição de mundo para iniciar o transporte
        this._origemMundo.setFromMatrixPosition(modeloOriginal.matrixWorld);
        
        // Mover para a cena (topo) para não sofrer transformações dos pais
        this.scene.attach(modeloOriginal);

        // Criar Pedestal para a base do prémio
        this._criarPedestal();

        // Setup Mixer se existirem animações
        if (modeloOriginal.userData.animations && modeloOriginal.userData.animations.length > 0) {
            const animations = modeloOriginal.userData.animations;
            const idleAnimName = modeloOriginal.userData.idleAnimName;
            this.mixer = new THREE.AnimationMixer(modeloOriginal);

            let idleClip = null;
            if (idleAnimName) {
                idleClip = animations.find(c => c.name === idleAnimName);
                if (!idleClip) {
                    idleClip = animations.find(c => {
                        const clipName = c.name.toLowerCase();
                        const targetName = idleAnimName.toLowerCase();
                        return clipName === targetName || clipName.includes(targetName) || targetName.includes(clipName);
                    });
                }
            }
            if (!idleClip) {
                idleClip = animations.find(c => c.name.toLowerCase().includes("idle")) || animations[0];
            }

            const action = this.mixer.clipAction(idleClip);
            action.play();
        }

        // Guardar estado atual da câmara ANTES de alterar qualquer coisa
        this.controls.update(); 
        this._backupState.target.copy(this.controls.target);
        this._backupState.pos.copy(this.camera.position);
        this._backupState.minAzimuth = this.controls.minAzimuthAngle;
        this._backupState.maxAzimuth = this.controls.maxAzimuthAngle;
        this._backupState.minPolar = this.controls.minPolarAngle;
        this._backupState.maxPolar = this.controls.maxPolarAngle;
        this._backupState.enabled = this.controls.enabled;

        // Calcular posição à frente da câmara
        const dist = 30; // Distância da câmara
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        this._alvoMundo.copy(this.camera.position).add(forward.multiplyScalar(dist));

        // Preparar UI
        this._nomeEl.innerText = nome;
        this._containerUI.style.display = 'flex';
        this._hintEl.style.display = 'block';
        
        setTimeout(() => {
            this._nomeEl.classList.add('visible');
        }, 100);

        this.estado = "TRANSPORTAR";
        this._frameTransporte = 0;

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("pointerdown", this._onPointerDown);
        window.addEventListener("pointermove", this._onPointerMove);
        window.addEventListener("pointerup", this._onPointerUp);
    }

    _onPointerDown(e) {
        if (this.estado !== "INSPECAO") return;
        this._isDragging = true;
        this._prevPointerPos.set(e.clientX, e.clientY);
    }

    _onPointerMove(e) {
        if (!this._isDragging || this.estado !== "INSPECAO") return;

        const deltaX = e.clientX - this._prevPointerPos.x;
        this._prevPointerPos.set(e.clientX, e.clientY);

        // Rodar o modelo apenas na horizontal (Esquerda/Direita)
        const sensitivity = 0.005;
        this.modeloOriginal.rotation.y += deltaX * sensitivity;
    }

    _onPointerUp() {
        this._isDragging = false;
    }

    _onKeyDown(e) {
        if (e.code === "Space" || e.code === "Escape") {
            if (this.estado === "INSPECAO") {
                this.estado = "ENCERRAR";
            }
        }
    }

    update(deltaTime) {
        if (this.estado === "INATIVA") return;

        if (this.mixer) this.mixer.update(deltaTime);

        switch (this.estado) {
            case "TRANSPORTAR":
                this._frameTransporte++;
                const t = this._frameTransporte / this._FRAMES_TRANSPORTE;
                const easeT = t * (2 - t); // Quad out

                this.modeloOriginal.position.lerpVectors(this._origemMundo, this._alvoMundo, easeT);
                
                // Pedestal segue o modelo
                if (this.pedestal) {
                    this.pedestal.position.copy(this.modeloOriginal.position).y -= 5;
                }

                if (t >= 1) {
                    this.estado = "INSPECAO";
                    this._ativarControloLivre();
                }
                break;

            case "INSPECAO":
                // Luzes seguem o modelo
                this._luzCima.position.copy(this.modeloOriginal.position).add(new THREE.Vector3(0, 15, 5));
                this._luzBaixo.position.copy(this.modeloOriginal.position).add(new THREE.Vector3(0, -15, -5));
                this._luzCima.intensity = 1.5;
                this._luzBaixo.intensity = 1.0;

                // Pedestal segue a posição (mas não a rotação x/z se quisermos que fique direito)
                if (this.pedestal) {
                    this.pedestal.position.copy(this.modeloOriginal.position).y -= 5;
                    this.pedestal.rotation.y = this.modeloOriginal.rotation.y;
                }
                break;

            case "ENCERRAR":
                this._finalizar();
                break;
        }
    }

    _criarPedestal() {
        const group = new THREE.Group();

        // Corpo Principal (Cinzento Metálico)
        const bodyGeom = new THREE.CylinderGeometry(5, 5.5, 2, 32);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        // Tubo Neon (Aro brilhante)
        const neonGeom = new THREE.TorusGeometry(5.2, 0.3, 16, 100);
        const neonMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 5
        });
        const neon = new THREE.Mesh(neonGeom, neonMat);
        neon.rotation.x = Math.PI / 2;
        neon.position.y = 0.5; // No topo do pedestal
        group.add(neon);

        // Luz Neon que ilumina o modelo
        this.pedestalLight = new THREE.PointLight(0x00ffff, 10, 30);
        this.pedestalLight.position.y = 2;
        group.add(this.pedestalLight);

        this.pedestal = group;
        this.pedestal.position.copy(this.modeloOriginal.position).y -= 5;
        this.scene.add(this.pedestal);
    }

    _ativarControloLivre() {
        // Bloquear OrbitControls da câmara para rodar apenas o modelo
        this.controls.enabled = false;
    }

    _finalizar() {
        this.estado = "INATIVA";
        this._containerUI.style.display = 'none';
        this._nomeEl.classList.remove('visible');
        this._hintEl.style.display = 'none';
        this._luzCima.intensity = 0;
        this._luzBaixo.intensity = 0;

        // Remover pedestal e luz
        if (this.pedestal) {
            this.scene.remove(this.pedestal);
            this.pedestal = null;
            this.pedestalLight = null;
        }

        // Restaurar modelo para a posição original
        if (this.modeloOriginal && this._originalParent) {
            this._originalParent.add(this.modeloOriginal);
            this.modeloOriginal.position.copy(this._originalLocalPos);
            this.modeloOriginal.quaternion.copy(this._originalLocalRot);
            this.modeloOriginal.scale.copy(this._originalLocalScale); // CORREÇÃO: Resetar o size
        }

        // Restaurar câmara e controlos
        this.controls.target.copy(this._backupState.target);
        this.camera.position.copy(this._backupState.pos);
        this.controls.minAzimuthAngle = this._backupState.minAzimuth;
        this.controls.maxAzimuthAngle = this._backupState.maxAzimuth;
        this.controls.minPolarAngle = this._backupState.minPolar;
        this.controls.maxPolarAngle = this._backupState.maxPolar;
        this.controls.enabled = this._backupState.enabled;

        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("pointerdown", this._onPointerDown);
        window.removeEventListener("pointermove", this._onPointerMove);
        window.removeEventListener("pointerup", this._onPointerUp);
        
        this.modeloOriginal = null;
        this.mixer = null;
    }
}
