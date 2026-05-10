import * as THREE from 'three';
import { THEME } from '../config/theme.js';
import { carregarConjuntoTexturas } from "../systems/TextureLoader.js";

export function criarClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    // --- Carregamento de Texturas da Máquina ---
    const repeteEstrutura = { x: 2, y: 2 };
    const tm = carregarConjuntoTexturas(
        "./src/js/textures/metal/PaintedMetal004_1K-JPG",
        ["Color", "NormalGL", "Roughness", "Metalness"],
        repeteEstrutura
    );

    // Materiais
    const materiais = {
        estrutura: new THREE.MeshPhongMaterial({
            color: THEME.ESTRUTURA,
            map: tm.color,
            normalMap: tm.normal,
            specularMap: tm.roughness,
            shininess: 100
        }),
        vidro: new THREE.MeshPhongMaterial({ color: THEME.VIDRO, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
        chao: new THREE.MeshPhongMaterial({
            color: THEME.CHAO,
            flatShading: true
        }),
        metal: new THREE.MeshPhongMaterial({ color: THEME.METAL }),             // Haste do joystick e cabo
        mecanismo: new THREE.MeshPhongMaterial({ color: THEME.MECANISMO }),     // Base dos dedos da garra
        dedo: new THREE.MeshPhongMaterial({ color: THEME.GARRA_DEDO, flatShading: true, shininess: 60 }),
        moldura: new THREE.MeshPhongMaterial({ color: THEME.MODURA }),
        joyBase: new THREE.MeshPhongMaterial({ color: THEME.JOY_BASE }),
        joyBola: new THREE.MeshPhongMaterial({ color: THEME.JOY_BOLA, shininess: 100 }),
        btnBase: new THREE.MeshPhongMaterial({ color: THEME.BTN_BASE }),
        btn: new THREE.MeshPhongMaterial({ color: THEME.BTN_PRINCIPAL, shininess: 80 }),
        porta: new THREE.MeshPhongMaterial({ color: THEME.PORTA, transparent: true, opacity: 0.5, shininess: 90, side: THREE.DoubleSide })
    };

    const { estrutura: matEstrutura, vidro: matVidro, chao: matChao, metal: matMetal, mecanismo: matMecanismo, dedo: matDedo, moldura: matMoldura } = materiais;

    // ── Base Oca ─────────────────────────────────────────────────────────────────
    const esp = 1;

    // Chao da porta
    const baseFundo = new THREE.Mesh(new THREE.BoxGeometry(10, 0.95, 10), matEstrutura);
    baseFundo.position.set(-6.5, 0.5, 9.8);
    group.add(baseFundo);

    // Parede da base tras
    const baseTras = new THREE.Mesh(new THREE.BoxGeometry(24, 14, esp), matEstrutura);
    baseTras.position.set(0, 7, -11.5);
    group.add(baseTras);

    // Parede da base direita
    const baseDir = new THREE.Mesh(new THREE.BoxGeometry(esp, 14, 24), matEstrutura);
    baseDir.position.set(11.5, 7, 0);
    group.add(baseDir);

    // Parede da base esquerda
    const baseEsq = new THREE.Mesh(new THREE.BoxGeometry(esp, 14, 24), matEstrutura);
    baseEsq.position.set(-11.5, 7, 0);
    group.add(baseEsq);

    // Parede da base frente direita
    const baseFrenteDir = new THREE.Mesh(new THREE.BoxGeometry(15.9, 14, esp), matEstrutura);
    baseFrenteDir.position.set(3.55, 7, 11.5);
    group.add(baseFrenteDir);

    // Teto
    const teto = new THREE.Mesh(new THREE.BoxGeometry(24, 2.4, 24), matEstrutura);
    teto.position.y = 42.2;
    teto.castShadow = true;
    group.add(teto);

    // Postes/Colunas
    const posteGeo = new THREE.BoxGeometry(1, 27, 1);
    [[11.5, 11.5], [-11.5, 11.5], [11.5, -11.5], [-11.5, -11.5]].forEach(([px, pz]) => {
        const poste = new THREE.Mesh(posteGeo, matEstrutura);
        poste.position.set(px, 27.5, pz);
        poste.castShadow = true;
        group.add(poste);
    });

    // Vidros
    const vLado = new THREE.BoxGeometry(0.1, 27, 22);
    const vFront = new THREE.BoxGeometry(22, 27, 0.1);
    const ve = new THREE.Mesh(vLado, matVidro); ve.position.set(-11.45, 27.5, 0); group.add(ve);
    const vd = new THREE.Mesh(vLado, matVidro); vd.position.set(11.45, 27.5, 0); group.add(vd);
    const vt = new THREE.Mesh(vFront, matVidro); vt.position.set(0, 27.5, -11.45); group.add(vt);
    const vf = new THREE.Mesh(vFront, matVidro); vf.position.set(0, 27.5, 11.45); group.add(vf);

    // Chão interior dividido em dois blocos 
    // (Para conseguir ter um buraco para as cápsulas caírem)
    const chaoDir = new THREE.Mesh(new THREE.BoxGeometry(15.7, 0.1, 22.8), matChao);
    chaoDir.position.set(3.55, 14.06, 0);
    chaoDir.receiveShadow = true;
    group.add(chaoDir);

    const chaoEsq = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.1, 15.7), matChao);
    chaoEsq.position.set(-7.85, 14.06, -3.55);
    chaoEsq.receiveShadow = true;
    group.add(chaoEsq);

    // Moldura entre buraco e vidros
    const molduraGroup = new THREE.Group();
    molduraGroup.position.set(-7.8, 14.08, 7.8);
    const tamExt = 7;
    const espessura = 0.4;
    const altura = 0.3;
    const geoH = new THREE.BoxGeometry(tamExt, altura, espessura);
    const geoV = new THREE.BoxGeometry(espessura, altura, tamExt - (espessura * 2));
    const bordaFrente = new THREE.Mesh(geoH, matMoldura);
    bordaFrente.position.set(0, 0, tamExt / 2 - espessura / 2);
    const bordaTras = new THREE.Mesh(geoH, matMoldura);
    bordaTras.position.set(0, 0, -tamExt / 2 + espessura / 2);
    const bordaEsq = new THREE.Mesh(geoV, matMoldura);
    bordaEsq.position.set(-tamExt / 2 + espessura / 2, 0, 0);
    const bordaDir = new THREE.Mesh(geoV, matMoldura);
    bordaDir.position.set(tamExt / 2 - espessura / 2, 0, 0);
    molduraGroup.add(bordaFrente, bordaTras, bordaEsq, bordaDir);
    group.add(molduraGroup);

    // Vidros divisores entre buraco e cápsulas
    const divDir = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, 7.2), matVidro);
    divDir.position.set(-4.3, 19.1, 7.85);
    group.add(divDir);
    const divTras = new THREE.Mesh(new THREE.BoxGeometry(7.2, 10, 0.1), matVidro);
    divTras.position.set(-7.85, 19.1, 4.3);
    group.add(divTras);

    // Painel de Controlo
    const supDir = new THREE.Mesh(new THREE.BoxGeometry(15.9, 13, 4), matEstrutura);
    supDir.position.set(3.55, 6.5, 12.8);
    group.add(supDir);

    const supEsq = new THREE.Mesh(new THREE.BoxGeometry(0.5, 13, 4), matEstrutura);
    supEsq.position.set(-11.5, 6.5, 12.8);
    group.add(supEsq);

    const supTopo = new THREE.Mesh(new THREE.BoxGeometry(7.5, 5.2, 4), matEstrutura);
    supTopo.position.set(-7.5, 10.4, 12.8);
    group.add(supTopo);

    // Túnel Oco
    const tunelEsq = new THREE.Mesh(new THREE.BoxGeometry(0.4, 10.0, 11.0), matEstrutura);
    tunelEsq.position.set(-11.1, 8.5, 9);
    group.add(tunelEsq);

    const tunelDir = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 11.0), matEstrutura);
    tunelDir.position.set(-4.5, 7.5, 9);
    group.add(tunelDir);

    const tunelTras = new THREE.Mesh(new THREE.BoxGeometry(6.2, 9.0, 0.4), matEstrutura);
    tunelTras.position.set(-7.8, 9.0, 4.5);
    group.add(tunelTras);

    const painelGroup = new THREE.Group();
    painelGroup.position.set(0, 13, 13.5);
    painelGroup.rotation.x = Math.PI / 6;
    group.add(painelGroup);

    const painelMesh = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 5.2), matEstrutura);
    painelMesh.castShadow = true;
    painelGroup.add(painelMesh);

    // Joystick
    const joyGroup = new THREE.Group();
    joyGroup.position.set(-5, 1.5, 0);
    painelGroup.add(joyGroup);
    const joyBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.4, 16),
        materiais.joyBase
    );
    joyBase.position.set(0, 0.2, 0);
    joyGroup.add(joyBase);

    const joyHasteGroup = new THREE.Group();
    joyHasteGroup.position.set(0, 0.4, 0);
    joyGroup.add(joyHasteGroup);

    const joyHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.8, 8), matMetal);
    joyHaste.position.set(0, 1.4, 0);
    joyHasteGroup.add(joyHaste);
    const joyBola = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), materiais.joyBola);
    joyBola.position.set(0, 3.2, 0);
    joyHasteGroup.add(joyBola);

    // Botão
    const btnGroup = new THREE.Group();
    btnGroup.position.set(5, 1.5, 0);
    painelGroup.add(btnGroup);
    const btnBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16),
        materiais.btnBase
    );
    btnBase.position.set(0, 0.15, 0);
    btnGroup.add(btnBase);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.0, 16), materiais.btn);
    btn.position.set(0, 0.65, 0);
    btn.castShadow = true;
    btnGroup.add(btn);
    const btnLight = new THREE.PointLight(THEME.BTN_PRINCIPAL, 0.5, 8);
    btnLight.userData.isThemeLight = true;
    btnLight.position.set(5, 4, 0);
    painelGroup.add(btnLight);

    // Mecanismo da Garra
    const garraTetoGroup = new THREE.Group();
    garraTetoGroup.position.set(0, 42.2, 0);
    group.add(garraTetoGroup);

    const carrinho = new THREE.Mesh(new THREE.BoxGeometry(5.28, 1.2, 5.28), matMecanismo);
    carrinho.castShadow = true;
    garraTetoGroup.add(carrinho);

    const garraCaboGroup = new THREE.Group();
    garraCaboGroup.position.y = -4;
    garraTetoGroup.add(garraCaboGroup);

    const caboGeo = new THREE.CylinderGeometry(0.18, 0.18, 1, 8);
    caboGeo.translate(0, 0.5, 0);
    const cabo = new THREE.Mesh(caboGeo, matMetal);
    cabo.scale.y = 4;
    cabo.castShadow = true;
    garraCaboGroup.add(cabo);

    // Cabeça central
    const garraCabecaGroup = new THREE.Group();
    garraCaboGroup.add(garraCabecaGroup);

    const cabeca = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 1.8, 8), matMecanismo);
    cabeca.castShadow = true;
    garraCabecaGroup.add(cabeca);

    // 3 Dedos da garra
    const W = 0.55;
    const T = 0.45;
    const L1 = 3.2;
    const L2 = 2.4;
    const L3 = 1.4;
    const Z_OFF = 0.95;

    const dedos = [];
    const dedoPivots = [];

    for (let i = 0; i < 3; i++) {
        const pivot = new THREE.Group();
        pivot.position.y = -0.9;
        pivot.rotation.y = (Math.PI * 2 / 3) * i;
        garraCabecaGroup.add(pivot);
        dedoPivots.push(pivot);

        const geo1 = new THREE.BoxGeometry(W, L1, T);
        geo1.translate(0, -L1 / 2, Z_OFF);
        const seg1 = new THREE.Mesh(geo1, matDedo);
        seg1.rotation.x = -Math.PI / 10;
        seg1.castShadow = true;
        pivot.add(seg1);
        dedos.push(seg1);

        const geo2 = new THREE.BoxGeometry(W, L2, T);
        geo2.translate(0, -L2 / 2, 0);
        const seg2 = new THREE.Mesh(geo2, matDedo);
        seg2.position.set(0, -L1, Z_OFF);
        seg2.rotation.x = Math.PI / 4;
        seg2.castShadow = true;
        seg1.add(seg2);

        const geo3 = new THREE.BoxGeometry(W, L3, T);
        geo3.translate(0, -L3 / 2, 0);
        const seg3 = new THREE.Mesh(geo3, matDedo);
        seg3.position.set(0, -L2, 0);
        seg3.rotation.x = Math.PI / 3;
        seg3.castShadow = true;
        seg2.add(seg3);
    }

    //Rampa de Deslize
    const rampa = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.5, 14), matEstrutura);
    rampa.position.set(-7.8, 6, 8);
    rampa.rotation.x = 1;
    group.add(rampa);

    // Portinhola de Acrílico (Pivô e Rotação)
    const portaPivot = new THREE.Group();
    portaPivot.position.set(-7.8, 7.8, 14.82);
    group.add(portaPivot);

    const portaGeo = new THREE.BoxGeometry(6.8, 6.8, 0.1);
    portaGeo.translate(0, -3.4, 0);
    const porta = new THREE.Mesh(portaGeo, materiais.porta);
    portaPivot.add(porta);

    return {
        caixa: group,
        mecanismoTeto: garraTetoGroup,
        mecanismoCabo: garraCaboGroup,
        mecanismoGarra: garraCabecaGroup,
        dedos: dedos,
        dedoPivots: dedoPivots,
        cabo: cabo,
        porta: porta,
        controles: {
            joystick: joyHasteGroup,
            botao: btn
        },
        atualizarTema: (tema) => {
            materiais.estrutura.color.set(tema.ESTRUTURA);
            materiais.vidro.color.set(tema.VIDRO);
            materiais.chao.color.set(tema.CHAO);
            materiais.metal.color.set(tema.METAL);
            materiais.mecanismo.color.set(tema.MECANISMO);
            materiais.dedo.color.set(tema.GARRA_DEDO);
            materiais.moldura.color.set(tema.MODURA);
            materiais.joyBase.color.set(tema.JOY_BASE);
            materiais.joyBola.color.set(tema.JOY_BOLA);
            materiais.btnBase.color.set(tema.BTN_BASE);
            materiais.btn.color.set(tema.BTN_PRINCIPAL);
            materiais.porta.color.set(tema.PORTA);
            btnLight.color.set(tema.BTN_PRINCIPAL);
        }
    };
}