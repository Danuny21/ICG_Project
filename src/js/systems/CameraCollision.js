import * as THREE from "three";

// Colisão da câmara com a geometria da cena — não usado no fluxo principal (substituído pelos limites do CameraManager).
export class CameraCollision {
    constructor(camera, controls, scene) {
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.collisionObjects = [];
        this.offset = 1.0; // Distância mínima às paredes
    }

    // Atualiza a lista de objetos que bloqueiam a câmara
    updateCollisionObjects() {
        this.collisionObjects = [];
        this.scene.traverse(child => {
            if (child.isMesh && child.visible && !child.userData.ignoreCamera && !child.name.includes("capsule"))
                this.collisionObjects.push(child);
        });
    }

    // Empurra a câmara para fora de colisões com a geometria
    update() {
        if (!this.controls?.enabled) return;

        const direction = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        const distance = this.controls.target.distanceTo(this.camera.position);

        this.raycaster.set(this.controls.target, direction);
        this.raycaster.far = distance;

        const hits = this.raycaster.intersectObjects(this.collisionObjects, false);
        if (hits.length > 0) {
            const safeDistance = Math.max(2, hits[0].distance - this.offset);
            this.camera.position.copy(direction.multiplyScalar(safeDistance).add(this.controls.target));
        }
    }
}
