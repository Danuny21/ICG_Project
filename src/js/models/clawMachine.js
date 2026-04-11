import * as THREE from 'three';

/**
 * Cria a Claw Machine melhorada visualmente
 * Retorna os componentes principais para animação
 */
export function criarClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    // Materiais
    const matEstrutura = new THREE.MeshPhongMaterial({ 
        color: 0xcc0000, // Vermelho
        flatShading: true,
        shininess: 100
    }); 
    
    const matVidro = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb, // Azul
        transparent: true, 
        opacity: 0.25, 
        depthWrite: false,
        side: THREE.DoubleSide
    });
    
    const matChao = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a, 
        flatShading: true
    });
    
    const matMetal = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc
    });
    
    const matMecanismo = new THREE.MeshPhongMaterial({ 
        color: 0x333333
    });
    
    const matDedoMelhorado = new THREE.MeshPhongMaterial({ 
        color: 0xffaa00, // Laranja para garras
        flatShading: true,
        shininess: 60
    });

    // Estrutura básica
    
    // Base
    const baseGeo = new THREE.BoxGeometry(24, 14, 24);
    const base = new THREE.Mesh(baseGeo, matEstrutura);
    base.position.y = 7;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Teto
    const tetoGeo = new THREE.BoxGeometry(24, 2.4, 24);
    const teto = new THREE.Mesh(tetoGeo, matEstrutura);
    teto.position.y = 42.2; 
    teto.castShadow = true;
    group.add(teto);

    // Postes
    const posteGeo = new THREE.BoxGeometry(1, 27, 1);
    const posicoes = [[11.5, 11.5], [-11.5, 11.5], [11.5, -11.5], [-11.5, -11.5]];
    posicoes.forEach(p => {
        const poste = new THREE.Mesh(posteGeo, matEstrutura);
        poste.position.set(p[0], 27.5, p[1]);
        poste.castShadow = true;
        group.add(poste);
    });

    // Vidros
    const vidroLadoGeo = new THREE.BoxGeometry(0.1, 27, 22);
    const vidroFrenteTrasGeo = new THREE.BoxGeometry(22, 27, 0.1);

    const vidroEsq = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroEsq.position.set(-11.45, 27.5, 0); 
    group.add(vidroEsq);

    const vidroDir = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroDir.position.set(11.45, 27.5, 0);
    group.add(vidroDir);

    const vidroTras = new THREE.Mesh(vidroFrenteTrasGeo, matVidro);
    vidroTras.position.set(0, 27.5, -11.45);
    group.add(vidroTras);
    
    // Vidro da frente
    const vidroFrente = new THREE.Mesh(vidroFrenteTrasGeo, matVidro);
    vidroFrente.position.set(0, 27.5, 11.45);
    group.add(vidroFrente);

    // Chao interior
    const chaoGeo = new THREE.BoxGeometry(23.8, 0.1, 23.8); 
    const chao = new THREE.Mesh(chaoGeo, matChao);
    chao.position.y = 14.06;
    chao.receiveShadow = true;
    group.add(chao);

    // Caixa de saída
    const saidaGeo = new THREE.BoxGeometry(6.6, 0.2, 6.6); 
    const matBuraco = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const saida = new THREE.Mesh(saidaGeo, matBuraco);
    saida.position.set(-7.8, 14.15, 7.8); 
    group.add(saida);

    // Moldura do buraco
    const molduraBuraco = new THREE.BoxGeometry(7, 0.3, 7);
    const matMoldura = new THREE.MeshPhongMaterial({ color: 0xffa500 });
    const moldura = new THREE.Mesh(molduraBuraco, matMoldura);
    moldura.position.set(-7.8, 14.08, 7.8);
    group.add(moldura);

    // Divisores do buraco
    
    // Painel direito
    const divisorDirGeo = new THREE.BoxGeometry(0.1, 10, 7.2); // Fino, 10 de altura
    const divisorDir = new THREE.Mesh(divisorDirGeo, matVidro);
    divisorDir.position.set(-4.3, 19.1, 7.85);
    group.add(divisorDir);

    // Painel traseiro
    const divisorTrasGeo = new THREE.BoxGeometry(7.2, 10, 0.1); 
    const divisorTras = new THREE.Mesh(divisorTrasGeo, matVidro);
    divisorTras.position.set(-7.85, 19.1, 4.3); 
    group.add(divisorTras);

    // Painel de controlo
    
    // Suporte do painel
    const suportePainelGeo = new THREE.BoxGeometry(24, 13, 4);
    const suportePainel = new THREE.Mesh(suportePainelGeo, matEstrutura);
    suportePainel.position.set(0, 6.5, 12.8); 
    suportePainel.castShadow = true;
    suportePainel.receiveShadow = true;
    group.add(suportePainel);

    // Painel principal
    const painelGroup = new THREE.Group();
    painelGroup.position.set(0, 13, 13.5); 
    painelGroup.rotation.x = Math.PI / 6; 
    group.add(painelGroup);

    const painelGeo = new THREE.BoxGeometry(24, 3, 5.2);
    const painel = new THREE.Mesh(painelGeo, matEstrutura);
    painel.castShadow = true;
    painelGroup.add(painel);

    // Joystick
    const joyGroup = new THREE.Group();
    joyGroup.position.set(-5, 1.5, 0); 
    painelGroup.add(joyGroup);

    const joyBaseGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.4, 16);
    const joyBase = new THREE.Mesh(joyBaseGeo, new THREE.MeshPhongMaterial({color: 0x444444}));
    joyBase.position.set(0, 0.2, 0); 
    joyBase.castShadow = true;
    joyGroup.add(joyBase);

    const joyHasteGroup = new THREE.Group();
    joyHasteGroup.position.set(0, 0.4, 0); 
    joyGroup.add(joyHasteGroup);

    const joyHasteGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.8, 8);
    const joyHaste = new THREE.Mesh(joyHasteGeo, matMetal);
    joyHaste.position.set(0, 1.4, 0); 
    joyHaste.castShadow = true;
    joyHasteGroup.add(joyHaste);

    const joyBolaGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const joyBola = new THREE.Mesh(joyBolaGeo, new THREE.MeshPhongMaterial({color: 0xff0000, shininess: 100}));
    joyBola.position.set(0, 2.8 + 0.4, 0);
    joyBola.castShadow = true;
    joyHasteGroup.add(joyBola);

    // Botão
    const btnGroup = new THREE.Group();
    btnGroup.position.set(5, 1.5, 0); 
    painelGroup.add(btnGroup);

    const btnBaseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16);
    const btnBase = new THREE.Mesh(btnBaseGeo, new THREE.MeshPhongMaterial({color: 0x222222}));
    btnBase.position.set(0, 0.15, 0);
    btnGroup.add(btnBase);

    const btnGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.0, 16);
    const btn = new THREE.Mesh(btnGeo, new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        shininess: 100,
        emissive: 0x00aa00
    }));
    btn.position.set(0, 0.15 + 0.5, 0); 
    btn.castShadow = true;
    btnGroup.add(btn);

    const btnLight = new THREE.PointLight(0x00ff00, 1, 8);
    btnLight.position.set(5, 4, 0); 
    painelGroup.add(btnLight);

    // Mecanismo da garra
    
    const garraTetoGroup = new THREE.Group();
    garraTetoGroup.position.set(0, 42.2, 0);
    group.add(garraTetoGroup);

    const carrinhoGeo = new THREE.BoxGeometry(5.28, 1.2, 5.28);
    const carrinho = new THREE.Mesh(carrinhoGeo, matMecanismo);
    carrinho.castShadow = true;
    garraTetoGroup.add(carrinho);

    const garraCaboGroup = new THREE.Group();
    // Posição inicial da garra
    garraCaboGroup.position.y = -4; 
    garraTetoGroup.add(garraCaboGroup);

    const caboGeo = new THREE.CylinderGeometry(0.18, 0.18, 1, 8);
    caboGeo.translate(0, 0.5, 0); 
    const cabo = new THREE.Mesh(caboGeo, matMetal);
    cabo.position.y = 0; 
    cabo.scale.y = 4;
    cabo.castShadow = true; 
    garraCaboGroup.add(cabo);

    const cabecaGeo = new THREE.CylinderGeometry(1.44, 2.16, 2.4, 8);
    const cabeca = new THREE.Mesh(cabecaGeo, matMecanismo);
    cabeca.position.y = 0;
    cabeca.castShadow = true;
    garraCaboGroup.add(cabeca);

    const dedos = [];
    const numDedos = 4; 

    for (let i = 0; i < numDedos; i++) {
        const dedoPivot = new THREE.Group();
        dedoPivot.position.y = -0.72;
        
        dedoPivot.rotation.y = (Math.PI * 2 / numDedos) * i;
        garraCaboGroup.add(dedoPivot);

        const dedoSupGeo = new THREE.BoxGeometry(0.6, 2.4, 0.84);
        dedoSupGeo.translate(0, -1.2, 0.48); 
        const dedoSup = new THREE.Mesh(dedoSupGeo, matDedoMelhorado);
        dedoSup.rotation.x = Math.PI / 8;
        dedoSup.castShadow = true;
        dedoPivot.add(dedoSup);

        const dedoPontaGeo = new THREE.ConeGeometry(0.528, 1.2, 6);
        dedoPontaGeo.translate(0, -0.6, 0);
        const dedoPonta = new THREE.Mesh(dedoPontaGeo, matDedoMelhorado);
        dedoPonta.position.set(0, -2.4, 0.84);
        dedoPonta.rotation.x = -Math.PI / 3;
        dedoPonta.castShadow = true;
        dedoSup.add(dedoPonta);

        dedos.push(dedoSup);
    }

    // Porta de saída de prémios (frontal)
    // Fundo escuro na frente da base
    const fundoBuracoGeo = new THREE.PlaneGeometry(6.6, 6.6);
    const fundoBuraco = new THREE.Mesh(fundoBuracoGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
    fundoBuraco.position.set(-7.8, 4.5, 14.81);
    group.add(fundoBuraco);

    // Grupo pivot da porta
    const portaPivot = new THREE.Group();
    portaPivot.position.set(-7.8, 7.8, 14.82);
    group.add(portaPivot);

    // Porta
    const portaMat = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.5,
        shininess: 90,
        side: THREE.DoubleSide
    });
    const portaGeo = new THREE.BoxGeometry(6.8, 6.8, 0.1);
    portaGeo.translate(0, -3.4, 0); 
    const porta = new THREE.Mesh(portaGeo, portaMat);
    portaPivot.add(porta);

    return {
        caixa: group,
        mecanismoTeto: garraTetoGroup,
        mecanismoCabo: garraCaboGroup,
        dedos: dedos,
        cabo: cabo, 
        porta: porta, // Exportar a porta
        controles: {
            joystick: joyHasteGroup, 
            botao: btn             
        }
    };
}