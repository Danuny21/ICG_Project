import * as THREE from 'three';

export function criarClawMachine(scene) {
    const group = new THREE.Group();
    scene.add(group);

    // --- MATERIAIS ---
    const matEstrutura = new THREE.MeshPhongMaterial({ color: 0xff3366, flatShading: true }); // Rosa Choque
    const matVidro = new THREE.MeshPhongMaterial({ color: 0x99ccff, transparent: true, opacity: 0.3, depthWrite: false });
    const matChao = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true });
    const matMetal = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
    const matMecanismo = new THREE.MeshPhongMaterial({ color: 0x222222 });

    // --- 1. ESTRUTURA BÁSICA (A CAIXA) ---
    // Base
    const baseGeo = new THREE.BoxGeometry(10, 4, 10);
    const base = new THREE.Mesh(baseGeo, matEstrutura);
    base.position.y = 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Teto
    const tetoGeo = new THREE.BoxGeometry(10, 1, 10);
    const teto = new THREE.Mesh(tetoGeo, matEstrutura);
    teto.position.y = 13.5;
    teto.castShadow = true;
    group.add(teto);

    // Postes (4 cantos)
    const posteGeo = new THREE.BoxGeometry(0.5, 10, 0.5);
    const posicoes = [[4.75, 4.75], [-4.75, 4.75], [4.75, -4.75], [-4.75, -4.75]];
    posicoes.forEach(p => {
        const poste = new THREE.Mesh(posteGeo, matEstrutura);
        poste.position.set(p[0], 9, p[1]);
        poste.castShadow = true;
        group.add(poste);
    });

    // Vidros (Frente, Trás, Lados)
    const vidroLadoGeo = new THREE.BoxGeometry(0.1, 10, 9.5);
    const vidroFrenteGeo = new THREE.BoxGeometry(9.5, 10, 0.1);

    const vidroEsq = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroEsq.position.set(-4.95, 9, 0);
    group.add(vidroEsq);

    const vidroDir = new THREE.Mesh(vidroLadoGeo, matVidro);
    vidroDir.position.set(4.95, 9, 0);
    group.add(vidroDir);

    const vidroTras = new THREE.Mesh(vidroFrenteGeo, matVidro);
    vidroTras.position.set(0, 9, -4.95);
    group.add(vidroTras);
    
    // Vidro da frente é mais baixo para o painel de controle
    const vidroFrenteGeoCurto = new THREE.BoxGeometry(9.5, 8, 0.1);
    const vidroFrente = new THREE.Mesh(vidroFrenteGeoCurto, matVidro);
    vidroFrente.position.set(0, 10, 4.95);
    group.add(vidroFrente);

    // Chao interior
    const chaoGeo = new THREE.BoxGeometry(9.5, 0.1, 9.5);
    const chao = new THREE.Mesh(chaoGeo, matChao);
    chao.position.y = 4.05;
    chao.receiveShadow = true;
    group.add(chao);

    // Caixa de saída (Buraco)
    const saidaGeo = new THREE.BoxGeometry(3, 4, 3);
    const saida = new THREE.Mesh(saidaGeo, matChao);
    saida.position.set(-3.5, 2, 3.5);
    group.add(saida);

    // --- 2. PAINEL DE CONTROLE (Low Poly) ---
    const painelGeo = new THREE.BoxGeometry(6, 2, 2);
    const painel = new THREE.Mesh(painelGeo, matEstrutura);
    painel.position.set(0, 5, 5.5);
    painel.rotation.x = -Math.PI / 6;
    painel.castShadow = true;
    group.add(painel);

    // Joystick
    const joyBaseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
    const joyBase = new THREE.Mesh(joyBaseGeo, matMecanismo);
    joyBase.position.set(-1.5, 5.8, 6);
    joyBase.rotation.x = -Math.PI / 6;
    group.add(joyBase);

    const joyHasteGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const joyHaste = new THREE.Mesh(joyHasteGeo, matMetal);
    joyHaste.position.set(-1.5, 6.2, 6.2);
    joyHaste.rotation.x = -Math.PI / 6;
    group.add(joyHaste);

    const joyBolaGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const joyBola = new THREE.Mesh(joyBolaGeo, new THREE.MeshPhongMaterial({color: 0xff0000}));
    joyBola.position.set(-1.5, 6.6, 6.4);
    group.add(joyBola);

    // Botão Grande
    const btnGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const btn = new THREE.Mesh(btnGeo, new THREE.MeshPhongMaterial({color: 0x33ff33}));
    btn.position.set(1.5, 5.8, 6);
    btn.rotation.x = -Math.PI / 6;
    btn.castShadow = true;
    group.add(btn);


    // --- 3. MECANISMO DA GARRA (A Hierarquia Complexa) ---
    
    // Grupo Teto (Move-se em X e Z)
    const garraTetoGroup = new THREE.Group();
    garraTetoGroup.position.set(0, 13, 0); // Posição inicial no centro do teto
    group.add(garraTetoGroup);

    // Carrinho do teto
    const carrinhoGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const carrinho = new THREE.Mesh(carrinhoGeo, matMecanismo);
    garraTetoGroup.add(carrinho);

    // Grupo Cabo (Move-se apenas em Y, dentro do grupo Teto)
    const garraCaboGroup = new THREE.Group();
    garraTetoGroup.add(garraCaboGroup);

    // O Cabo (uma linha/cilindro longo)
    const caboGeo = new THREE.CylinderGeometry(0.05, 0.05, 10, 6);
    const cabo = new THREE.Mesh(caboGeo, matMetal);
    // Posicionamos o topo do cabo no centro do carrinho
    cabo.position.y = 5; 
    garraCaboGroup.add(cabo);

    // A Cabeça da Garra (onde os dedos se fixam)
    const cabecaGeo = new THREE.CylinderGeometry(0.5, 0.8, 1, 8);
    const cabeca = new THREE.Mesh(cabecaGeo, matMecanismo);
    cabeca.position.y = 0; // No fundo do cabo
    garraCaboGroup.add(cabeca);

    // Dedos da Garra (Hierarquia para abrir/fechar)
    const dedos = [];
    const matDedo = new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true });

    for (let i = 0; i < 3; i++) {
        const dedoPivot = new THREE.Group(); // Ponto de rotação do dedo
        dedoPivot.position.y = -0.3; // Ajustar à base da cabeça
        
        // Rodar os pivots 120 graus entre si
        dedoPivot.rotation.y = (Math.PI * 2 / 3) * i;
        garraCaboGroup.add(dedoPivot);

        // Parte superior do dedo
        const dedoSupGeo = new THREE.BoxGeometry(0.2, 1.5, 0.3);
        // Ajustar geometria para o pivot ficar no topo
        dedoSupGeo.translate(0, -0.75, 0.15); 
        const dedoSup = new THREE.Mesh(dedoSupGeo, matDedo);
        dedoSup.rotation.x = Math.PI / 8; // Ângulo inicial (aberto)
        dedoPivot.add(dedoSup);

        // Parte inferior (garra)
        const dedoInfGeo = new THREE.ConeGeometry(0.2, 1, 4);
        dedoInfGeo.translate(0, -0.5, 0);
        const dedoInf = new THREE.Mesh(dedoInfGeo, matDedo);
        dedoInf.position.set(0, -1.5, 0.3);
        dedoInf.rotation.x = -Math.PI / 4;
        dedoSup.add(dedoInf); // Adicionar ao dedo superior

        dedos.push(dedoSup); // Guardamos a parte superior que é a que vamos rodar
    }

    // Retornamos as partes que precisamos de animar
    return {
        caixa: group,
        mecanismoTeto: garraTetoGroup, // Move X, Z
        mecanismoCabo: garraCaboGroup, // Move Y
        dedos: dedos // Roda X (abrir/fechar)
    };
}