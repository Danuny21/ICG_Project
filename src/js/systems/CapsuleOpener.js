import * as THREE from "three";

// Gere a sequência de abertura de uma cápsula: transporte para o centro, animação da tampa e revelação do prémio.
export class CapsuleOpener {
    // States: IDLE | TRANSPORT | WAIT | OPEN | DISSOLVE | FREE_VIEW | CLOSING
    constructor(scene, camera, controls, confetti, basePos = new THREE.Vector3(), baseRotY = 0, openSound = null) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.confetti = confetti;
        this.basePos = basePos;
        this.baseRotY = baseRotY;
        this.openSound = openSound;

        this.state = "IDLE";
        this.model = null;
        this.capsule = null;
        this.capsulePhysics = null;
        this.targetScale = 2;
        this.capsuleOpacity = 1.0;
        this.displayName = "";
        this.currentTheme = "classic";
        this.mixer = null;
        this._prevTime = 0;

        this._lightTop = new THREE.PointLight(0xffffff, 0, 50);
        this._lightBottom = new THREE.PointLight(0xffffff, 0, 50);
        this.scene.add(this._lightTop);
        this.scene.add(this._lightBottom);

        this._targetWorld = new THREE.Vector3();
        this._originWorld = new THREE.Vector3();
        this._transportFrame = 0;
        this._TRANSPORT_FRAMES = 100;

        // Referências aos elementos de UI estáticos no index.html
        this._hintOpen = document.getElementById("capsule-hint-open");
        this._hintReturn = document.getElementById("capsule-hint-return");
        this._prizeNameEl = document.getElementById("capsule-prize-name");

        this._closingTime = 0;
        this._CLOSING_DURATION = 0.8;
        this._camFromPos = new THREE.Vector3();
        this._camFromTarget = new THREE.Vector3();
        this._camToPos = new THREE.Vector3();
        this._camToTarget = new THREE.Vector3();

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onSceneTouch = this._onSceneTouch.bind(this);

