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

        const col = (desc) => W.createCollider(desc, staticBody);

        // Chão interior  (y = 14.06)
        col(RAPIER.ColliderDesc.cuboid(11.9, 0.05, 11.9)
            .setTranslation(0, 14.06, 0)
            .setFriction(0.6).setRestitution(0.3));

        // Parede esquerda
        col(RAPIER.ColliderDesc.cuboid(0.05, 13.5, 11)
            .setTranslation(-11.45, 27.5, 0)
            .setFriction(0.3).setRestitution(0.4));

        // Parede direita
        col(RAPIER.ColliderDesc.cuboid(0.05, 13.5, 11)
            .setTranslation(11.45, 27.5, 0)
            .setFriction(0.3).setRestitution(0.4));

        // Parede traseira
        col(RAPIER.ColliderDesc.cuboid(11, 13.5, 0.05)
            .setTranslation(0, 27.5, -11.45)
            .setFriction(0.3).setRestitution(0.4));

        // Parede frontal — excluindo o corredor do buraco (x: -11.1 a -4.5)
        // Parte direita: x de -4.5 a +11.45  → centro = 3.475, metade = 7.975
        col(RAPIER.ColliderDesc.cuboid(7.975, 13.5, 0.05)
            .setTranslation(3.475, 27.5, 11.45)
            .setFriction(0.3).setRestitution(0.4));

        // ── Divisores internos de vidro (colisão) ───────────────────────────
        // divDir: parede paralela ao eixo Z, à direita do buraco
        col(RAPIER.ColliderDesc.cuboid(0.05, 5, 3.6)
            .setTranslation(-4.3, 19.1, 7.85)
            .setFriction(0.3).setRestitution(0.4));

        // divTras: parede paralela ao eixo X, atrás do buraco
        col(RAPIER.ColliderDesc.cuboid(3.6, 5, 0.05)
            .setTranslation(-7.85, 19.1, 4.3)
            .setFriction(0.3).setRestitution(0.4));

        // ── Rampa do buraco de saída ──────────────────────────────────────────
        //  De: z=4.5,  y=13.0   (início do buraco, ao nível do chão interior)
        //  Para: z=15.0, y=0    (exterior)
        //
        //  A rampa desce em Z ao aumentar o Z, pelo que o ângulo de rotação em X
        //  é positivo (ponta +Z vai para baixo).
        //
        const RAMP_Z0 = 4.5, RAMP_Z1 = 15.0;
        const RAMP_Y0 = 13.0, RAMP_Y1 = CHAO_EXT_Y;
        const deltaZ  = RAMP_Z1 - RAMP_Z0;                   // 10.5
        const deltaY  = RAMP_Y0 - RAMP_Y1;                   // 13.0  (queda)
        const rampLen = Math.sqrt(deltaZ * deltaZ + deltaY * deltaY); // ≈ 16.71
        const angle   = Math.atan2(deltaY, deltaZ);           // ≈ 0.892 rad

        // Quaternion: rotação em torno do eixo X por +angle
        const qx = Math.sin(angle / 2);
        const qw = Math.cos(angle / 2);

        col(RAPIER.ColliderDesc.cuboid(3.3, 0.15, rampLen / 2)
            .setTranslation(-7.8, (RAMP_Y0 + RAMP_Y1) / 2, (RAMP_Z0 + RAMP_Z1) / 2)
            .setRotation({ x: qx, y: 0, z: 0, w: qw })
            .setFriction(0.35).setRestitution(0.2));

        // Paredes laterais do corredor do buraco
        col(RAPIER.ColliderDesc.cuboid(0.05, 5, 5.25)
            .setTranslation(-11.1, 9, 9.75));
        col(RAPIER.ColliderDesc.cuboid(0.05, 5, 5.25)
            .setTranslation(-4.5, 9, 9.75));

        // Chão exterior (plano invisível para cápsulas não caírem)
        col(RAPIER.ColliderDesc.cuboid(40, 0.1, 40)
            .setTranslation(0, CHAO_EXT_Y - 0.1, 15)
            .setFriction(0.6).setRestitution(0.2));
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
    //
    //  Cada dedo é representado por um cuboide cujas dimensões e offset local
    //  correspondem exactamente à BoxGeometry do dedoSup:
    //    BoxGeometry(0.6, 2.4, 0.84) com geometry.translate(0, -1.2, 0.48)
    //  → half-extents (0.3, 1.2, 0.42), offset local (0, -1.2, 0.48)
    //
    //  Cada frame, posicionamos o body na world-position do dedoSup mesh
    //  (que representa o pivot/origem do segmento superior do dedo).
    //  O Rapier aplica o offset local do colider automaticamente no espaço do body.
    //
    _criarFingerBodies(clawMachine) {
        for (const dedo of clawMachine.dedos) {
            const body = this.world.createRigidBody(
                RAPIER.RigidBodyDesc.kinematicPositionBased()
                    .setTranslation(0, 0, 0)
            );

            this.world.createCollider(
                RAPIER.ColliderDesc.cuboid(0.3, 1.2, 0.42)
                    .setTranslation(0, -1.2, 0.48)   // mesmo offset da geo
                    .setFriction(0.9)
                    .setRestitution(0.05),
                body
            );

            this._fingerBodies.push({ body, dedo });
        }
    }

    // ── Corpo cinemático da porta ─────────────────────────────────────────────
    //
    //  O pivot da porta está em (-7.8, 7.8, 14.82).
    //  A geometria é BoxGeometry(6.8, 6.8, 0.1) com translate(0, -3.4, 0),
    //  portanto o offset local do colider é (0, -3.4, 0).
    //  Quando a porta roda em X, o colider gira em torno do pivot correctamente.
    //
    _criarPortaBody(clawMachine) {
        if (!clawMachine.porta) return;

        this._portaBody = this.world.createRigidBody(
            RAPIER.RigidBodyDesc.kinematicPositionBased()
                .setTranslation(-7.8, 7.8, 14.82)
        );

        this.world.createCollider(
            RAPIER.ColliderDesc.cuboid(3.4, 3.4, 0.05)
                .setTranslation(0, -3.4, 0)
                .setFriction(0.3)
                .setRestitution(0.25),
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

    // ── Física da porta (mola JS) + sync Rapier ───────────────────────────────
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
                                 t.z > (PORTA_Z - RAIO_CAPSULA) &&
                                 t.z < (PORTA_Z + RAIO_CAPSULA);

            if (tocarNaPorta) {
                // Transferir momento Z da cápsula para a porta
                this._portaVelAng -= v.z * 0.008;

                // Resistência: se a porta ainda está muito fechada, bloquear a cápsula
                const abertura = Math.abs(clawMachine.porta.rotation.x) / Math.abs(PORTA_ABERTURA_MAX);
                if (abertura < 0.35) {
                    body.setLinvel({ x: v.x, y: v.y, z: Math.min(v.z, 0) }, true);
                }
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
            if (!c.saiu && t.z >= PORTA_Z) c.saiu = true;
        }
    }
}