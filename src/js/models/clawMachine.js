import * as THREE from 'three';

export function criarClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    const matEstrutura = new THREE.MeshPhongMaterial({ color: 0x0f1a70, flatShading: true, shininess: 100 });
    const matVidro     = new THREE.MeshPhongMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide });
    const matChao      = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, flatShading: true });
    const matMetal     = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const matMecanismo = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const matDedo      = new THREE.MeshPhongMaterial({ color: 0xffaa00, flatShading: true, shininess: 60 });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), matEstrutura);
    base.position.y = 7;
    base.castShadow = base.receiveShadow = true;
    group.add(base);

    // Teto
    const teto = new THREE.Mesh(new THREE.BoxGeometry(24, 2.4, 24), matEstrutura);
    teto.position.y = 42.2;
    teto.castShadow = true;
    group.add(teto);

    // Postes (4 cantos)
    const posteGeo = new THREE.BoxGeometry(1, 27, 1);
    [[11.5, 11.5], [-11.5, 11.5], [11.5, -11.5], [-11.5, -11.5]].forEach(([px, pz]) => {
        const poste = new THREE.Mesh(posteGeo, matEstrutura);
        poste.position.set(px, 27.5, pz);
        poste.castShadow = true;
        group.add(poste);
    });

    // Vidros
    const vLado  = new THREE.BoxGeometry(0.1, 27, 22);
    const vFront = new THREE.BoxGeometry(22, 27, 0.1);
    const ve = new THREE.Mesh(vLado,  matVidro); ve.position.set(-11.45, 27.5,  0);    group.add(ve);
    const vd = new THREE.Mesh(vLado,  matVidro); vd.position.set( 11.45, 27.5,  0);    group.add(vd);
    const vt = new THREE.Mesh(vFront, matVidro); vt.position.set(0, 27.5, -11.45);     group.add(vt);
    const vf = new THREE.Mesh(vFront, matVidro); vf.position.set(0, 27.5,  11.45);     group.add(vf);

    // Chão interior
    const chao = new THREE.Mesh(new THREE.BoxGeometry(23.8, 0.1, 23.8), matChao);
    chao.position.y = 14.06;
    chao.receiveShadow = true;
    group.add(chao);

    // Buraco de saída
    const saida = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.2, 6.6),
        new THREE.MeshPhongMaterial({ color: 0x111111 }));
    saida.position.set(-7.8, 14.15, 7.8);
    group.add(saida);

    const moldura = new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 7),
        new THREE.MeshPhongMaterial({ color: 0xffa500 }));
    moldura.position.set(-7.8, 14.08, 7.8);
    group.add(moldura);

    // Divisores do buraco
    const divDir = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, 7.2), matVidro);
    divDir.position.set(-4.3, 19.1, 7.85);
    group.add(divDir);
    const divTras = new THREE.Mesh(new THREE.BoxGeometry(7.2, 10, 0.1), matVidro);
    divTras.position.set(-7.85, 19.1, 4.3);
    group.add(divTras);

    // Painel de controlo
    const suporte = new THREE.Mesh(new THREE.BoxGeometry(24, 13, 4), matEstrutura);
    suporte.position.set(0, 6.5, 12.8);
    suporte.castShadow = suporte.receiveShadow = true;
    group.add(suporte);

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
        new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    joyBase.position.set(0, 0.2, 0);
    joyGroup.add(joyBase);

    const joyHasteGroup = new THREE.Group();
    joyHasteGroup.position.set(0, 0.4, 0);
    joyGroup.add(joyHasteGroup);

    const joyHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.8, 8), matMetal);
    joyHaste.position.set(0, 1.4, 0);
    joyHasteGroup.add(joyHaste);
    const joyBola = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 }));
    joyBola.position.set(0, 3.2, 0);
    joyHasteGroup.add(joyBola);

    // Botão
    const btnGroup = new THREE.Group();
    btnGroup.position.set(5, 1.5, 0);
    painelGroup.add(btnGroup);
    const btnBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16),
        new THREE.MeshPhongMaterial({ color: 0x222222 })
    );
    btnBase.position.set(0, 0.15, 0);
    btnGroup.add(btnBase);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.0, 16),
        new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100, emissive: 0x00aa00 }));
    btn.position.set(0, 0.65, 0);
    btn.castShadow = true;
    btnGroup.add(btn);
    const btnLight = new THREE.PointLight(0x00ff00, 1, 8);
    btnLight.position.set(5, 4, 0);
    painelGroup.add(btnLight);

    // ── Mecanismo da garra ─────────────────────────────────────────────────────
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

    // Cabeça central (aro onde os dedos se encaixam)
    const cabeca = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 1.8, 8), matMecanismo);
    cabeca.castShadow = true;
    garraCaboGroup.add(cabeca);

    // ── 3 Dedos, cada um com 3 paralelepípedos planos ─────────────────────────
    
    // DEDOS MAIORES
    const W     = 0.50;  // largura de cada placa (aumentado)
    const T     = 0.40;  // espessura
    const L1    = 3.0;   // comprimento do segmento 1 (aumentado)
    const L2    = 2.2;   // comprimento do segmento 2 (aumentado)
    const L3    = 1.3;   // comprimento do gancho (aumentado)
    const Z_OFF = 1.0;   // deslocamento radial mais afastado do centro (ligeiramente maior)

    const dedos      = [];  // seg1 de cada dedo — animados em main.js
    const dedoPivots = [];  // pivots — world matrix lida pelo Rapier

    for (let i = 0; i < 3; i++) {
        const pivot = new THREE.Group();
        pivot.position.y  = -0.9;
        pivot.rotation.y  = (Math.PI * 2 / 3) * i;   // 0°, 120°, 240°
        garraCaboGroup.add(pivot);
        dedoPivots.push(pivot);

        // ── Segmento 1 — superior, animado ────────────────────────────────
        const geo1 = new THREE.BoxGeometry(W, L1, T);
        geo1.translate(0, -L1 / 2, Z_OFF);  
        const seg1 = new THREE.Mesh(geo1, matDedo);
        
        // ALTERADO: Ângulo negativo para a base abrir ligeiramente para fora (-18 graus)
        seg1.rotation.x = -Math.PI / 10;     
        seg1.castShadow = true;
        pivot.add(seg1);
        dedos.push(seg1);                    

        // ── Segmento 2 — intermédio, fixo relativo ao seg1 ────────────────
        const geo2 = new THREE.BoxGeometry(W, L2, T);
        geo2.translate(0, -L2 / 2, 0);      
        const seg2 = new THREE.Mesh(geo2, matDedo);
        seg2.position.set(0, -L1, Z_OFF);   
        
        // ALTERADO: Dobra bem para dentro para formar a curvatura da garra (+45 graus)
        seg2.rotation.x = Math.PI / 4;      
        seg2.castShadow = true;
        seg1.add(seg2);

        // ── Segmento 3 — gancho/ponta, fixo relativo ao seg2 ──────────────
        const geo3 = new THREE.BoxGeometry(W, L3, T);
        geo3.translate(0, -L3 / 2, 0);      
        const seg3 = new THREE.Mesh(geo3, matDedo);
        seg3.position.set(0, -L2, 0);       
        
        // ALTERADO: Fecha a ponta para criar o gancho que agarra o prémio (+60 graus)
        seg3.rotation.x = Math.PI / 3;      
        seg3.castShadow = true;
        seg2.add(seg3);
    }

    // ── Porta de saída ─────────────────────────────────────────────────────────
    const fundoBuraco = new THREE.Mesh(
        new THREE.PlaneGeometry(6.6, 6.6),
        new THREE.MeshBasicMaterial({ color: 0x050505 })
    );
    fundoBuraco.position.set(-7.8, 4.5, 14.81);
    group.add(fundoBuraco);

    const portaPivot = new THREE.Group();
    portaPivot.position.set(-7.8, 7.8, 14.82);
    group.add(portaPivot);

    const portaGeo = new THREE.BoxGeometry(6.8, 6.8, 0.1);
    portaGeo.translate(0, -3.4, 0);
    const porta = new THREE.Mesh(portaGeo,
        new THREE.MeshPhongMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5, shininess: 90, side: THREE.DoubleSide })
    );
    portaPivot.add(porta);

    return {
        caixa:         group,
        mecanismoTeto: garraTetoGroup,
        mecanismoCabo: garraCaboGroup,
        dedos:         dedos,        // seg1 de cada dedo — animar rotation.x
        dedoPivots:    dedoPivots,   // pivots — world matrix para Rapier
        cabo:          cabo,
        porta:         porta,
        controles: {
            joystick: joyHasteGroup,
            botao:    btn
        }
    };
}