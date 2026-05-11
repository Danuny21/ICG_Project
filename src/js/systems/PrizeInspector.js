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

        // Clonar o modelo para inspeção
        this.modeloInspector = modeloOriginal.clone();
        
        // Garantir que as animações também funcionam no clone
        if (modeloOriginal.userData.animations) {
            this.mixer = new THREE.AnimationMixer(this.modeloInspector);
            modeloOriginal.userData.animations.forEach(clip => {
                this.mixer.clipAction(clip).play();
            });
        }

        // --- CORREÇÃO: Aplicar escala de mundo ---
        const worldScale = new THREE.Vector3();
        modeloOriginal.getWorldScale(worldScale);
        this.modeloInspector.scale.copy(worldScale);

        // Posicionar inicialmente onde o original está (mundo)
        this._origemMundo.setFromMatrixPosition(modeloOriginal.matrixWorld);
        this.modeloInspector.position.copy(this._origemMundo);
        this.modeloInspector.quaternion.setFromRotationMatrix(modeloOriginal.matrixWorld);
        
        this.scene.add(this.modeloInspector);

        // Guardar estado atual da câmara ANTES de alterar qualquer coisa
        this.controls.update(); // Forçar sincronização
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

                this.modeloInspector.position.lerpVectors(this._origemMundo, this._alvoMundo, easeT);
                
                // Suavemente rodar para a frente da câmara (opcional)
                // this.modeloInspector.quaternion.slerp(this.camera.quaternion, easeT * 0.1);

                if (t >= 1) {
                    this.estado = "INSPECAO";
                    this._ativarControloLivre();
                }
                break;

            case "INSPECAO":
                // Luzes seguem o modelo
                this._luzCima.position.copy(this.modeloInspector.position).add(new THREE.Vector3(0, 15, 5));
                this._luzBaixo.position.copy(this.modeloInspector.position).add(new THREE.Vector3(0, -15, -5));
                this._luzCima.intensity = 1.5;
                this._luzBaixo.intensity = 1.0;
                break;

            case "ENCERRAR":
                this._finalizar();
                break;
        }
    }

    _ativarControloLivre() {
        this.controls.enabled = true;
        this.controls.target.copy(this._alvoMundo);
        
        // Libertar rotação 360
        this.controls.minAzimuthAngle = -Infinity;
        this.controls.maxAzimuthAngle = Infinity;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        
        // Restringir zoom para não fugir do prémio
        this.controls.minDistance = 15;
        this.controls.maxDistance = 60;
    }

    _finalizar() {
        this.estado = "INATIVA";
        this._containerUI.style.display = 'none';
        this._nomeEl.classList.remove('visible');
        this._hintEl.style.display = 'none';
        this._luzCima.intensity = 0;
        this._luzBaixo.intensity = 0;

        if (this.modeloInspector) {
            this.scene.remove(this.modeloInspector);
            this.modeloInspector = null;
        }

        // Restaurar câmara e controlos (se estivermos na coleção, desativamos novamente)
        this.controls.target.copy(this._backupState.target);
        this.camera.position.copy(this._backupState.pos);
        this.controls.minAzimuthAngle = this._backupState.minAzimuth;
        this.controls.maxAzimuthAngle = this._backupState.maxAzimuth;
        this.controls.minPolarAngle = this._backupState.minPolar;
        this.controls.maxPolarAngle = this._backupState.maxPolar;
        this.controls.enabled = this._backupState.enabled;

        window.removeEventListener("keydown", this._onKeyDown);
    }
}
