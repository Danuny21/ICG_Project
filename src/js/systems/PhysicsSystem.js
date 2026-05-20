import * as THREE from "three";
import * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";

// Raio das cápsulas esféricas para colisões físicas
export const CAPSULE_RADIUS = 1.5;
// Posição Z da porta de saída (sincronizada com o modelo 3D)
export const DOOR_Z = 14.82;
// Altura máxima da porta (para deteção de colisão com cápsulas)
export const DOOR_HEIGHT = 8.0;
// Ângulo máximo de abertura da porta (em radianos)
export const DOOR_MAX_OPEN = -Math.PI / 2.2;

// Constantes físicas
const GRAVITY = -120;       // Gravidade (valor elevado para cápsulas pesadas e responsivas)
const DOOR_SPRING = 0.015;  // Força da mola que fecha a porta
const DOOR_DAMPING = 0.95;  // Amortecimento da oscilação da porta
const OUTSIDE_FLOOR_Y = 0;  // Nível do chão exterior (limita cápsulas que saem pela porta)

// Simula a física do mundo dentro da máquina de garras usando Rapier3D.
// Inclui cápsulas dinâmicas, dedos cinemáticos e a porta de saída com mola.
export class PhysicsWorld {

    constructor() {
        this.world = null;
        this._capsuleBodies = new Map();  // Cápsula → corpo Rapier
        this._fingerBodies = [];          // Lista de segmentos dos dedos da garra
        this._doorBody = null;            // Corpo cinemático da porta
        this._doorAngVel = 0;             // Velocidade angular da porta (para efeito de mola)
        this._graspedCapsules = new Map();
        this.basePos = new THREE.Vector3(0, 0, 0); // Posição base da máquina no mundo
        this.baseRotY = 0;                          // Rotação Y da máquina no mundo

        // Vetores temporários reutilizáveis (evita alocações a cada frame)
        this._tmpV3 = new THREE.Vector3();
        this._tmpQ = new THREE.Quaternion();
        this._tmpEul = new THREE.Euler();
    }

