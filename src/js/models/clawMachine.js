import * as THREE from 'three';
import { THEME } from '../config/theme.js';
import { loadTextureSet } from "../systems/TextureLoader.js";

// Cria o modelo detalhado da máquina de garras, incluindo a estrutura, vidros, mecanismos e controlos.
export function createClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    // Materiais
    const materials = {
        structure: new THREE.MeshStandardMaterial({
            color: THEME.STRUCTURE,
            roughness: 0.4,
            metalness: 0.3
        }),
        glass: new THREE.MeshPhongMaterial({ color: THEME.GLASS, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
        floor: new THREE.MeshPhongMaterial({
            color: THEME.FLOOR,
            flatShading: true
        }),
        metal: new THREE.MeshPhongMaterial({ color: THEME.METAL }),             // Joystick shaft and cable
        mechanism: new THREE.MeshPhongMaterial({ color: THEME.MECHANISM }),     // Claw fingers base
        finger: new THREE.MeshPhongMaterial({ color: THEME.CLAW_FINGER, flatShading: true, shininess: 60 }),
        frame: new THREE.MeshPhongMaterial({ color: THEME.FRAME }),
        joyBase: new THREE.MeshPhongMaterial({ color: THEME.JOY_BASE }),
        joyBall: new THREE.MeshPhongMaterial({ color: THEME.JOY_BALL, shininess: 100 }),
        btnBase: new THREE.MeshPhongMaterial({ color: THEME.BTN_BASE }),
        btn: new THREE.MeshPhongMaterial({ color: THEME.BTN_MAIN, shininess: 80 }),
        door: new THREE.MeshPhongMaterial({ color: THEME.DOOR, transparent: true, opacity: 0.5, shininess: 90, side: THREE.DoubleSide })
    };

    const { structure: structureMat, glass: glassMat, floor: floorMat, metal: metalMat, mechanism: mechanismMat, finger: fingerMat, frame: frameMat } = materials;

    // ── Base Oca ─────────────────────────────────────────────────────────────────
    const thickness = 1;

    // Door floor
    const baseBottom = new THREE.Mesh(new THREE.BoxGeometry(10, 0.95, 10), structureMat);
    baseBottom.position.set(-6.5, 0.5, 9.8);
    group.add(baseBottom);

    // Base back wall
    const baseBack = new THREE.Mesh(new THREE.BoxGeometry(24, 14, thickness), structureMat);
    baseBack.position.set(0, 7, -11.5);
    group.add(baseBack);

    // Base right wall
    const baseRight = new THREE.Mesh(new THREE.BoxGeometry(thickness, 14, 24), structureMat);
    baseRight.position.set(11.5, 7, 0);
    group.add(baseRight);

    // Base left wall
    const baseLeft = new THREE.Mesh(new THREE.BoxGeometry(thickness, 14, 24), structureMat);
    baseLeft.position.set(-11.5, 7, 0);
    group.add(baseLeft);

    // Base front-right wall
    const baseFrontRight = new THREE.Mesh(new THREE.BoxGeometry(15.9, 14, thickness), structureMat);
    baseFrontRight.position.set(3.55, 7, 11.5);
    group.add(baseFrontRight);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(24, 2.4, 24), structureMat);
    roof.position.y = 42.2;
    roof.castShadow = true;
    group.add(roof);

    // Columns/Posts
    const postGeo = new THREE.BoxGeometry(1, 27, 1);
    [[11.5, 11.5], [-11.5, 11.5], [11.5, -11.5], [-11.5, -11.5]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(postGeo, structureMat);
        post.position.set(px, 27.5, pz);
        post.castShadow = true;
        group.add(post);
    });

    // Glass Panes
    const sideGlassGeo = new THREE.BoxGeometry(0.1, 27, 22);
    const frontGlassGeo = new THREE.BoxGeometry(22, 27, 0.1);
    const gl = new THREE.Mesh(sideGlassGeo, glassMat); gl.position.set(-11.45, 27.5, 0); group.add(gl);
    const gr = new THREE.Mesh(sideGlassGeo, glassMat); gr.position.set(11.45, 27.5, 0); group.add(gr);
    const gb = new THREE.Mesh(frontGlassGeo, glassMat); gb.position.set(0, 27.5, -11.45); group.add(gb);
    const gf = new THREE.Mesh(frontGlassGeo, glassMat); gf.position.set(0, 27.5, 11.45); group.add(gf);

    // Interior floor with hole
    const floorRight = new THREE.Mesh(new THREE.BoxGeometry(15.7, 0.1, 22.8), floorMat);
    floorRight.position.set(3.55, 14.06, 0);
    floorRight.receiveShadow = true;
    group.add(floorRight);

    const floorLeft = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.1, 15.7), floorMat);
    floorLeft.position.set(-7.85, 14.06, -3.55);
    floorLeft.receiveShadow = true;
    group.add(floorLeft);

    // Hole Frame
    const frameGroup = new THREE.Group();
    frameGroup.position.set(-7.8, 14.08, 7.8);
    const sizeExt = 7;
    const borderThickness = 0.4;
    const borderHeight = 0.3;
    const geoH = new THREE.BoxGeometry(sizeExt, borderHeight, borderThickness);
    const geoV = new THREE.BoxGeometry(borderThickness, borderHeight, sizeExt - (borderThickness * 2));
    const borderFront = new THREE.Mesh(geoH, frameMat);
    borderFront.position.set(0, 0, sizeExt / 2 - borderThickness / 2);
    const borderBack = new THREE.Mesh(geoH, frameMat);
    borderBack.position.set(0, 0, -sizeExt / 2 + borderThickness / 2);
    const borderLeft = new THREE.Mesh(geoV, frameMat);
    borderLeft.position.set(-sizeExt / 2 + borderThickness / 2, 0, 0);
    const borderRight = new THREE.Mesh(geoV, frameMat);
    borderRight.position.set(sizeExt / 2 - borderThickness / 2, 0, 0);
    frameGroup.add(borderFront, borderBack, borderLeft, borderRight);
    group.add(frameGroup);

    // Glass dividers near the hole
    const divRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, 7.2), glassMat);
    divRight.position.set(-4.3, 19.1, 7.85);
    group.add(divRight);
    const divBack = new THREE.Mesh(new THREE.BoxGeometry(7.2, 10, 0.1), glassMat);
    divBack.position.set(-7.85, 19.1, 4.3);
    group.add(divBack);

    // Control Panel Support
    const supRight = new THREE.Mesh(new THREE.BoxGeometry(15.9, 13, 4), structureMat);
    supRight.position.set(3.55, 6.5, 12.8);
    group.add(supRight);

    const supLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 13, 4), structureMat);
    supLeft.position.set(-11.5, 6.5, 12.8);
    group.add(supLeft);

    const supTop = new THREE.Mesh(new THREE.BoxGeometry(7.5, 5.2, 4), structureMat);
    supTop.position.set(-7.5, 10.4, 12.8);
    group.add(supTop);

    // Hollow Chute/Tunnel
    const chuteLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 10.0, 11.0), structureMat);
    chuteLeft.position.set(-11.1, 8.5, 9);
    group.add(chuteLeft);

    const chuteRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 11.0), structureMat);
    chuteRight.position.set(-4.5, 7.5, 9);
    group.add(chuteRight);

    const chuteBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 9.0, 0.4), structureMat);
    chuteBack.position.set(-7.8, 9.0, 4.5);
    group.add(chuteBack);

    const panelGroup = new THREE.Group();
    panelGroup.position.set(0, 13, 13.5);
    panelGroup.rotation.x = Math.PI / 6;
    group.add(panelGroup);

    const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 5.2), structureMat);
    panelMesh.castShadow = true;
    panelGroup.add(panelMesh);

    // Joystick
    const joyGroup = new THREE.Group();
    joyGroup.position.set(-5, 1.5, 0);
    panelGroup.add(joyGroup);
    const joystickBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.4, 16),
        materials.joyBase
    );
    joystickBase.position.set(0, 0.2, 0);
    joyGroup.add(joystickBase);

    const joyShaftGroup = new THREE.Group();
    joyShaftGroup.position.set(0, 0.4, 0);
    joyGroup.add(joyShaftGroup);

    const joyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.8, 8), metalMat);
    joyShaft.position.set(0, 1.4, 0);
    joyShaftGroup.add(joyShaft);
    const joyBall = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), materials.joyBall);
    joyBall.position.set(0, 3.2, 0);
    joyShaftGroup.add(joyBall);

    // Button
    const btnGroup = new THREE.Group();
    btnGroup.position.set(5, 1.5, 0);
    panelGroup.add(btnGroup);
    const buttonBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16),
        materials.btnBase
    );
    buttonBase.position.set(0, 0.15, 0);
    btnGroup.add(buttonBase);
    const buttonMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.0, 16), materials.btn);
    buttonMesh.position.set(0, 0.65, 0);
    buttonMesh.castShadow = true;
    btnGroup.add(buttonMesh);
    const btnLight = new THREE.PointLight(THEME.BTN_MAIN, 0.5, 8);
    btnLight.userData.isThemeLight = true;
    btnLight.position.set(5, 4, 0);
    panelGroup.add(btnLight);

    // Luz interna no teto
    const interiorLight = new THREE.PointLight(0xffeedd, 0, 30);
    interiorLight.position.set(0, 38, 0);
    group.add(interiorLight);
    
    // Luz interna mais perto do chão para evidenciar as cápsulas
    const interiorBottomLight = new THREE.PointLight(0xffeedd, 0, 20);
    interiorBottomLight.position.set(0, 5, 0); // Perto das cápsulas
    group.add(interiorBottomLight);
    
    if (scene) {
        scene.userData.clawInteriorLight = interiorLight;
        scene.userData.clawInteriorBottomLight = interiorBottomLight;
    }

    // Claw Mechanism
    const clawRoofGroup = new THREE.Group();
    clawRoofGroup.position.set(0, 42.2, 0);
    group.add(clawRoofGroup);

    const carriage = new THREE.Mesh(new THREE.BoxGeometry(5.28, 1.2, 5.28), mechanismMat);
    carriage.castShadow = true;
    clawRoofGroup.add(carriage);

    const clawCableGroup = new THREE.Group();
    clawCableGroup.position.y = -4;
    clawRoofGroup.add(clawCableGroup);

    const cableGeo = new THREE.CylinderGeometry(0.18, 0.18, 1, 8);
    cableGeo.translate(0, 0.5, 0);
    const cable = new THREE.Mesh(cableGeo, metalMat);
    cable.scale.y = 4;
    cable.castShadow = true;
    clawCableGroup.add(cable);

    // Central Head
    const clawHeadGroup = new THREE.Group();
    clawCableGroup.add(clawHeadGroup);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 1.8, 8), mechanismMat);
    head.castShadow = true;
    clawHeadGroup.add(head);

    // 3 Claw fingers
    const F_WIDTH = 0.55;
    const F_THICK = 0.45;
    const L1 = 3.2;
    const L2 = 2.4;
    const L3 = 1.4;
    const Z_OFF = 0.95;

    const fingers = [];
    const fingerPivots = [];

    for (let i = 0; i < 3; i++) {
        const pivot = new THREE.Group();
        pivot.position.y = -0.9;
        pivot.rotation.y = (Math.PI * 2 / 3) * i;
        clawHeadGroup.add(pivot);
        fingerPivots.push(pivot);

        const geo1 = new THREE.BoxGeometry(F_WIDTH, L1, F_THICK);
        geo1.translate(0, -L1 / 2, Z_OFF);
        const seg1 = new THREE.Mesh(geo1, fingerMat);
        seg1.rotation.x = -Math.PI / 10;
        seg1.castShadow = true;
        pivot.add(seg1);
        fingers.push(seg1);

        const geo2 = new THREE.BoxGeometry(F_WIDTH, L2, F_THICK);
        geo2.translate(0, -L2 / 2, 0);
        const seg2 = new THREE.Mesh(geo2, fingerMat);
        seg2.position.set(0, -L1, Z_OFF);
        seg2.rotation.x = Math.PI / 4;
        seg2.castShadow = true;
        seg1.add(seg2);

        const geo3 = new THREE.BoxGeometry(F_WIDTH, L3, F_THICK);
        geo3.translate(0, -L3 / 2, 0);
        const seg3 = new THREE.Mesh(geo3, fingerMat);
        seg3.position.set(0, -L2, 0);
        seg3.rotation.x = Math.PI / 3;
        seg3.castShadow = true;
        seg2.add(seg3);
    }

    // Slide Ramp
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.5, 14), structureMat);
    ramp.position.set(-7.8, 6, 8);
    ramp.rotation.x = 1;
    group.add(ramp);

    // Acrylic Chute Door (Pivot and Rotation)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-7.8, 7.8, 14.82);
    group.add(doorPivot);

    const doorGeo = new THREE.BoxGeometry(6.8, 6.8, 0.1);
    doorGeo.translate(0, -3.4, 0);
    const chuteDoor = new THREE.Mesh(doorGeo, materials.door);
    doorPivot.add(chuteDoor);

    return {
        box: group,
        roofMechanism: clawRoofGroup,
        cableMechanism: clawCableGroup,
        clawMechanism: clawHeadGroup,
        fingers: fingers,
        fingerPivots: fingerPivots,
        cable: cable,
        door: chuteDoor,
        controls: {
            joystick: joyShaftGroup,
            button: buttonMesh
        },
        interiorLight,
        updateTheme: (theme) => {
            materials.structure.color.set(theme.STRUCTURE);
            materials.glass.color.set(theme.GLASS);
            materials.floor.color.set(theme.FLOOR);
            materials.metal.color.set(theme.METAL);
            materials.mechanism.color.set(theme.MECHANISM);
            materials.finger.color.set(theme.CLAW_FINGER);
            materials.frame.color.set(theme.FRAME);
            materials.joyBase.color.set(theme.JOY_BASE);
            materials.joyBall.color.set(theme.JOY_BALL);
            materials.btnBase.color.set(theme.BTN_BASE);
            materials.btn.color.set(theme.BTN_MAIN);
            materials.door.color.set(theme.DOOR);
            btnLight.color.set(theme.BTN_MAIN);
        }
    };
}