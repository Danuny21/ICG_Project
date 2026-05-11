import * as THREE from "three";
import { criarCapsula } from "../models/capsule.js";
import { CAPSULE_RADIUS } from "./PhysicsSystem.js";

// Responsável por gerar as cápsulas dentro da máquina de garras.
// As cápsulas são colocadas aleatoriamente no interior, evitando a zona do buraco de saída.
export class CapsuleSpawner {
    static spawnCapsules(scene, count, basePos = new THREE.Vector3(), baseRotY = 0) {
        const capsules = [];

        for (let i = 0; i < count; i++) {
            const { grupo, dobradica } = criarCapsula();

            // Gera uma posição aleatória que não coincida com o buraco de saída
            let posX, posZ, inHole = true;
            while (inHole) {
                posX = (Math.random() - 0.5) * 20;
                posZ = (Math.random() - 0.5) * 20;
                inHole = (posX < -2.5 && posZ > 2.5); // Zona do buraco
            }

            // Aplica a rotação da máquina à posição relativa e adiciona à posição base
            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseRotY);
            const relPos = new THREE.Vector3(posX, 22 + Math.random() * 12, posZ).applyQuaternion(quat);
            grupo.position.set(basePos.x + relPos.x, basePos.y + relPos.y, basePos.z + relPos.z);
            scene.add(grupo);

            // Regista o estado da cápsula para o sistema de física e interação
            capsules.push({
                mesh: grupo,
                dobradica,
                modeloInterno: null,  // Modelo 3D do prémio (carregado ao abrir)
                vel: new THREE.Vector3(),
                radius: CAPSULE_RADIUS,
                apanhada: false,      // Verdadeiro quando a garra a agarrou
                saiu: false,          // Verdadeiro quando saiu pela porta
                aberta: false         // Verdadeiro quando o jogador a clicou
            });
        }

        return capsules;
    }
}