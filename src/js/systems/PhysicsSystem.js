import * as THREE from "three";
import * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";

export const CAPSULE_RADIUS = 1.5;
export const DOOR_Z = 14.82; 
export const DOOR_HEIGHT = 8.0;
export const DOOR_MAX_OPEN = -Math.PI / 2.2;

const GRAVITY = -120;
const DOOR_SPRING = 0.015; 
const DOOR_DAMPING = 0.95;  
const OUTSIDE_FLOOR_Y = 0;

export class PhysicsWorld {

    constructor() {
        this.world = null;
        this._capsuleBodies = new Map();
        this._fingerBodies = [];
        this._doorBody = null;
        this._doorAngVel = 0;
        this._graspedCapsules = new Map();
        this.basePos = new THREE.Vector3(0, 0, 0);
        this.baseRotY = 0;

        this._tmpV3 = new THREE.Vector3();
        this._tmpQ = new THREE.Quaternion();
        this._tmpEul = new THREE.Euler();
    }

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

    update(capsules, clawMachine) {
        this._syncFingerBodies(clawMachine);
        this._updateDoor(capsules, clawMachine);
        this.world.step();
        this._syncMeshes(capsules);
    }

    _createStaticGeometry() {
        const W = this.world;
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

        col(RAPIER.ColliderDesc.cuboid(5.0, 0.475, 5.0), { x: -6.5, y: 0.5, z: 9.8 });
        col(RAPIER.ColliderDesc.cuboid(12.0, 7.0, 0.5), { x: 0, y: 7, z: -11.5 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: 11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0), { x: -11.5, y: 7, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(7.95, 7.0, 0.5), { x: 3.55, y: 7, z: 11.5 });

        const wallH = 13.5, wallW = 11.45;
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: -11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW), { x: 11.45, y: 27.5, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: -11.45 });
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05), { x: 0, y: 27.5, z: 11.45 });

        col(RAPIER.ColliderDesc.cuboid(12.0, 1.2, 12.0), { x: 0, y: 42.2, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(7.85, 0.05, 11.4), { x: 3.55, y: 14.06, z: 0 });
        col(RAPIER.ColliderDesc.cuboid(3.55, 0.05, 7.85), { x: -7.85, y: 14.06, z: -3.55 });

        col(RAPIER.ColliderDesc.cuboid(0.05, 5.0, 3.6), { x: -4.3, y: 19.1, z: 7.85 });
        col(RAPIER.ColliderDesc.cuboid(3.6, 5.0, 0.05), { x: -7.85, y: 19.1, z: 4.3 });

        const rampaRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1);
        const rampaFinalRot = quat.clone().multiply(rampaRot);
        const rampaPos = new THREE.Vector3(-7.8, 5.5, 8.0).applyQuaternion(quat).add(this.basePos);
        W.createCollider(
            RAPIER.ColliderDesc.cuboid(3.3, 0.25, 7.0)
                .setTranslation(rampaPos.x, rampaPos.y, rampaPos.z)
                .setRotation({ x: rampaFinalRot.x, y: rampaFinalRot.y, z: rampaFinalRot.z, w: rampaFinalRot.w }),
            staticBody
        );

        col(RAPIER.ColliderDesc.cuboid(7.95, 6.5, 2.0), { x: 3.55, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(0.25, 6.5, 2.0), { x: -11.5, y: 6.5, z: 12.8 });
        col(RAPIER.ColliderDesc.cuboid(3.75, 2.6, 2.0), { x: -7.5, y: 10.4, z: 12.8 });

        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -11.1, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5), { x: -4.5, y: 8.5, z: 9.5 });
        col(RAPIER.ColliderDesc.cuboid(3.1, 5.0, 0.2), { x: -7.8, y: 8.5, z: 4.5 });

        col(RAPIER.ColliderDesc.cuboid(40, 0.1, 40), { x: 0, y: OUTSIDE_FLOOR_Y - 0.1, z: 15 });
    }

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

    _createFingerBodies(clawMachine) {
        for (const dedo of clawMachine.dedos) {
            const segments = [
                { mesh: dedo, h: [0.35, 1.50, 0.30], t: [0, -1.50, 1.0] },
                { mesh: dedo.children[0], h: [0.35, 1.10, 0.30], t: [0, -1.10, 0.0] },
                { mesh: dedo.children[0].children[0], h: [0.35, 0.65, 0.30], t: [0, -0.65, 0.0] }
            ];
            for (const seg of segments) {
                const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
                this.world.createCollider(
                    RAPIER.ColliderDesc.cuboid(seg.h[0], seg.h[1], seg.h[2])
                        .setTranslation(seg.t[0], seg.t[1], seg.t[2])
                        .setFriction(0.9).setRestitution(0.05),
                    body
                );
                this._fingerBodies.push({ body, dedo: seg.mesh });
            }
        }
    }

    _createDoorBody(clawMachine) {
        if (!clawMachine.porta) return;
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

    _syncFingerBodies(clawMachine) {
        for (const { body, dedo } of this._fingerBodies) {
            dedo.updateWorldMatrix(true, false);
            dedo.getWorldPosition(this._tmpV3);
            dedo.getWorldQuaternion(this._tmpQ);
            body.setNextKinematicTranslation({ x: this._tmpV3.x, y: this._tmpV3.y, z: this._tmpV3.z });
            body.setNextKinematicRotation({ x: this._tmpQ.x, y: this._tmpQ.y, z: this._tmpQ.z, w: this._tmpQ.w });
        }
    }

    _updateDoor(capsules, clawMachine) {
        if (!clawMachine.porta || !this._doorBody) return;
        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        const CHUTE_X_MIN = -11.1, CHUTE_X_MAX = -4.5;
        const pz = DOOR_Z;

        for (const c of capsules) {
            const body = this._capsuleBodies.get(c);
            if (!body) continue;
            const t = body.translation();
            const v = body.linvel();
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);
            if (loc.x < CHUTE_X_MAX && loc.x > CHUTE_X_MIN && loc.y < DOOR_HEIGHT && 
                loc.z > (pz - CAPSULE_RADIUS * 1.5) && loc.z < (pz + CAPSULE_RADIUS)) {
                this._doorAngVel -= Math.max(v.z, 2) * 0.15; 
            }
        }
        this._doorAngVel += (0 - clawMachine.porta.rotation.x) * DOOR_SPRING;
        this._doorAngVel *= DOOR_DAMPING;
        clawMachine.porta.rotation.x = Math.max(DOOR_MAX_OPEN, Math.min(0, clawMachine.porta.rotation.x + this._doorAngVel));

        const qBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.baseRotY);
        const qLocal = new THREE.Quaternion().setFromEuler(new THREE.Euler(clawMachine.porta.rotation.x, 0, 0));
        const qFinal = qBase.clone().multiply(qLocal);
        const relPos = new THREE.Vector3(-7.8, 7.8, 14.82).applyQuaternion(qBase);
        this._doorBody.setNextKinematicTranslation({ x: this.basePos.x + relPos.x, y: this.basePos.y + relPos.y, z: this.basePos.z + relPos.z });
        this._doorBody.setNextKinematicRotation({ x: qFinal.x, y: qFinal.y, z: qFinal.z, w: qFinal.w });
    }

    _syncMeshes(capsules) {
        const invQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.baseRotY);
        for (const c of capsules) {
            if (c.apanhada) continue;
            const body = this._capsuleBodies.get(c);
            if (!body) continue;
            const t = body.translation(), r = body.rotation();
            c.mesh.position.set(t.x, t.y, t.z);
            c.mesh.quaternion.set(r.x, r.y, r.z, r.w);
            const loc = new THREE.Vector3(t.x, t.y, t.z).sub(this.basePos).applyQuaternion(invQuat);
            if (!c.saiu && loc.z >= DOOR_Z) c.saiu = true;
            if (c.saiu) {
                const v = body.linvel(), av = body.angvel();
                body.setLinvel({ x: v.x * 0.97, y: v.y, z: v.z * 0.97 }, true);
                body.setAngvel({ x: av.x * 0.97, y: av.y * 0.97, z: av.z * 0.97 }, true);
            }
        }
    }
}