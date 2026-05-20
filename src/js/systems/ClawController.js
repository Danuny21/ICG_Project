import * as THREE from "three";

// Controlador legado da garra — não usado no fluxo principal (substituído por ClawAnimation.js + PhysicsSystem.js)
export class ClawController {
    constructor(clawMachine, toys, scene, confetti) {
        this.clawMachine = clawMachine;
        this.toys = toys;
        this.scene = scene;
        this.confetti = confetti;

        // Estado da garra
        this.state = "IDLE"; // IDLE | PLAYING | RETURNING

        // Teclas premidas
        this.keys = {};
        this.moveSpeed = 0.15;

        // Limites de movimento
        this.limits = {
            x: { min: -3, max: 3 },
            z: { min: -3, max: 3 },
            depth: { min: -3, max: 2 }
        };

        this._setupInput();
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && this.state === 'IDLE') this._startGame();
            if (e.key === 'Enter') this._closeClaw();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    _startGame() {
        this.state = 'PLAYING';
    }

    _updateMovement() {
        if (this.state !== 'PLAYING') return;

        const dx = (this.keys['arrowright'] ? 1 : 0) - (this.keys['arrowleft'] ? 1 : 0);
        const dz = (this.keys['arrowdown'] ? 1 : 0) - (this.keys['arrowup'] ? 1 : 0);
        const dd = (this.keys['d'] ? 1 : 0) - (this.keys['a'] ? 1 : 0);

        const pos = this.clawMachine.clawPosition;
        pos.x = Math.max(this.limits.x.min, Math.min(this.limits.x.max, pos.x + dx * this.moveSpeed));
        pos.z = Math.max(this.limits.z.min, Math.min(this.limits.z.max, pos.z + dz * this.moveSpeed));
        pos.depth = Math.max(this.limits.depth.min, Math.min(this.limits.depth.max, pos.depth + dd * this.moveSpeed));

        this.clawMachine.axisGroup.position.x = pos.x;
        this.clawMachine.axisGroup.position.z = pos.z;
        this.clawMachine.centralAxis.position.y = pos.depth;
    }

    _closeClaw() {
        if (this.state !== 'PLAYING') return;
        this._checkCollisions();
        setTimeout(() => { this.state = 'RETURNING'; }, 500);
        setTimeout(() => {
            this.clawMachine.clawPosition = { x: 0, z: 0, depth: 0 };
            this.clawMachine.axisGroup.position.set(0, 14, 0);
            this.clawMachine.centralAxis.position.y = 0;
            this.state = 'IDLE';
        }, 2000);
    }

    _checkCollisions() {
        const clawPos = new THREE.Vector3(
            this.clawMachine.clawPosition.x,
            this.clawMachine.clawPosition.depth,
            this.clawMachine.clawPosition.z
        );
        const grabRadius = 1.5;

        this.toys.forEach(toy => {
            if (toy.userData.grabbed) return;
            if (toy.position.distanceTo(clawPos) < grabRadius) this._grabToy(toy);
        });
    }

    _grabToy(toy) {
        toy.userData.grabbed = true;

        const targetPos = new THREE.Vector3(
            this.clawMachine.clawPosition.x, -5,
            this.clawMachine.clawPosition.z
        );

        // Anima o brinquedo em direção ao alvo e remove-o da cena
        const interval = setInterval(() => {
            toy.position.lerp(targetPos, 0.1);
            if (toy.position.y < -4) {
                clearInterval(interval);
                this.scene.remove(toy);
                if (this.confetti) this.confetti.fire(toy.position);
            }
        }, 50);
    }

    update() {
        if (this.state === 'PLAYING') this._updateMovement();
    }
}
