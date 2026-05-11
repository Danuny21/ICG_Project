import * as THREE from "three";
import { criarCapsula } from "../models/capsule.js";
import { CAPSULE_RADIUS } from "./PhysicsSystem.js";

export class CapsuleSpawner {
    static spawnCapsules(scene, count, basePos = new THREE.Vector3(), baseRotY = 0) {
        const capsules = [];

        for (let i = 0; i < count; i++) {
            const { grupo, dobradica } = criarCapsula();

            let posX, posZ, inHole = true;
            while (inHole) {
                posX = (Math.random() - 0.5) * 20;
                posZ = (Math.random() - 0.5) * 20;
                inHole = (posX < -2.5 && posZ > 2.5);
            }

            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseRotY);
            const relPos = new THREE.Vector3(posX, 22 + Math.random() * 12, posZ).applyQuaternion(quat);
            grupo.position.set(basePos.x + relPos.x, basePos.y + relPos.y, basePos.z + relPos.z);
            scene.add(grupo);

            capsules.push({
                mesh: grupo,
                dobradica,
                modeloInterno: null,
                vel: new THREE.Vector3(),
                radius: CAPSULE_RADIUS,
                apanhada: false,
                saiu: false,
                aberta: false
            });
        }

        return capsules;
    }
}