import * as THREE from "three";

// Gere os diferentes pontos de vista da câmara: MÁQUINA, COLEÇÃO e MESA.
// As transições entre vistas são suavizadas com interpolação linear (lerp).
export class CameraManager {
    constructor(camera, controls, capsuleOpener) {
        this.camera = camera;
        this.controls = controls;
        this.capsuleOpener = capsuleOpener;

        this.viewState = "machine";      // Vista ativa atual
        this.isTransitioning = false;    // Indica se uma transição está a decorrer
        this.views = {};                 // Posições e alvos de cada vista
        this.viewBtns = {};              // Referências aos botões HTML da câmara
    }

    // Inicializa as posições de câmara com base na localização da máquina
    init(machinePos, machineRotY, baseDistance = 75) {
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), machineRotY);
        const camOffset = new THREE.Vector3(0, 30, baseDistance).applyQuaternion(quat);

        // Define a posição e o alvo de cada vista
        this.views = {
            machine: {
                pos: new THREE.Vector3(machinePos.x + camOffset.x, 30, machinePos.z + camOffset.z),
                target: new THREE.Vector3(machinePos.x, 18, machinePos.z)
            },
            collection: {
                pos: new THREE.Vector3(10, 40, 140),
                target: new THREE.Vector3(-97, 20, 141)
            },
            table: {
                pos: new THREE.Vector3(75, 30, 165),
                target: new THREE.Vector3(-30, 10, 20)
            }
        };

        // Obtém as referências dos botões do HTML
        this.viewBtns = {
            machine:    document.getElementById('btn-view-machine'),
            collection: document.getElementById('btn-view-collection'),
            table:      document.getElementById('btn-view-table')
        };

        this.controls.maxDistance = 250;
        this.camera.position.copy(this.views.machine.pos);
        this.controls.target.copy(this.views.machine.target);
        this.controls.update();

        this._setupEvents();
    }

    // Atualiza o botão ativo e os painéis de ajuda consoante a vista selecionada
    _setActiveButton(state) {
        if (this.viewBtns.machine && this.viewBtns.collection && this.viewBtns.table) {
            Object.values(this.viewBtns).forEach(btn => btn.classList.remove('active'));
            this.viewBtns[state].classList.add('active');
        }

        // Mostra/esconde os painéis de instrução de cada vista
        document.getElementById('ui')?.classList.toggle('hidden', state !== 'machine');
        document.getElementById('ui-collection')?.classList.toggle('hidden', state !== 'collection');
        document.getElementById('ui-table')?.classList.toggle('hidden', state !== 'table');
        document.getElementById('mobile-controls')?.classList.toggle('hidden', state !== 'machine');
    }

    // Liga os botões HTML aos eventos de mudança de vista
    _setupEvents() {
        if (!this.viewBtns.machine) return;
        Object.keys(this.viewBtns).forEach(state => {
            this.viewBtns[state].addEventListener('click', () => {
                if (this.viewState === state && !this.isTransitioning) return;
                // Se o inspetor de cápsula estiver ativo, inicia o fecho suave
                if (this.capsuleOpener?.state === "FREE_VIEW") this.capsuleOpener.state = "CLOSING";
                this.viewState = state;
                this._setActiveButton(state);
                this.isTransitioning = true;
                
                // IMPORTANTE: Resetar os limites durante a transição para evitar conflitos com o lerp
                this.controls.minAzimuthAngle = -Infinity;
                this.controls.maxAzimuthAngle = Infinity;
                this.controls.minPolarAngle = 0;
                this.controls.maxPolarAngle = Math.PI;
                this.controls.minDistance = 0;
                this.controls.maxDistance = Infinity;
            });
        });
    }

    // Atualiza a câmara a cada frame: suaviza a transição e aplica os limites da vista ativa
    update() {
        if (this.isTransitioning) {
            const target = this.views[this.viewState];
            // Interpola suavemente a posição e o alvo da câmara
            this.camera.position.lerp(target.pos, 0.08);
            this.controls.target.lerp(target.target, 0.08);
            
            // Termina a transição quando a câmara está suficientemente próxima do destino
            if (this.camera.position.distanceTo(target.pos) < 0.2 &&
                this.controls.target.distanceTo(target.target) < 0.2) {
                this.isTransitioning = false;
                // Forçar posição final
                this.camera.position.copy(target.pos);
                this.controls.target.copy(target.target);
            }
            this.controls.update();
            return; // Sai cedo para não aplicar os limites enquanto transita
        }

        // Aplica os limites de rotação/zoom consoante a vista ativa
        if (this.viewState === "machine") {
            this.controls.enabled = true;
            this.controls.minAzimuthAngle = 0.1;
            this.controls.maxAzimuthAngle = Math.PI * 0.85;
            this.controls.minPolarAngle = 0;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 20;
            this.controls.maxDistance = 250;
        } else if (this.viewState === "table") {
            // Vista da mesa: ângulo fixo, como se o jogador estivesse sentado
            this.controls.enabled = true;
            this.controls.minAzimuthAngle = -Math.PI / 1.2;
            this.controls.maxAzimuthAngle = Math.PI / 4;
            this.controls.minPolarAngle = 1.1;
            this.controls.maxPolarAngle = 1.6;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 300;
        } else if (this.viewState === "collection") {
            // Vista da coleção: câmara fixa, sem controlos do utilizador
            this.controls.enabled = false;
            this.controls.minAzimuthAngle = -Infinity;
            this.controls.maxAzimuthAngle = Infinity;
            this.controls.minPolarAngle = 0;
            this.controls.maxPolarAngle = Math.PI;
        }
        
        this.controls.update();
    }
}
