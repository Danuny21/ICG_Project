import * as THREE from 'three';

/**
 * Cria a Claw Machine melhorada visualmente
 * Retorna os componentes principais para animação
 */
export function criarClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    // --- MATERIAIS (MELHORADOS) ---
    const matEstrutura = new THREE.MeshPhongMaterial({ 
        color: 0xff1493, // Rosa vibrante
        flatShading: true,
        shininess: 100
    }); 
    
    const matVidro = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb, // Azul céu
        transparent: true, 
        opacity: 0.25, 
        depthWrite: false,
        side: THREE.DoubleSide
    });
    
    const matChao = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a, 
        flatShading: true,
        metalness: 0.3
    });
    
    const matMetal = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc, 
        metalness: 0.9, 
        roughness: 0.1
    });
    
    const matMecanismo = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        metalness: 0.6,
        roughness: 0.3
    });
    
    const matDedoMelhorado = new THREE.MeshPhongMaterial({ 
        color: 0xffaa00, // Laranja para garras
        flatShading: true,
        shininess: 60
    });

    // --- 1. ESTRUTURA BÁSICA (A CAIXA) ---
    // Base com mais estilo - AUMENTADA
    const baseGeo = new THREE.BoxGeometry(20, 6, 20);
    const base = new THREE.Mesh(baseGeo, matEstrutura);
    base.position.y = 3;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Rodas na base (detalhes visuais)
    const rodaMat = new THREE.MeshPhongMaterial({ color: 0x222222, metalness: 0.8 });
    const rodaGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const posicoesRodas = [[8.5, 8.5], [-8.5, 8.5], [8.5, -8.5], [-8.5, -8.5]];
    posicoesRodas.forEach(p => {
        const roda = new THREE.Mesh(rodaGeo, rodaMat);
        roda.position.set(p[0], 0.8, p[1]);
        roda.rotation.z = Math.PI / 2;
        roda.castShadow = true;
        group.add(roda);
    });

    // Teto - AUMENTADO
    const tetoGeo = new THREE.BoxGeometry(20, 2, 20);
    const teto = new THREE.Mesh(tetoGeo, matEstrutura);
    teto.position.y = 28;
    teto.castShadow = true;
    group.add(teto);

    // Postes (4 cantos) - mais grossos e altos
    const posteGeo = new THREE.BoxGeometry(0.8, 22, 0.8);
    const posteCornerGeo = new THREE.BoxGeometry(0.8, 22, 0.8);
    const posicoes = [[9.6, 9.6], [-9.6, 9.6], [9.6, -9.6], [-9.6, -9.6]];
    posicoes.forEach(p => {
        const poste = new THREE.Mesh(posteCornerGeo, matEstrutura);
        poste.position.set(p[0], 14, p[1]);
        poste.castShadow = true;
        group.add(poste);
    });

    // Vidros (Frente, Trás, Lados) - SEM OVERLAPPING, com espessura aumentada
    const vidroLadoGeo = new THREE.BoxGeometry(0.2, 20, 19);
    const vidroFrenteGeo = new THREE.BoxGeometry(19, 20, 0.2);

    const vidroEsq = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroEsq.position.set(-10.1, 14, 0);
    group.add(vidroEsq);

    const vidroDir = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroDir.position.set(10.1, 14, 0);
    group.add(vidroDir);

    const vidroTras = new THREE.Mesh(vidroFrenteGeo, matVidro);
    vidroTras.position.set(0, 14, -10.1);
    group.add(vidroTras);
    
    // Vidro da frente - altura reduzida para mostrar painel de controle
    const vidroFrenteGeoCurto = new THREE.BoxGeometry(19, 16, 0.2);
    const vidroFrente = new THREE.Mesh(vidroFrenteGeoCurto, matVidro);
    vidroFrente.position.set(0, 16, 10.1);
    group.add(vidroFrente);

    // Chao interior - SEM CONFLITO com base
    const chaoGeo = new THREE.BoxGeometry(19, 0.2, 19);
    const chao = new THREE.Mesh(chaoGeo, matChao);
    chao.position.y = 6.1;
    chao.receiveShadow = true;
    group.add(chao);

    // Caixa de saída (Buraco) - maior e melhor posicionada
    const saidaGeo = new THREE.BoxGeometry(5.5, 6, 5.5);
    const saida = new THREE.Mesh(saidaGeo, new THREE.MeshPhongMaterial({ color: 0xffa500 }));
    saida.position.set(-6.5, 3, 6.5);
    group.add(saida);

    // --- 2. PAINEL DE CONTROLE (MELHORADO) ---
    const painelGeo = new THREE.BoxGeometry(12, 4, 3.5);
    const painel = new THREE.Mesh(painelGeo, matEstrutura);
    painel.position.set(0, 10, 10.8);
    painel.rotation.x = -Math.PI / 6;
    painel.castShadow = true;
    group.add(painel);

    // Joystick melhorado - AUMENTADO
    const joyBaseGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 8);
    const joyBase = new THREE.Mesh(joyBaseGeo, new THREE.MeshPhongMaterial({color: 0x444444}));
    joyBase.position.set(-3.5, 11.5, 11);
    joyBase.rotation.x = -Math.PI / 6;
    joyBase.castShadow = true;
    group.add(joyBase);

    const joyHasteGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8);
    const joyHaste = new THREE.Mesh(joyHasteGeo, matMetal);
    joyHaste.position.set(-3.5, 12.3, 11.5);
    joyHaste.rotation.x = -Math.PI / 6;
    joyHaste.castShadow = true;
    group.add(joyHaste);

    const joyBolaGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const joyBola = new THREE.Mesh(joyBolaGeo, new THREE.MeshPhongMaterial({color: 0xff0000, shininess: 100}));
    joyBola.position.set(-3.5, 13.2, 12);
    joyBola.castShadow = true;
    group.add(joyBola);

    // Botão Grande (com mais detalhe) - AUMENTADO
    const btnGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.8, 16);
    const btn = new THREE.Mesh(btnGeo, new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        shininess: 100,
        emissive: 0x00aa00
    }));
    btn.position.set(3.5, 11.5, 11);
    btn.rotation.x = -Math.PI / 6;
    btn.castShadow = true;
    group.add(btn);

    // Luz do botão (glow effect)
    const btnLight = new THREE.PointLight(0x00ff00, 1, 6);
    btnLight.position.set(3.5, 12.5, 11.3);
    group.add(btnLight);

    // --- 3. MECANISMO DA GARRA (Versão Melhorada) ---
    
    // Grupo Teto
    const garraTetoGroup = new THREE.Group();
    garraTetoGroup.position.set(0, 28, 0);
    group.add(garraTetoGroup);

    // Carrinho do teto (com mais detalhe) - AUMENTADO
    const carrinhoGeo = new THREE.BoxGeometry(4.4, 1, 4.4);
    const carrinho = new THREE.Mesh(carrinhoGeo, matMecanismo);
    carrinho.castShadow = true;
    garraTetoGroup.add(carrinho);

    // Grupo Cabo
    const garraCaboGroup = new THREE.Group();
    garraTetoGroup.add(garraCaboGroup);

    // O Cabo (com mais detail) - AUMENTADO
    const caboGeo = new THREE.CylinderGeometry(0.15, 0.15, 20, 8);
    const cabo = new THREE.Mesh(caboGeo, matMetal);
    cabo.position.y = 10;
    cabo.castShadow = true; 
    garraCaboGroup.add(cabo);

    // A Cabeça da Garra - AUMENTADA
    const cabecaGeo = new THREE.CylinderGeometry(1.2, 1.8, 2, 8);
    const cabeca = new THREE.Mesh(cabecaGeo, matMecanismo);
    cabeca.position.y = 0;
    cabeca.castShadow = true;
    garraCaboGroup.add(cabeca);

    // Dedos da Garra (MELHORADOS - mais bonitos) - AUMENTADOS
    const dedos = [];
    const numDedos = 4; // 4 dedos em vez de 3

    for (let i = 0; i < numDedos; i++) {
        const dedoPivot = new THREE.Group();
        dedoPivot.position.y = -0.6;
        
        // Distribuir os 4 dedos
        dedoPivot.rotation.y = (Math.PI * 2 / numDedos) * i;
        garraCaboGroup.add(dedoPivot);

        // Parte superior do dedo (mais comprido e elegante)
        const dedoSupGeo = new THREE.BoxGeometry(0.5, 3.6, 0.7);
        dedoSupGeo.translate(0, -1.8, 0.4); 
        const dedoSup = new THREE.Mesh(dedoSupGeo, matDedoMelhorado);
        dedoSup.rotation.x = Math.PI / 8;
        dedoSup.castShadow = true;
        dedoPivot.add(dedoSup);

        // Ponta afiada (cone)
        const dedoPontaGeo = new THREE.ConeGeometry(0.44, 1.6, 6);
        dedoPontaGeo.translate(0, -0.8, 0);
        const dedoPonta = new THREE.Mesh(dedoPontaGeo, matDedoMelhorado);
        dedoPonta.position.set(0, -3.6, 0.7);
        dedoPonta.rotation.x = -Math.PI / 3;
        dedoPonta.castShadow = true;
        dedoSup.add(dedoPonta);

        dedos.push(dedoSup);
    }

    // Retornamos as partes que precisamos de animar
    return {
        caixa: group,
        mecanismoTeto: garraTetoGroup,
        mecanismoCabo: garraCaboGroup,
        dedos: dedos
    };
}
