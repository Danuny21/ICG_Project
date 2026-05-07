import * as THREE from "three";

export class CameraCollision {
    constructor(camera, controls, scene) {
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.collisionObjects = [];
        this.offset = 1.0; // Distance to keep from walls
    }

    updateCollisionObjects() {
        this.collisionObjects = [];
        this.scene.traverse((child) => {
            if (child.isMesh && child.visible && 
                !child.userData.ignoreCamera &&
                !child.name.includes("capsule")
            ) {
                this.collisionObjects.push(child);
            }
        });
    }

    update() {
        if (!this.controls || !this.camera || !this.controls.enabled) return;

        const target = this.controls.target;
        const camPos = this.camera.position;
        
        // Direção do target para a câmara
        const direction = new THREE.Vector3().subVectors(camPos, target).normalize();
        const distance = target.distanceTo(camPos);

        this.raycaster.set(target, direction);
        this.raycaster.far = distance;

        const intersects = this.raycaster.intersectObjects(this.collisionObjects, false);

        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // Se houver colisão, move a câmara para o ponto de impacto menos o offset
            const newDistance = Math.max(2, hit.distance - this.offset);
            
            // Calculamos a nova posição baseada na distância segura
            const newPos = new THREE.Vector3().copy(direction).multiplyScalar(newDistance).add(target);
            this.camera.position.copy(newPos);
        }
    }
}
