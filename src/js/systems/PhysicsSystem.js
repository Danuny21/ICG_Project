import * as THREE from "three";
import * as RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";

// ── Constantes exportadas (usadas em main.js) ─────────────────────────────────
export const RAIO_CAPSULA     = 1.5;
export const PORTA_Z          = 11.5;   // Z mundial da porta (deve coincidir com o modelo)
export const PORTA_ALTURA     = 8.0;    // altura máxima onde a porta interage com cápsulas
export const PORTA_ABERTURA_MAX = -Math.PI / 2.2;

// Gravidade em unidades do jogo por segundo² 
// (0.15 u/frame × 3600 frames²/s² ≈ 540 → usamos valor moderado para feel arcade)
const GRAVITY       = -120;
const PORTA_SPRING  = 0.04;
const PORTA_DAMPING = 0.80;
const CHAO_EXT_Y   = 0;

// ─────────────────────────────────────────────────────────────────────────────
export class PhysicsWorld {

    constructor() {
        this.world          = null;
        this._capsulaBodies = new Map();  // capsulaEntry → RigidBody
        this._fingerBodies  = [];         // [{ body, dedoSup }]
        this._portaBody     = null;
        this._portaVelAng   = 0;

        // reutilizar objectos Three.js para evitar GC
        this._tmpV3  = new THREE.Vector3();
        this._tmpQ   = new THREE.Quaternion();
        this._tmpEul = new THREE.Euler();
    }

