import * as THREE from "three";
import * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";

// Constantes
export const RAIO_CAPSULA = 1.5;
export const PORTA_Z = 11.5;
export const PORTA_ALTURA = 8.0;
export const PORTA_ABERTURA_MAX = -Math.PI / 2.2;

// Gravidade e parâmetros de grasp
const GRAVITY = -120;
const PORTA_SPRING = 0.04;
const PORTA_DAMPING = 0.80;
const CHAO_EXT_Y = 0;

export class PhysicsWorld {

    constructor() {
        this.world = null;
        this._capsulaBodies = new Map();
        this._fingerBodies = [];
        this._portaBody = null;
        this._portaVelAng = 0;
        this._graspedCapsules = new Map();
        this.basePos = new THREE.Vector3(0, 0, 0);
        this.baseRotY = 0;

        this._tmpV3 = new THREE.Vector3();
        this._tmpQ = new THREE.Quaternion();
        this._tmpEul = new THREE.Euler();
    }

    // Inicialização assíncrona (WASM)
    async init(capsulas, clawMachine, basePos = new THREE.Vector3(0, 0, 0), baseRotY = 0) {
        await RAPIER.init();
        this.basePos.copy(basePos);
        this.baseRotY = baseRotY;

        this.world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 });

        this._criarGeometriaEstatica();
        this._criarCapsulaBodies(capsulas);
        this._criarFingerBodies(clawMachine);
        this._criarPortaBody(clawMachine);
    }

    // Passo de física (chamar uma vez por frame)
    update(capsulas, clawMachine) {
        this._syncFingerBodies(clawMachine);
        this._updatePorta(capsulas, clawMachine);
        this.world.step();
        this._syncMeshes(capsulas);
    }

    // Geometria estática
    _criarGeometriaEstatica() {
        const W = this.world;

        // Um único body fixed para toda a geometria estática
        const staticBody = W.createRigidBody(RAPIER.RigidBodyDesc.fixed());
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);

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

        // Base Oca inferior
        col(RAPIER.ColliderDesc.cuboid(5.0, 0.475, 5.0), { x: -6.5, y: 0.5, z: 9.8 });

        // Paredes da Base
        col(RAPIER.ColliderDesc.cuboid(12.0, 7.0, 0.5), { x: 0, y: 7, z: -11.5 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: 11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: -11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(7.95, 7.0, 0.5), { x: 3.55, y: 7, z: 11.5 });

        // Vidros Superiores
        const wallH = 13.5;
        const wallW = 11.45;
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: -11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: 11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: -11.45 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: 11.45 });

        // Teto
        col(RAPIER.ColliderDesc.cuboid(12.0, 1.2, 12.0), { x: 0, y: 42.2, z: 0 });

        // Chão interior (Buraco)
        col(RAPIER.ColliderDesc.cuboid(7.85, 0.05, 11.4), { x: 3.55, y: 14.06, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(3.55, 0.05, 7.85), { x: -7.85, y: 14.06, z: -3.55 });

        // Divisores internos de vidro do buraco
        col(RAPIER.ColliderDesc.cuboid(0.05, 5.0, 3.6), { x: -4.3, y: 19.1, z: 7.85 });
        col(RAPIER.ColliderDesc.cuboid(3.6, 5.0, 0.05), { x: -7.85, y: 19.1, z: 4.3 });

        // Rampa de Deslize
        const rampaRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1);
        const rampaFinalRot = quat.clone().multiply(rampaRot);
        const rampaPos = new THREE.Vector3(-7.8, 5.5, 8.0).applyQuaternion(quat).add(this.basePos);
        W.createCollider(
            RAPIER.ColliderDesc.cuboid(3.3, 0.25, 7.0)
                .setTranslation(rampaPos.x, rampaPos.y, rampaPos.z)
                .setRotation({ x: rampaFinalRot.x, y: rampaFinalRot.y, z: rampaFinalRot.z, w: rampaFinalRot.w }),
            staticBody
        );

        // Túnel
        col(RAPIER.ColliderDesc.cuboid(7.95, 6.5, 2.0), { x: 3.55, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(0.25, 6.5, 2.0), { x: -11.5, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(3.75, 2.6, 2.0), { x: -7.5, y: 10.4, z: 12.8 });

        // Paredes laterais interiores do túnel
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -11.1, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -4.5, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(3.1, 5.0, 0.2), { x: -7.8, y: 8.5, z: 4.5 });

        // 8. Chão exterior p/ evitar fugas da simulação
        col(RAPIER.ColliderDesc.cuboid(40, 0.1, 40), { x: 0, y: CHAO_EXT_Y - 0.1, z: 15 });
    }

    // Corpos das cápsulas
    _criarCapsulaBodies(capsulas) {
        for (const c of capsulas) {
            const p = c.mesh.position;

            const body = this.world.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(p.x, p.y, p.z)
                    .setLinearDamping(0.05)
                    .setAngularDamping(0.5)
            );

            this.world.createCollider(
                RAPIER.ColliderDesc.ball(RAIO_CAPSULA)
                    .setRestitution(0.25)
                    .setFriction(0.5)
                    .setDensity(1.0),
                body
            );

            this._capsulaBodies.set(c, body);
        }
    }

    // Corpos cinemáticos dos dedos
    _criarFingerBodies(clawMachine) {
        for (const dedo of clawMachine.dedos) {
            const seg1 = dedo;
            const seg2 = dedo.children[0];
            const seg3 = seg2.children[0];

            const segments = [
                { mesh: seg1, h: [0.35, 1.50, 0.30], t: [0, -1.50, 1.0] },
                { mesh: seg2, h: [0.35, 1.10, 0.30], t: [0, -1.10, 0.0] },
                { mesh: seg3, h: [0.35, 0.65, 0.30], t: [0, -0.65, 0.0] }
            ];

            for (const seg of segments) {
                const body = this.world.createRigidBody(
                    RAPIER.RigidBodyDesc.kinematicPositionBased()
                        .setTranslation(0, 0, 0)
                );

                this.world.createCollider(
                    RAPIER.ColliderDesc.cuboid(seg.h[0], seg.h[1], seg.h[2])
                        .setTranslation(seg.t[0], seg.t[1], seg.t[2])
                        .setFriction(0.9)
                        .setRestitution(0.05),
                    body
                );

                this._fingerBodies.push({ body, dedo: seg.mesh });
            }
        }
    }

    // Corpo cinemático da porta
    _criarPortaBody(clawMachine) {
        if (!clawMachine.porta) return;

        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
        const relPos = new THREE.Vector3(-7.8, 7.8, 14.82).applyQuaternion(quat);

        this._portaBody = this.world.createRigidBody(
            RAPIER.RigidBodyDesc.kinematicPositionBased()
                .setTranslation(this.basePos.x + relPos.x, this.basePos.y + relPos.y, this.basePos.z + relPos.z)
        );

        this.world.createCollider(
            RAPIER.ColliderDesc.cuboid(3.7, 7.0, 0.2)
                .setFriction(0.2)
                .setRestitution(0.1),
            this._portaBody
        );
    }

    // Sync dos dedos cinemáticos → Rapier
    _syncFingerBodies(clawMachine) {
        for (const { body, dedo } of this._fingerBodies) {
            dedo.updateWorldMatrix(true, false);

            dedo.getWorldPosition(this._tmpV3);
            dedo.getWorldQuaternion(this._tmpQ);

            body.setNextKinematicTranslation({
                x: this._tmpV3.x,
                y: this._tmpV3.y,
                z: this._tmpV3.z
            });
            body.setNextKinematicRotation({
                x: this._tmpQ.x,
                y: this._tmpQ.y,
                z: this._tmpQ.z,
                w: this._tmpQ.w
            });
        }
    }

    // Sync dos dedos cinemáticos → Rapier
    _updatePorta(capsulas, clawMachine) {
        if (!clawMachine.porta || !this._portaBody) return;

        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        const CHUTE_X_MIN = -11.1, CHUTE_X_MAX = -4.5;
        const pz = PORTA_Z;

        // Cápsulas que tocam na porta empurram-na para abrir
        for (const c of capsulas) {
            const body = this._capsulaBodies.get(c);
            if (!body) continue;

            const t = body.translation();
            const v = body.linvel();

            // Transforma world pos em local pos da máquina
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);

            const xNoCorreder = loc.x < CHUTE_X_MAX && loc.x > CHUTE_X_MIN;
            const tocarNaPorta = xNoCorreder &&
                loc.y < PORTA_ALTURA &&
                loc.z > (pz - RAIO_CAPSULA * 1.5) &&
                loc.z < (pz + RAIO_CAPSULA);

            if (tocarNaPorta) {
                const forcaBater = Math.max(v.z, 6);
                this._portaVelAng -= forcaBater * 0.035;
            }
        }

        // Mola: puxa a porta para posição fechada
        this._portaVelAng += (0 - clawMachine.porta.rotation.x) * PORTA_SPRING;
        this._portaVelAng *= PORTA_DAMPING;
        clawMachine.porta.rotation.x += this._portaVelAng;
        clawMachine.porta.rotation.x = Math.max(
            PORTA_ABERTURA_MAX,
            Math.min(0, clawMachine.porta.rotation.x)
        );

        // Sync quaternion da porta para o body cinemático
        const quatPortaBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
        const quatPortaLocal = new THREE.Quaternion().setFromEuler(new THREE.Euler(clawMachine.porta.rotation.x, 0, 0));
        const quatPortaFinal = quatPortaBase.clone().multiply(quatPortaLocal);

        const relPos = new THREE.Vector3(-7.8, 7.8, 14.82).applyQuaternion(quatPortaBase);

        this._portaBody.setNextKinematicTranslation({
            x: this.basePos.x + relPos.x,
            y: this.basePos.y + relPos.y,
            z: this.basePos.z + relPos.z
        });
        this._portaBody.setNextKinematicRotation({
            x: quatPortaFinal.x, y: quatPortaFinal.y,
            z: quatPortaFinal.z, w: quatPortaFinal.w
        });
    }

    // ── Sync Rapier → meshes Three.js ─────────────────────────────────────────
    _syncMeshes(capsulas) {
        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        for (const c of capsulas) {
            if (c.apanhada) continue; // Ignora as cápsulas que estão a ser abertas

            const body = this._capsulaBodies.get(c);
            if (!body) continue;

            const t = body.translation();
            const r = body.rotation();

            c.mesh.position.set(t.x, t.y, t.z);
            c.mesh.quaternion.set(r.x, r.y, r.z, r.w);

            // Marcar cápsulas que saíram pela porta (checar em local coord)
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);
            if (!c.saiu && loc.z >= PORTA_Z) {
                c.saiu = true;
            }

            // Desaceleração da cápsula fora da máquina
            if (c.saiu) {
                const v = body.linvel();
                const av = body.angvel();
                body.setLinvel({ x: v.x * 0.97, y: v.y, z: v.z * 0.97 }, true);
                body.setAngvel({ x: av.x * 0.97, y: av.y * 0.97, z: av.z * 0.97 }, true);
            }
        }
    }
}