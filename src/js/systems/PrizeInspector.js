import * as THREE from "three";

// Gere a inspeção detalhada de um prémio da coleção, transportando-o para a frente da câmara com um pedestal.
export class PrizeInspector {
    // States: IDLE | TRANSPORT | INSPECT | RETURNING | CLOSING
    constructor(scene, camera, controls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;

        this.state = "IDLE";
        this.originalModel = null;
        this.mixer = null;
        this.pedestal = null;
        this.pedestalLight = null;

        this._lightTop = new THREE.PointLight(0xffffff, 0, 50);
        this._lightBottom = new THREE.PointLight(0xffffff, 0, 50);
        this.scene.add(this._lightTop);
        this.scene.add(this._lightBottom);

        this._uiContainer = document.getElementById('prize-inspector-ui');
        this._titleEl = document.getElementById('inspector-title');
        this._hintEl = document.getElementById('inspector-hint');

        this._targetWorld = new THREE.Vector3();
        this._originWorld = new THREE.Vector3();
        this._transportFrame = 0;
        this._TRANSPORT_FRAMES = 60;

        this._cameraBackup = {
            target: new THREE.Vector3(), pos: new THREE.Vector3(),
            minAzimuth: 0, maxAzimuth: 0, minPolar: 0, maxPolar: 0, enabled: true
        };

        this._isDragging = false;
        this._prevPointerPos = new THREE.Vector2();

        this._closingTime = 0;
        this._CLOSING_DURATION = 0.8;
        this._camFromPos = new THREE.Vector3();
        this._camFromTarget = new THREE.Vector3();
        this._homeWorldPos = new THREE.Vector3();
        this._homeWorldQuat = new THREE.Quaternion();
        this._modelStartPos = new THREE.Vector3();
        this._modelStartQuat = new THREE.Quaternion();

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        // Pré-constrói o pedestal uma única vez para evitar stall de shader na 1ª utilização
        this.pedestal = this._buildPedestal();
        this.pedestal.visible = false;
        this.scene.add(this.pedestal);
    }

    // Inicia a inspeção de um modelo da coleção.
    inspect(originalModel, name) {
        if (this.state !== "IDLE") return;

        this.originalModel = originalModel;
        this.displayName = name;

        this._originalParent = originalModel.parent;
        this._originalLocalPos = originalModel.position.clone();
        this._originalLocalRot = originalModel.quaternion.clone();
        this._originalLocalScale = originalModel.scale.clone();

        originalModel.updateMatrixWorld(true);
        this._homeWorldPos.setFromMatrixPosition(originalModel.matrixWorld);
        originalModel.getWorldQuaternion(this._homeWorldQuat);
        this.scene.attach(originalModel);

        this._createPedestal();

        const { animations, idleAnimName } = originalModel.userData;
        if (animations?.length > 0) {
            this.mixer = new THREE.AnimationMixer(originalModel);
            const clip = this._findClip(animations, idleAnimName);
            this.mixer.clipAction(clip).play();
        }

        this.controls.update();
        this._cameraBackup.target.copy(this.controls.target);
        this._cameraBackup.pos.copy(this.camera.position);
        this._cameraBackup.minAzimuth = this.controls.minAzimuthAngle;
        this._cameraBackup.maxAzimuth = this.controls.maxAzimuthAngle;
        this._cameraBackup.minPolar = this.controls.minPolarAngle;
        this._cameraBackup.maxPolar = this.controls.maxPolarAngle;
        this._cameraBackup.enabled = this.controls.enabled;

        this._originWorld.setFromMatrixPosition(originalModel.matrixWorld);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        this._targetWorld.copy(this.camera.position).add(forward.multiplyScalar(30));

        this._titleEl.innerText = name;
        this._uiContainer.style.display = 'flex';
        this._hintEl.classList.remove('hidden');
        setTimeout(() => this._titleEl.classList.add('visible'), 100);

        this.state = "TRANSPORT";
        this._transportFrame = 0;

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("pointerdown", this._onPointerDown);
        window.addEventListener("pointermove", this._onPointerMove);
        window.addEventListener("pointerup", this._onPointerUp);
    }