    // Inicializa o motor de física (assíncrono pois carrega WASM)
    async init(capsules, clawMachine, basePos = new THREE.Vector3(0, 0, 0), baseRotY = 0) {
        await RAPIER.init();
        this.basePos.copy(basePos);
        this.baseRotY = baseRotY;

        this.world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 });

        this._createStaticGeometry();
        this._createCapsuleBodies(capsules);
        this._createFingerBodies(clawMachine);
        this._createDoorBody(clawMachine);
    }

    // Atualiza a simulação física a cada frame
    update(capsules, clawMachine) {
        this._syncFingerBodies(clawMachine);  // Atualiza posições dos dedos
        this._updateDoor(capsules, clawMachine); // Simula a mola da porta
        this.world.step();                    // Avança a simulação
        this._syncMeshes(capsules);           // Sincroniza os meshes Three.js com o Rapier
    }

    // Cria toda a geometria estática (paredes, chão, rampa, túnel)
    _createStaticGeometry() {
        const W = this.world;
        const staticBody = W.createRigidBody(RAPIER.RigidBodyDesc.fixed());
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);

        // Função auxiliar para criar um collider estático com rotação base aplicada
        const col = (desc, relPos) => {
            const pos = new THREE.Vector3(relPos.x, relPos.y, relPos.z).applyQuaternion(quat).add(this.basePos);
            return W.createCollider(
                desc.setTranslation(pos.x, pos.y, pos.z)
                    .setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })
                    .setFriction(0.3)
                    .setRestitution(0.3),
                staticBody
            );
        };

        // Base inferior da máquina
        col(RAPIER.ColliderDesc.cuboid(5.0, 0.475, 5.0), { x: -6.5, y: 0.5, z: 9.8 });

        // Paredes da base (zona opaca inferior)
        col(RAPIER.ColliderDesc.cuboid(12.0, 7.0, 0.5), { x: 0, y: 7, z: -11.5 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: 11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: -11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(7.95, 7.0, 0.5), { x: 3.55, y: 7, z: 11.5 });

        // Paredes de vidro superiores
        const wallH = 13.5, wallW = 11.45;
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: -11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: 11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: -11.45 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: 11.45 });

        // Teto da máquina
        col(RAPIER.ColliderDesc.cuboid(12.0, 1.2, 12.0), { x: 0, y: 42.2, z: 0 });

        // Chão interior com buraco de saída
        col(RAPIER.ColliderDesc.cuboid(7.85, 0.05, 11.4), { x: 3.55, y: 14.06, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(3.55, 0.05, 7.85), { x: -7.85, y: 14.06, z: -3.55 });

        // Divisores de vidro junto ao buraco
        col(RAPIER.ColliderDesc.cuboid(0.05, 5.0, 3.6), { x: -4.3, y: 19.1, z: 7.85 });
        col(RAPIER.ColliderDesc.cuboid(3.6, 5.0, 0.05), { x: -7.85, y: 19.1, z: 4.3 });

        // Rampa inclinada que encaminha as cápsulas para a porta
        const rampaRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1);
        const rampaFinalRot = quat.clone().multiply(rampaRot);
        const rampaPos = new THREE.Vector3(-7.8, 5.5, 8.0).applyQuaternion(quat).add(this.basePos);
        W.createCollider(
            RAPIER.ColliderDesc.cuboid(3.3, 0.25, 7.0)
                .setTranslation(rampaPos.x, rampaPos.y, rampaPos.z)
                .setRotation({ x: rampaFinalRot.x, y: rampaFinalRot.y, z: rampaFinalRot.z, w: rampaFinalRot.w }),
            staticBody
        );

        // Túnel de saída
        col(RAPIER.ColliderDesc.cuboid(7.95, 6.5, 2.0), { x: 3.55, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(0.25, 6.5, 2.0), { x: -11.5, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(3.75, 2.6, 2.0), { x: -7.5, y: 10.4, z: 12.8 });

        // Paredes laterais do túnel
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -11.1, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -4.5, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(3.1, 5.0, 0.2), { x: -7.8, y: 8.5, z: 4.5 });

        // Chão exterior para impedir fugas da simulação
        col(RAPIER.ColliderDesc.cuboid(40, 0.1, 40), { x: 0, y: OUTSIDE_FLOOR_Y - 0.1, z: 15 });
    }

    // Cria os corpos físicos dinâmicos para cada cápsula
    _createCapsuleBodies(capsules) {
        for (const c of capsules) {
            const p = c.mesh.position;
            const body = this.world.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(p.x, p.y, p.z)
                    .setLinearDamping(0.05)
                    .setAngularDamping(0.5)
            );
            this.world.createCollider(
                RAPIER.ColliderDesc.ball(CAPSULE_RADIUS)
                    .setRestitution(0.25)
                    .setFriction(0.5)
                    .setDensity(1.0),
                body
            );
            this._capsuleBodies.set(c, body);
        }
    }

    // Cria corpos cinemáticos para os segmentos dos dedos da garra
    _createFingerBodies(clawMachine) {
        // CORREÇÃO: Usar 'fingers' em vez de 'dedos' para corresponder ao objeto retornado por clawMachine.js
        for (const finger of clawMachine.fingers) {
            const segments = [
                { mesh: finger, h: [0.35, 1.50, 0.30], t: [0, -1.50, 1.0] },
                { mesh: finger.children[0], h: [0.35, 1.10, 0.30], t: [0, -1.10, 0.0] },
                { mesh: finger.children[0].children[0], h: [0.35, 0.65, 0.30], t: [0, -0.65, 0.0] }
            ];
            for (const seg of segments) {
                const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
                this.world.createCollider(
                    RAPIER.ColliderDesc.cuboid(seg.h[0], seg.h[1], seg.h[2])
                        .setTranslation(seg.t[0], seg.t[1], seg.t[2])
                        .setFriction(0.9).setRestitution(0.05),
                    body
                );
                this._fingerBodies.push({ body, finger: seg.mesh });
            }
        }
    }

    // Cria o corpo cinemático da porta de saída
    _createDoorBody(clawMachine) {
        // CORREÇÃO: Usar 'door' em vez de 'porta'
        if (!clawMachine.door) return;
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
        const relPos = new THREE.Vector3(-7.8, 7.8, 14.82).applyQuaternion(quat);
        this._doorBody = this.world.createRigidBody(
            RAPIER.RigidBodyDesc.kinematicPositionBased()
                .setTranslation(this.basePos.x + relPos.x, this.basePos.y + relPos.y, this.basePos.z + relPos.z)
        );
        this.world.createCollider(
            RAPIER.ColliderDesc.cuboid(3.7, 7.0, 0.2).setFriction(0.2).setRestitution(0.1),
            this._doorBody
        );
    }

    // Sincroniza as posições dos dedos da garra (Three.js → Rapier)
    _syncFingerBodies(clawMachine) {
        for (const { body, finger } of this._fingerBodies) {
            finger.updateWorldMatrix(true, false);
            finger.getWorldPosition(this._tmpV3);
            finger.getWorldQuaternion(this._tmpQ);
            body.setNextKinematicTranslation({ x: this._tmpV3.x, y: this._tmpV3.y, z: this._tmpV3.z });
            body.setNextKinematicRotation({ x: this._tmpQ.x, y: this._tmpQ.y, z: this._tmpQ.z, w: this._tmpQ.w });
        }
    }

    // Simula a porta de saída com efeito de mola: cápsulas que batem na porta empurram-na
    _updateDoor(capsules, clawMachine) {
        if (!clawMachine.door || !this._doorBody) return;
        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        const CHUTE_X_MIN = -11.1, CHUTE_X_MAX = -4.5;
        const pz = DOOR_Z;

        for (const c of capsules) {
            const body = this._capsuleBodies.get(c);
            if (!body) continue;
            const t = body.translation();
            const v = body.linvel();
            // Converte para coordenadas locais da máquina
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);
            // Se a cápsula está na zona da porta, aplica impulso angular
            if (loc.x < CHUTE_X_MAX && loc.x > CHUTE_X_MIN && loc.y < DOOR_HEIGHT &&
                loc.z > (pz - CAPSULE_RADIUS * 1.5) && loc.z < (pz + CAPSULE_RADIUS)) {
                this._doorAngVel -= Math.max(v.z, 2) * 0.15;
            }
        }

        // Aplica mola (fecha a porta) e amortecimento
        this._doorAngVel += (0 - clawMachine.door.rotation.x) * DOOR_SPRING;
        this._doorAngVel *= DOOR_DAMPING;
        clawMachine.door.rotation.x = Math.max(DOOR_MAX_OPEN, Math.min(0, clawMachine.door.rotation.x + this._doorAngVel));

        // Sincroniza o corpo Rapier com a rotação visual da porta
        const qBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
        const qLocal = new THREE.Quaternion().setFromEuler(new THREE.Euler(clawMachine.door.rotation.x, 0, 0));
        const qFinal = qBase.clone().multiply(qLocal);
        const relPos = new THREE.Vector3(-7.8, 7.8, 14.82).applyQuaternion(qBase);
        this._doorBody.setNextKinematicTranslation({ x: this.basePos.x + relPos.x, y: this.basePos.y + relPos.y, z: this.basePos.z + relPos.z });
        this._doorBody.setNextKinematicRotation({ x: qFinal.x, y: qFinal.y, z: qFinal.z, w: qFinal.w });
    }

    // Sincroniza as posições das cápsulas do Rapier para o Three.js
    _syncMeshes(capsules) {
        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        for (const c of capsules) {
            if (c.apanhada || c.aberta) continue; // Cápsulas agarradas ou abertas ignoradas
            const body = this._capsuleBodies.get(c);
            if (!body) continue;
            const t = body.translation(), r = body.rotation();
            c.mesh.position.set(t.x, t.y, t.z);
            c.mesh.quaternion.set(r.x, r.y, r.z, r.w);

            // Marca a cápsula como "saída" quando passa a porta
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);
            if (!c.saiu && loc.z >= DOOR_Z) c.saiu = true;

            // Aplica atrito extra às cápsulas que saíram (para pararem mais depressa)
            if (c.saiu) {
                const v = body.linvel(), av = body.angvel();
                body.setLinvel({ x: v.x * 0.97, y: v.y, z: v.z * 0.97 }, true);
                body.setAngvel({ x: av.x * 0.97, y: av.y * 0.97, z: av.z * 0.97 }, true);
            }
        }
    }

    // Remove o corpo Rapier de uma cápsula aberta, libertando memória do motor de física
    removeCapsuleBody(capsule) {
        const body = this._capsuleBodies.get(capsule);
        if (body && this.world) {
            this.world.removeRigidBody(body);
            this._capsuleBodies.delete(capsule);
        }
    }
}