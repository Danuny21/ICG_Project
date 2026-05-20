import * as THREE from "three";
import { createCapsule } from "../models/capsule.js";
import { CAPSULE_RADIUS } from "./PhysicsSystem.js";

// Gera as cápsulas dentro da máquina de garras em posições aleatórias, evitando a zona do buraco de saída.
export class CapsuleSpawner {
    static spawnCapsules(scene, count, basePos = new THREE.Vector3(), baseRotY = 0) {
        const capsules = [];

        for (let i = 0; i < count; i++) {
            const { group, hinge } = createCapsule();

            // Gera posição aleatória que não coincida com o buraco de saída
            let x, z, inHole = true;
            while (inHole) {
                x = (Math.random() - 0.5) * 20;
                z = (Math.random() - 0.5) * 20;
                inHole = (x < -2.5 && z > 2.5);
            }

            // Aplica a rotação da máquina e adiciona à posição base no mundo
            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseRotY);
            const relPos = new THREE.Vector3(x, 22 + Math.random() * 12, z).applyQuaternion(quat);
            group.position.set(basePos.x + relPos.x, basePos.y + relPos.y, basePos.z + relPos.z);
            scene.add(group);

            capsules.push({
                mesh: group,
                dobradica: hinge,   // Dobradiça para animar a abertura
                modeloInterno: null, // Modelo GLB do prémio (carregado ao abrir)
                vel: new THREE.Vector3(),
                radius: CAPSULE_RADIUS,
                apanhada: false,    // Verdadeiro quando a garra a agarrou
                saiu: false,        // Verdadeiro quando saiu pela porta
                aberta: false       // Verdadeiro quando o jogador a clicou
            });
        }

        return capsules;
    }
}