    update(deltaTime) {
        if (this.state === "IDLE") return;
        if (this.mixer) this.mixer.update(deltaTime);

        switch (this.state) {
            case "TRANSPORT": {
                this._transportFrame++;
                const t = this._transportFrame / this._TRANSPORT_FRAMES;
                const ease = t * (2 - t);
                this.originalModel.position.lerpVectors(this._originWorld, this._targetWorld, ease);
                if (this.pedestal) this.pedestal.position.copy(this.originalModel.position).y -= 5;
                if (t >= 1) { this.state = "INSPECT"; this.controls.enabled = false; }
                break;
            }
            case "INSPECT": {
                this._lightTop.position.copy(this.originalModel.position).add(new THREE.Vector3(0, 15, 5));
                this._lightBottom.position.copy(this.originalModel.position).add(new THREE.Vector3(0, -15, -5));
                this._lightTop.intensity = 1.5;
                this._lightBottom.intensity = 1.0;
                if (this.pedestal) {
                    this.pedestal.position.copy(this.originalModel.position).y -= 5;
                    this.pedestal.rotation.y = this.originalModel.rotation.y;
                }
                break;
            }
            case "RETURNING": {
                this._closingTime += deltaTime;
                const tRet = Math.min(this._closingTime / this._CLOSING_DURATION, 1);
                const ease = tRet < 0.5 ? 4 * tRet ** 3 : 1 - Math.pow(-2 * tRet + 2, 3) / 2;

                this.camera.position.lerpVectors(this._camFromPos, this._cameraBackup.pos, ease);
                this.controls.target.lerpVectors(this._camFromTarget, this._cameraBackup.target, ease);

                if (this.originalModel) {
                    this.originalModel.position.lerpVectors(this._modelStartPos, this._homeWorldPos, ease);
                    this.originalModel.quaternion.slerpQuaternions(this._modelStartQuat, this._homeWorldQuat, ease);
                    if (this.pedestal) this.pedestal.position.copy(this.originalModel.position).y -= 5;
                }

                if (tRet >= 1) this.state = "CLOSING";
                break;
            }
            case "CLOSING":
                this._finalize();
                break;
        }
    }

    _onPointerDown(e) {
        if (this.state !== "INSPECT") return;
        this._isDragging = true;
        this._prevPointerPos.set(e.clientX, e.clientY);
    }

    _onPointerMove(e) {
        if (!this._isDragging || this.state !== "INSPECT") return;
        const deltaX = e.clientX - this._prevPointerPos.x;
        this._prevPointerPos.set(e.clientX, e.clientY);
        this.originalModel.rotation.y += deltaX * 0.005;
    }

    _onPointerUp() { this._isDragging = false; }

    _onKeyDown(e) {
        if ((e.code === "Space" || e.code === "Escape") && this.state === "INSPECT")
            this.prepareReturn();
    }

    prepareReturn() {
        this.state = "RETURNING";
        this._closingTime = 0;
        this._camFromPos.copy(this.camera.position);
        this._camFromTarget.copy(this.controls.target);
        this._modelStartPos.copy(this.originalModel.position);
        this._modelStartQuat.copy(this.originalModel.quaternion);
        this._uiContainer.style.display = 'none';
        this._titleEl.classList.remove('visible');
        this._hintEl.classList.add('hidden');
        this._lightTop.intensity = 0;
        this._lightBottom.intensity = 0;
    }

    _createPedestal() {
        // Mostra o pedestal pré-construído
        this.pedestal.position.copy(this.originalModel.position);
        this.pedestal.position.y -= 5;
        this.pedestal.visible = true;
    }

    // Constrói a geometria do pedestal uma única vez
    _buildPedestal() {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
        const neonMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 5 });

        group.add(new THREE.Mesh(new THREE.CylinderGeometry(5, 5.5, 2, 32), baseMat));

        const neon = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.3, 16, 100), neonMat);
        neon.rotation.x = Math.PI / 2;
        neon.position.y = 0.5;
        group.add(neon);

        this.pedestalLight = new THREE.PointLight(0x00ffff, 10, 30);
        this.pedestalLight.position.y = 2;
        group.add(this.pedestalLight);

        return group;
    }

    _finalize() {
        this.state = "IDLE";
        this._uiContainer.style.display = 'none';
        this._titleEl.classList.remove('visible');
        this._hintEl.classList.add('hidden');
        this._lightTop.intensity = 0;
        this._lightBottom.intensity = 0;

        // Esconde o pedestal (não o destrói — é reutilizado)
        if (this.pedestal) {
            this.pedestal.visible = false;
        }

        if (this.originalModel && this._originalParent) {
            this._originalParent.add(this.originalModel);
            this.originalModel.position.copy(this._originalLocalPos);
            this.originalModel.quaternion.copy(this._originalLocalRot);
            this.originalModel.scale.copy(this._originalLocalScale);
        }

        this.controls.target.copy(this._cameraBackup.target);
        this.camera.position.copy(this._cameraBackup.pos);
        this.controls.minAzimuthAngle = this._cameraBackup.minAzimuth;
        this.controls.maxAzimuthAngle = this._cameraBackup.maxAzimuth;
        this.controls.minPolarAngle = this._cameraBackup.minPolar;
        this.controls.maxPolarAngle = this._cameraBackup.maxPolar;
        this.controls.enabled = this._cameraBackup.enabled;
        this.controls.update();

        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("pointerdown", this._onPointerDown);
        window.removeEventListener("pointermove", this._onPointerMove);
        window.removeEventListener("pointerup", this._onPointerUp);

        this.originalModel = null;
        this.mixer = null;
    }

    _findClip(clips, name) {
        if (name) {
            const exact = clips.find(c => c.name === name);
            if (exact) return exact;
            const fuzzy = clips.find(c => {
                const a = c.name.toLowerCase(), b = name.toLowerCase();
                return a === b || a.includes(b) || b.includes(a);
            });
            if (fuzzy) return fuzzy;
        }
        return clips.find(c => c.name.toLowerCase().includes("idle")) ?? clips[0];
    }
}
