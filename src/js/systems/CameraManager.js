import * as THREE from "three";

export class CameraManager {
    constructor(camera, controls, capsuleOpener) {
        this.camera = camera;
        this.controls = controls;
        this.capsuleOpener = capsuleOpener;

        this.viewState = "machine";
        this.isTransitioning = false;

        // Definidas externamente durante a inicialização
        this.views = {};
        this.viewBtns = {};
    }

    init(posMaquina, rotMaquina, distBase = 75) {
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotMaquina);
        const camOffset = new THREE.Vector3(0, 30, distBase).applyQuaternion(quat);

        this.views = {
            machine: {
                pos: new THREE.Vector3(posMaquina.x + camOffset.x, 30, posMaquina.z + camOffset.z),
                target: new THREE.Vector3(posMaquina.x, 18, posMaquina.z)
            },
            collection: {
                pos: new THREE.Vector3(10, 40, 140),
                target: new THREE.Vector3(-97, 20, 141)
            },
            table: {
                pos: new THREE.Vector3(75, 30, 165), // Sentado na mesa (Lado Direito, muito perto da porta)
                target: new THREE.Vector3(-30, 10, 20) // Foco ligeiramente mais baixo
            }
        };

        this.viewBtns = {
            machine: document.getElementById('btn-view-machine'),
            collection: document.getElementById('btn-view-collection'),
            table: document.getElementById('btn-view-table')
        };

        // Posição inicial (máquina)
        this.controls.maxDistance = 250; // Aumentar para permitir ver o salão todo
        this.camera.position.copy(this.views.machine.pos);
        this.controls.target.copy(this.views.machine.target);
        this.controls.update();


        this._setupEvents();
    }

    _setActiveButton(state) {
        if (this.viewBtns.machine && this.viewBtns.collection && this.viewBtns.table) {
            Object.values(this.viewBtns).forEach(btn => btn.classList.remove('active'));
            this.viewBtns[state].classList.add('active');
        }

        const uiElement = document.getElementById('ui');
        if (uiElement) {
            uiElement.style.display = (state === 'machine') ? 'block' : 'none';
        }
    }

    _setupEvents() {
        if (this.viewBtns.machine && this.viewBtns.collection && this.viewBtns.table) {
            Object.keys(this.viewBtns).forEach(state => {
                this.viewBtns[state].addEventListener('click', () => {
                    if (this.viewState === state && !this.isTransitioning) return; // Não resetar se já estiver na vista

                    if (this.capsuleOpener && this.capsuleOpener.estado === "CONTROLO_LIVRE") {
                        this.capsuleOpener.estado = "ENCERRAR";
                    }
                    this.viewState = state;
                    this._setActiveButton(state);
                    this.isTransitioning = true;
                });
            });
        }
    }

    update() {
        if (this.isTransitioning) {
            const targetView = this.views[this.viewState];
            this.camera.position.lerp(targetView.pos, 0.05);
            this.controls.target.lerp(targetView.target, 0.05);

            // Verifica se está próximo o suficiente para terminar a transição
            if (this.camera.position.distanceTo(targetView.pos) < 0.1 &&
                this.controls.target.distanceTo(targetView.target) < 0.1) {
                this.isTransitioning = false;
            }
            
            this.controls.update(); // Importante para sincronizar o OrbitControls durante a transição
        }

        // Aplicar restrições dinâmicas
        if (this.viewState === "machine") {
            this.controls.enabled = true;
            this.controls.minAzimuthAngle = 0.1; 
            this.controls.maxAzimuthAngle = Math.PI * 0.85;
            this.controls.minPolarAngle = 0; // Resetar
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 20;
            this.controls.maxDistance = 250;
        } else if (this.viewState === "table") {
            this.controls.enabled = true;
            this.controls.minAzimuthAngle = -Math.PI / 1.2; 
            this.controls.maxAzimuthAngle = Math.PI / 4;
            this.controls.minPolarAngle = 1.1; 
            this.controls.maxPolarAngle = 1.6;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 300;
        } else if (this.viewState === "collection") {
            this.controls.enabled = false; 
            // Resetar tudo para não interferir com o posicionamento fixo
            this.controls.minAzimuthAngle = -Infinity;
            this.controls.maxAzimuthAngle = Infinity;
            this.controls.minPolarAngle = 0;
            this.controls.maxPolarAngle = Math.PI;
        } else {
            this.controls.enabled = true;
            this.controls.minAzimuthAngle = -Infinity;
            this.controls.maxAzimuthAngle = Infinity;
            this.controls.minPolarAngle = 0;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 20;
            this.controls.maxDistance = 250;
        }
    }
}