    // ── Inicialização assíncrona (WASM) ───────────────────────────────────────
    async init(capsulas, clawMachine) {
        await RAPIER.init();

        this.world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 });

        this._criarGeometriaEstatica();
        this._criarCapsulaBodies(capsulas);
        this._criarFingerBodies(clawMachine);
        this._criarPortaBody(clawMachine);
    }

    // ── Passo de física (chamar uma vez por frame) ────────────────────────────
    update(capsulas, clawMachine) {
        this._syncFingerBodies(clawMachine);
        this._updatePorta(capsulas, clawMachine);
        this.world.step();
        this._syncMeshes(capsulas);
    }

    // ── API pública para main.js ──────────────────────────────────────────────

    /** Congela uma cápsula para ser transportada pela garra (cinemático) */
    freezeBody(c) {
        const body = this._capsulaBodies.get(c);
        if (!body) return;
        body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    }

    /** Teleporta o corpo congelado para a posição desejada */
    setBodyPosition(c, x, y, z) {
        const body = this._capsulaBodies.get(c);
        if (!body) return;
        body.setNextKinematicTranslation({ x, y, z });
    }

    /** Devolve a cápsula à simulação dinâmica */
    unfreezeBody(c) {
        const body = this._capsulaBodies.get(c);
        if (!body) return;
        body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    // ── Geometria estática ────────────────────────────────────────────────────
    _criarGeometriaEstatica() {
        const W = this.world;

        // Um único body fixed para toda a geometria estática
        const staticBody = W.createRigidBody(RAPIER.RigidBodyDesc.fixed());

        const col = (desc) => W.createCollider(desc.setFriction(0.3).setRestitution(0.3), staticBody);

        // 1. Base Oca inferior
        col(RAPIER.ColliderDesc.cuboid(5.0, 0.475, 5.0).setTranslation(-6.5, 0.5, 9.8));
        
        // 2. Paredes da Base
        col(RAPIER.ColliderDesc.cuboid(12.0, 7.0, 0.5).setTranslation(0, 7, -11.5));     
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0).setTranslation(11.5, 7, 0));      
        col(RAPIER.ColliderDesc.cuboid(0.5, 7.0, 12.0).setTranslation(-11.5, 7, 0));     
        col(RAPIER.ColliderDesc.cuboid(7.95, 7.0, 0.5).setTranslation(3.55, 7, 11.5));   

        // 3. Vidros Superiores (e Postes)
        const wallH = 13.5;
        const wallW = 11.45;
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW).setTranslation(-11.45, 27.5, 0));     
        col(RAPIER.ColliderDesc.cuboid(0.05, wallH, wallW).setTranslation(11.45, 27.5, 0));      
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05).setTranslation(0, 27.5, -11.45));     
        col(RAPIER.ColliderDesc.cuboid(wallW, wallH, 0.05).setTranslation(0, 27.5, 11.45));      

        // Teto
        col(RAPIER.ColliderDesc.cuboid(12.0, 1.2, 12.0).setTranslation(0, 42.2, 0));             // teto

        // 4. Chão interior (Buraco)
        col(RAPIER.ColliderDesc.cuboid(7.85, 0.05, 11.4).setTranslation(3.55, 14.06, 0));        // chaoDir
        col(RAPIER.ColliderDesc.cuboid(3.55, 0.05, 7.85).setTranslation(-7.85, 14.06, -3.55));   // chaoEsq

        // 5. Divisores internos de vidro do buraco
        col(RAPIER.ColliderDesc.cuboid(0.05, 5.0, 3.6).setTranslation(-4.3, 19.1, 7.85));        // divDir
        col(RAPIER.ColliderDesc.cuboid(3.6, 5.0, 0.05).setTranslation(-7.85, 19.1, 4.3));        // divTras

        // 6. Rampa de Deslize
        // Rampa: rotation.x = 1 radian.
        col(RAPIER.ColliderDesc.cuboid(3.3, 0.25, 7.0)
            .setTranslation(-7.8, 5.5, 8.0)
            .setRotation({ x: Math.sin(1/2), y: 0, z: 0, w: Math.cos(1/2) }));                   // rampa

        // 7. Túnel
        // Superfícies frontais do painel da porta
        col(RAPIER.ColliderDesc.cuboid(7.95, 6.5, 2.0).setTranslation(3.55, 6.5, 12.8));         // supDir
        col(RAPIER.ColliderDesc.cuboid(0.25, 6.5, 2.0).setTranslation(-11.5, 6.5, 12.8));        // supEsq
        col(RAPIER.ColliderDesc.cuboid(3.75, 2.6, 2.0).setTranslation(-7.5, 10.4, 12.8));        // supTopo

        // Paredes laterais interiores do túnel
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5).setTranslation(-11.1, 8.5, 9.5));          // lateral esquerda do túnel
        col(RAPIER.ColliderDesc.cuboid(0.2, 5.0, 5.5).setTranslation(-4.5, 8.5, 9.5));           // lateral direita do túnel
        col(RAPIER.ColliderDesc.cuboid(3.1, 5.0, 0.2).setTranslation(-7.8, 8.5, 4.5));           // traseira do túnel

        // 8. Chão exterior p/ evitar fugas da simulação
        col(RAPIER.ColliderDesc.cuboid(40, 0.1, 40).setTranslation(0, CHAO_EXT_Y - 0.1, 15).setFriction(0.6));
    }

    // ── Corpos das cápsulas ───────────────────────────────────────────────────
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

    // ── Corpos cinemáticos dos dedos ──────────────────────────────────────────
    _criarFingerBodies(clawMachine) {
        for (const dedo of clawMachine.dedos) {
            const seg1 = dedo;
            const seg2 = dedo.children[0];
            const seg3 = seg2.children[0];

            const segments = [
                { mesh: seg1, h: [0.25, 1.50, 0.20], t: [0, -1.50, 1.0] },
                { mesh: seg2, h: [0.25, 1.10, 0.20], t: [0, -1.10, 0.0] },
                { mesh: seg3, h: [0.25, 0.65, 0.20], t: [0, -0.65, 0.0] }
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

    // ── Corpo cinemático da porta ─────────────────────────────────────────────
    _criarPortaBody(clawMachine) {
        if (!clawMachine.porta) return;

        this._portaBody = this.world.createRigidBody(
            RAPIER.RigidBodyDesc.kinematicPositionBased()
                .setTranslation(-7.8, 7.8, 14.82)
        );

        this.world.createCollider(
            RAPIER.ColliderDesc.cuboid(3.4, 3.4, 0.05)
                .setTranslation(0, -3.4, 0)
                .setSensor(true), // Sensor: deteta colisões sem exercer força física
            this._portaBody
        );
    }

    // ── Sync dos dedos cinemáticos → Rapier ───────────────────────────────────
    _syncFingerBodies(clawMachine) {
        for (const { body, dedo } of this._fingerBodies) {
            // Forçar atualização das matrizes mundo antes de as ler
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

    // ── Física da porta e sincronização visual ────────────────────────────────
    _updatePorta(capsulas, clawMachine) {
        if (!clawMachine.porta || !this._portaBody) return;

        const CHUTE_X_MIN = -11.1, CHUTE_X_MAX = -4.5;

        // Cápsulas que tocam na porta empurram-na para abrir
        for (const c of capsulas) {
            if (c.apanhada) continue;
            const body = this._capsulaBodies.get(c);
            if (!body) continue;

            const t = body.translation();
            const v = body.linvel();

            const xNoCorreder = t.x < CHUTE_X_MAX && t.x > CHUTE_X_MIN;
            const tocarNaPorta = xNoCorreder &&
                                 t.y < PORTA_ALTURA &&
                                 t.z > (PORTA_Z - RAIO_CAPSULA * 1.5) &&
                                 t.z < (PORTA_Z + RAIO_CAPSULA);

            if (tocarNaPorta) {
                // Agita visualmente a porta
                const forcaBater = Math.max(v.z, 6); 
                this._portaVelAng -= forcaBater * 0.035;
            }
        }

        // Mola: puxa a porta para posição fechada (rotation.x = 0)
        this._portaVelAng += (0 - clawMachine.porta.rotation.x) * PORTA_SPRING;
        this._portaVelAng *= PORTA_DAMPING;
        clawMachine.porta.rotation.x += this._portaVelAng;
        clawMachine.porta.rotation.x = Math.max(
            PORTA_ABERTURA_MAX,
            Math.min(0, clawMachine.porta.rotation.x)
        );

        // Sync quaternion da porta para o body cinemático
        this._tmpQ.setFromEuler(
            this._tmpEul.set(clawMachine.porta.rotation.x, 0, 0)
        );
        this._portaBody.setNextKinematicTranslation({ x: -7.8, y: 7.8, z: 14.82 });
        this._portaBody.setNextKinematicRotation({
            x: this._tmpQ.x, y: this._tmpQ.y,
            z: this._tmpQ.z, w: this._tmpQ.w
        });
    }

    // ── Sync Rapier → meshes Three.js ─────────────────────────────────────────
    _syncMeshes(capsulas) {
        for (const c of capsulas) {
            if (c.apanhada) continue;

            const body = this._capsulaBodies.get(c);
            if (!body) continue;

            const t = body.translation();
            const r = body.rotation();

            c.mesh.position.set(t.x, t.y, t.z);
            c.mesh.quaternion.set(r.x, r.y, r.z, r.w);

            // Marcar cápsulas que saíram pela porta
            if (!c.saiu && t.z >= PORTA_Z) {
                c.saiu = true;
            }

            // Desaceleração da cápsula fora da máquina
            if (c.saiu) {
                const v = body.linvel();
                const av = body.angvel();
                // Reduz atrito horizontal da velocidade na saída da cápsula
                body.setLinvel({ x: v.x * 0.97, y: v.y, z: v.z * 0.97 }, true);
                
                // Reduz velocidade de rotação
                body.setAngvel({ x: av.x * 0.97, y: av.y * 0.97, z: av.z * 0.97 }, true);
            }
        }
    }
}