        // Referências para limpeza completa da cápsula
        this._physicsWorld = null;
        this._capsulesArray = null;
    }

    // Define as referências necessárias para a limpeza completa
    setCleanupRefs(physicsWorld, capsulesArray) {
        this._physicsWorld = physicsWorld;
        this._capsulesArray = capsulesArray;
    }

    // Inicia o processo de abertura de uma cápsula específica.
    openCapsule(capsuleObj, capsulePhys, modelObj, finalScale = 2, clips = [], animationName = null, displayName = "") {
        if (this.state !== "IDLE") return;

        this.capsule = capsuleObj; // Deve conter { group, hinge }
        this.capsulePhysics = capsulePhys;
        this.model = modelObj;
        this.targetScale = finalScale;
        this.displayName = displayName;

        if (clips?.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            const clip = this._findClip(clips, animationName);
            this.mixer.clipAction(clip).play();
        }

        if (this.capsulePhysics) {
            this.capsulePhysics.apanhada = true; // Impede que a física continue a mover a cápsula
            this.capsulePhysics.vel.set(0, 0, 0);
        }

        this._originWorld.copy(this.capsule.group.position);

        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        this._targetWorld.copy(this.camera.position).add(dir.multiplyScalar(20));
        this._targetWorld.y -= 6;

        this.capsuleOpacity = 1.0;
        this.capsule.group.traverse(child => {
            if (child.isMesh) {
                if (child.material.userData.originalOpacity === undefined)
                    child.material.userData.originalOpacity = child.material.opacity;
                child.material.transparent = true;
                child.material.opacity = child.material.userData.originalOpacity;
            }
        });

        this.capsule.group.rotation.set(0, 0, 0);
        this.capsule.hinge.rotation.set(0, 0, 0);
        this.capsule.hinge.position.set(0, 0, -1.5);
        this.capsule.group.children[0].position.set(0, 0, 0);

        this._transportFrame = 0;
        this.state = "TRANSPORT";
        this._lightTop.intensity = 0;
        this._lightBottom.intensity = 0;
        this._lightTop.position.copy(this._targetWorld).add(new THREE.Vector3(0, 8, 0));
        this._lightBottom.position.copy(this._targetWorld).add(new THREE.Vector3(0, -8, 0));
        if (this.controls) this.controls.enabled = false;
    }

    update(time) {
        if (this.state === "IDLE") return;

        const delta = this._prevTime === 0 ? 0 : (time - this._prevTime) / 1000;
        this._prevTime = time;
        if (this.mixer) this.mixer.update(delta);

        if (this.state === "TRANSPORT") {
            this._transportFrame++;
            const t = Math.min(this._transportFrame / this._TRANSPORT_FRAMES, 1);
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.capsule.group.position.lerpVectors(this._originWorld, this._targetWorld, ease);
            this.capsule.group.rotation.y += 0.04;
            this.capsule.group.rotation.x = 0;
            this.capsule.group.rotation.z = 0;

            if (t >= 1) {
                this.state = "WAIT";
                this._hintOpen.classList.remove("hidden");
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                if (!isTouch) window.addEventListener("keydown", this._onKeyDown);
            }
        }

        if (this.state === "WAIT") {
            this.capsule.group.position.y = this._targetWorld.y + Math.sin(time * 0.003) * 0.15;
            this.capsule.group.position.x = this._targetWorld.x;
            this.capsule.group.position.z = this._targetWorld.z;
            this.capsule.group.rotation.y += 0.01;
            if (this.controls) {
                this.controls.target.lerp(this._targetWorld, 0.08);
                this.controls.update();
            }
        }

        if (this.state === "OPEN") {
            const hinge = this.capsule.hinge;
            this.capsule.group.position.set(this._targetWorld.x, this._targetWorld.y + Math.sin(time * 0.003) * 0.15, this._targetWorld.z);

            if (hinge.rotation.x > -Math.PI / 1.2) {
                hinge.rotation.x -= 0.04;
            } else {
                this.state = "DISSOLVE";
                if (this.displayName) this._showPrizeName(this.displayName);
                if (this.confetti) this.confetti.fire(this.capsule.group.position);
            }

            if (this.controls) {
                this.controls.target.lerp(this.capsule.group.position, 0.1);
                this.controls.update();
            }
        }

        if (this.state === "DISSOLVE") {
            const bottom = this.capsule.group.children[0];
            const top = this.capsule.hinge;
            bottom.position.y -= 0.1;
            bottom.position.z += 0.05;
            top.position.y -= 0.1;
            top.position.z -= 0.05;

            if (this.model?.parent !== this.scene) {
                this.scene.add(this.model);
                this.model.position.copy(this._targetWorld);
            }

            if (this.model && this.model.scale.x < this.targetScale) {
                const newSize = Math.min(this.model.scale.x + this.targetScale / 50, this.targetScale * 1.25);
                this.model.scale.setScalar(newSize);
                this.model.position.y = this._targetWorld.y + 0.5;
            }

            this._lightTop.intensity = THREE.MathUtils.lerp(this._lightTop.intensity, 3, 0.1);
            this._lightBottom.intensity = THREE.MathUtils.lerp(this._lightBottom.intensity, 2, 0.1);

            this.capsuleOpacity -= 0.01;
            this.capsule.group.traverse(child => {
                if (child.isMesh) {
                    const base = child.material.userData.originalOpacity ?? 1.0;
                    child.material.transparent = true;
                    child.material.opacity = Math.max(0, base * this.capsuleOpacity);
                }
            });

            if (this.capsuleOpacity <= 0) {
                this.scene.remove(this.capsule.group);
                if (this.controls) this.controls.enabled = true;
                this.state = "FREE_VIEW";
                this._hintReturn.classList.remove("hidden");
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                if (!isTouch) window.addEventListener("keydown", this._onKeyDown);
            }
        }

        if (this.state === "FREE_VIEW") {
            if (this.model) {
                this.model.rotation.y += 0.005;
                this.model.position.set(this._targetWorld.x, this._targetWorld.y + 0.5, this._targetWorld.z);
            }
        }

        if (this.state === "CLOSING") {
            this._closingTime += delta;
            const t = Math.min(this._closingTime / this._CLOSING_DURATION, 1);
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(this._camFromPos, this._camToPos, ease);
            this.controls.target.lerpVectors(this._camFromTarget, this._camToTarget, ease);

            if (this.model) {
                this.model.scale.multiplyScalar(Math.pow(0.01, delta));
                this.model.rotation.y += 5 * delta;
                if (this.model.scale.x < 0.01) {
                    this.scene.remove(this.model);
                    this.model = null;
                }
            }

            this._lightTop.intensity *= Math.pow(0.1, delta);
            this._lightBottom.intensity *= Math.pow(0.1, delta);

            if (t >= 1) this._finalizeClose();
        }
    }

    _finalizeClose() {
        this._hidePrizeName();

        // Limpeza completa da cápsula aberta
        if (this.capsulePhysics) {
            // Remove o corpo Rapier
            if (this._physicsWorld) {
                this._physicsWorld.removeCapsuleBody(this.capsulePhysics);
            }

            // Remove do array global de cápsulas
            if (this._capsulesArray) {
                const idx = this._capsulesArray.indexOf(this.capsulePhysics);
                if (idx !== -1) this._capsulesArray.splice(idx, 1);
            }

            // Faz dispose da geometria e materiais do mesh da cápsula
            const mesh = this.capsulePhysics.mesh;
            if (mesh) {
                // Garante que está fora da cena (pode já ter sido removido no DISSOLVE)
                this.scene.remove(mesh);
                mesh.traverse(child => {
                    if (child.isMesh) {
                        child.geometry?.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material?.dispose();
                        }
                    }
                });
            }
        }

        // Limpeza do modelo do prémio
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }

        this.capsule = null;
        this.capsulePhysics = null;
        this.state = "IDLE";
        this._prevTime = 0;
        if (this.mixer) { this.mixer.stopAllAction(); this.mixer = null; }
        if (this.controls) {
            this.controls.enabled = true;
            this.controls.target.copy(this._camToTarget);
            this.camera.position.copy(this._camToPos);
            this.controls.update();
        }
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

    _onKeyDown(e) { if (e.code === "Space") this.triggerAction(); }

    _onSceneTouch(e) {
        if (e.target.closest('#gui-container') || e.target.closest('.dg')) return;
        this.triggerAction();
    }

    triggerAction() {
        if (this.state === "WAIT") {
            this._hintOpen.classList.add("hidden");
            window.removeEventListener("keydown", this._onKeyDown);
            window.removeEventListener("touchstart", this._onSceneTouch);
            if (this.openSound) {
                if (this.openSound.isPlaying) this.openSound.stop();
                this.openSound.play();
            }
            this.state = "OPEN";

        } else if (this.state === "FREE_VIEW") {
            this._hintReturn.classList.add("hidden");
            this._hidePrizeName();
            window.removeEventListener("keydown", this._onKeyDown);
            window.removeEventListener("touchstart", this._onSceneTouch);

            this.state = "CLOSING";
            this._closingTime = 0;
            this._camFromPos.copy(this.camera.position);
            this._camFromTarget.copy(this.controls.target);
            this._camToTarget.set(this.basePos.x, this.basePos.y + 18, this.basePos.z);
            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
            const offset = new THREE.Vector3(0, 30, 60).applyQuaternion(quat);
            this._camToPos.copy(this.basePos).add(offset);
        }
    }

    _showPrizeName(name) {
        this._prizeNameEl.textContent = name;
        this._prizeNameEl.setAttribute('data-theme', this.currentTheme || 'default');
        this._prizeNameEl.classList.add("visible");
        setTimeout(() => this._prizeNameEl.classList.add("visible"), 100);
    }

    _hidePrizeName() { this._prizeNameEl.classList.remove("visible"); }

    updateTheme(theme) { this.currentTheme = theme; }
}