import * as THREE from "three";
import { criarCapsula } from "../models/capsule.js";
import { RAIO_CAPSULA } from "./PhysicsSystem.js";

/**
 * Responsável por gerar e posicionar as cápsulas na máquina.
 */
export class CapsuleSpawner {
    /**
     * Gera uma quantidade de cápsulas e adiciona-as à cena.
     * @param {THREE.Scene} scene 
     * @param {number} quantidade 
     * @returns {Array} Lista de objetos de cápsula inicializados
     */
    static gerarCapsulas(scene, quantidade, basePos = new THREE.Vector3(0, 0, 0), baseRotY = 0) {
        const capsulas = [];

        for (let i = 0; i < quantidade; i++) {
            const { grupo, dobradica } = criarCapsula();

            // Posicionamento aleatório (evitando o buraco)
            let posX, posZ, caiuNoBuraco = true;
            while (caiuNoBuraco) {
                posX = (Math.random() - 0.5) * 20;
                posZ = (Math.random() - 0.5) * 20;
                caiuNoBuraco = (posX < -2.5 && posZ > 2.5);
            }

            // Altura inicial para efeito de "chuva"
            const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseRotY);
            const relPos = new THREE.Vector3(posX, 22 + Math.random() * 12, posZ).applyQuaternion(quat);
            grupo.position.set(basePos.x + relPos.x, basePos.y + relPos.y, basePos.z + relPos.z);
            scene.add(grupo);

            // Estrutura de dados da cápsula para os sistemas de física e interação
            const capsulaObj = {
                mesh: grupo,
                dobradica: dobradica,
                modeloInterno: null,
                vel: new THREE.Vector3(),
                radius: RAIO_CAPSULA,
                apanhada: false,
                saiu: false,
                aberta: false
            };

            capsulas.push(capsulaObj);
        }

        return capsulas;
    }
}