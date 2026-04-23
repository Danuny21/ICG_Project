import * as THREE from "three";

/**
 * Cria um edifício arcade retro com janela, porta, balcão, perciana e decorações extras.
 */
export function criarArcadeBuilding(scene) {
  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  // ── CONFIGURAÇÕES DE DIMENSÃO ──────────────────────────────────────────────
  const LARGURA = 80;
  const ALTURA = 50;
  const PROFUNDIDADE = 70;
  const ESPESSURA = 2;

  // ── MATERIAIS ────────────────────────────────────────────────────────────────
  const matParede = new THREE.MeshPhongMaterial({
    color: 0x1a1a3e,
    shininess: 30,
  });
  const matPiso = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 10,
  });
  const matNeonRoxa = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    emissive: 0xff00ff,
    emissiveIntensity: 1,
  });
  const matNeonCiana = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 1,
  });
  const matVidro = new THREE.MeshPhongMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.15,
    shininess: 100,
    side: THREE.DoubleSide,
  });
  const matPorta = new THREE.MeshPhongMaterial({
    color: 0x222233,
    shininess: 40,
  });
  const matMetal = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    shininess: 100,
  });
  const matMetalDuto = new THREE.MeshPhongMaterial({
    color: 0x555566,
    shininess: 80,
    flatShading: true,
  }); // Metal mais fosco para dutos
  const matBalcao = new THREE.MeshPhongMaterial({
    color: 0x151525,
    shininess: 40,
  });
  // Materiais para decoração
  const matDeco1 = new THREE.MeshPhongMaterial({
    color: 0xff0033,
    emissive: 0xff0033,
    emissiveIntensity: 0.5,
  }); // Vermelho neon
  const matDeco2 = new THREE.MeshPhongMaterial({
    color: 0x33ff00,
    emissive: 0x33ff00,
    emissiveIntensity: 0.5,
  }); // Verde neon
  const matLetreiro = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.8,
  }); // Amarelo letreiro

  // ── PISO ─────────────────────────────────────────────────────────────────────
  const pisoGeom = new THREE.BoxGeometry(LARGURA, ESPESSURA, PROFUNDIDADE);
  const piso = new THREE.Mesh(pisoGeom, matPiso);
  piso.position.set(0, -ESPESSURA / 2, 0);
  buildingGroup.add(piso);

  // Padrão xadrez
  const tileSize = 5;
  const tilesX = LARGURA / tileSize;
  const tilesZ = PROFUNDIDADE / tileSize;

  for (let i = 0; i < tilesX; i++) {
    for (let j = 0; j < tilesZ; j++) {
      if ((i + j) % 2 === 0) {
        const tile = new THREE.Mesh(
          new THREE.PlaneGeometry(tileSize, tileSize),
          new THREE.MeshPhongMaterial({ color: 0x222244, shininess: 50 }),
        );
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
          i * tileSize - LARGURA / 2 + tileSize / 2,
          0.01,
          j * tileSize - PROFUNDIDADE / 2 + tileSize / 2,
        );
        buildingGroup.add(tile);
      }
    }
  }

  // ── PAREDES ──────────────────────────────────────────────────────────────────

  // 1. Parede Traseira
  const paredeTras = new THREE.Mesh(
    new THREE.BoxGeometry(LARGURA, ALTURA, ESPESSURA),
    matParede,
  );
  paredeTras.position.set(0, ALTURA / 2, -(PROFUNDIDADE / 2) - ESPESSURA / 2);
  buildingGroup.add(paredeTras);

  // 2. Parede Esquerda
  const compLateral = PROFUNDIDADE + ESPESSURA * 2;
  const paredeEsq = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, ALTURA, compLateral),
    matParede,
  );
  paredeEsq.position.set(-(LARGURA / 2) - ESPESSURA / 2, ALTURA / 2, 0);
  buildingGroup.add(paredeEsq);

  // 3. Parede Frontal (COM VÃO PARA A PORTA)
  const portaLargura = 14;
  const portaAltura = 22;
  const paredeFrenteZ = PROFUNDIDADE / 2 + ESPESSURA / 2;
  const largPilar = (LARGURA - portaLargura) / 2;

  const pilarEsq = new THREE.Mesh(
    new THREE.BoxGeometry(largPilar, ALTURA, ESPESSURA),
    matParede,
  );
  pilarEsq.position.set(
    -(LARGURA / 2) + largPilar / 2,
    ALTURA / 2,
    paredeFrenteZ,
  );
  buildingGroup.add(pilarEsq);

  const pilarDir = new THREE.Mesh(
    new THREE.BoxGeometry(largPilar, ALTURA, ESPESSURA),
    matParede,
  );
  pilarDir.position.set(LARGURA / 2 - largPilar / 2, ALTURA / 2, paredeFrenteZ);
  buildingGroup.add(pilarDir);

  const altViga = ALTURA - portaAltura;
  const vigaFrente = new THREE.Mesh(
    new THREE.BoxGeometry(portaLargura, altViga, ESPESSURA),
    matParede,
  );
  vigaFrente.position.set(0, ALTURA - altViga / 2, paredeFrenteZ);
  buildingGroup.add(vigaFrente);

  // ── A PORTA FÍSICA ───────────────────────────────────────────────────────────
  const portaGroup = new THREE.Group();
  portaGroup.position.set(portaLargura / 2, portaAltura / 2, paredeFrenteZ);

  const espessuraPorta = ESPESSURA * 0.4;
  const portaMalha = new THREE.Mesh(
    new THREE.BoxGeometry(portaLargura, portaAltura, espessuraPorta),
    matPorta,
  );
  portaMalha.position.set(-portaLargura / 2, 0, 0);
  portaGroup.add(portaMalha);

  const macaneta = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    matMetal,
  );
  macaneta.position.set(-portaLargura + 2, 0, espessuraPorta / 2 + 0.4);
  portaGroup.add(macaneta);

  portaGroup.rotation.y = -Math.PI / 5;
  buildingGroup.add(portaGroup);

  // 4. Parede Direita (COM JANELA E PERCIANA)
  const paredeDirX = LARGURA / 2 + ESPESSURA / 2;
  const janelaLargura = 35;
  const janelaAltura = 18;
  const janelaPeitoril = 12;
  const largLateral = (compLateral - janelaLargura) / 2;

  const latTras = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, ALTURA, largLateral),
    matParede,
  );
  latTras.position.set(
    paredeDirX,
    ALTURA / 2,
    -(compLateral / 2) + largLateral / 2,
  );
  buildingGroup.add(latTras);

  const latFrente = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, ALTURA, largLateral),
    matParede,
  );
  latFrente.position.set(
    paredeDirX,
    ALTURA / 2,
    compLateral / 2 - largLateral / 2,
  );
  buildingGroup.add(latFrente);

  const latBaixo = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, janelaPeitoril, janelaLargura),
    matParede,
  );
  latBaixo.position.set(paredeDirX, janelaPeitoril / 2, 0);
  buildingGroup.add(latBaixo);

  const altCimaJanela = ALTURA - janelaPeitoril - janelaAltura;
  const latCima = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, altCimaJanela, janelaLargura),
    matParede,
  );
  latCima.position.set(paredeDirX, ALTURA - altCimaJanela / 2, 0);
  buildingGroup.add(latCima);

  // Vidro (recuado para dar espaço à perciana)
  const vidro = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA * 0.1, janelaAltura - 0.1, janelaLargura - 0.1),
    matVidro,
  );
  vidro.position.set(
    paredeDirX + ESPESSURA * 0.3,
    janelaPeitoril + janelaAltura / 2,
    0,
  );
  buildingGroup.add(vidro);

  // ── PERCIANA / ESTORE (NOVO) ────────────────────────────────────────────────
  const percianaGroup = new THREE.Group();
  percianaGroup.position.set(
    paredeDirX - ESPESSURA * 0.3,
    janelaPeitoril + janelaAltura,
    0,
  );

  const numLaminas = 25;
  const alturaLamina = 0.6;
  const espacamentoLamina = 0.1;
  const extensaoPerciana = 0.7; // 70% baixada

  const matPerciana = new THREE.MeshPhongMaterial({
    color: 0x33333d,
    shininess: 80,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < numLaminas * extensaoPerciana; i++) {
    const lamina = new THREE.Mesh(
      new THREE.BoxGeometry(ESPESSURA * 0.2, alturaLamina, janelaLargura - 0.1), // Ajustado para evitar flickaring nas bordas
      matPerciana,
    );
    // Ângulo das lâminas
    lamina.rotation.z = Math.PI / 8;
    lamina.position.y =
      -(i * (alturaLamina + espacamentoLamina)) - alturaLamina / 2;
    percianaGroup.add(lamina);
  }
  // Barra inferior mais grossa
  const barraInferior = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA * 0.4, 1.2, janelaLargura - 0.1),
    matMetal,
  );
  barraInferior.position.y =
    -(numLaminas * extensaoPerciana * (alturaLamina + espacamentoLamina)) - 0.6;
  percianaGroup.add(barraInferior);

  buildingGroup.add(percianaGroup);

  // ── O BALCÃO DE ATENDIMENTO ──────────────────────────────────────────────
  const balcaoGroup = new THREE.Group();
  balcaoGroup.position.set(-(LARGURA / 2) + 20, 0, PROFUNDIDADE / 4 + 5);

  const balcaoAltura = 12;
  const balcaoBase = new THREE.Mesh(
    new THREE.BoxGeometry(8, balcaoAltura, 25),
    matBalcao,
  );
  balcaoBase.position.set(0, balcaoAltura / 2, 0);
  balcaoGroup.add(balcaoBase);

  const tampoAltura = 1;
  const balcaoTampo = new THREE.Mesh(
    new THREE.BoxGeometry(9, tampoAltura, 26),
    matMetal,
  );
  balcaoTampo.position.set(0, balcaoAltura + tampoAltura / 2, 0);
  balcaoGroup.add(balcaoTampo);

  const neonBalcao = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 0.4, 25.2),
    matNeonCiana,
  );
  neonBalcao.position.set(0, 8, 0);
  balcaoGroup.add(neonBalcao);

  balcaoGroup.scale.set(0.8, 0.8, 0.8);
  buildingGroup.add(balcaoGroup);

  // ── TETO ──────────────────────────────────────────────────────────────────
  const teto = new THREE.Mesh(
    new THREE.BoxGeometry(
      LARGURA + ESPESSURA * 2,
      ESPESSURA,
      PROFUNDIDADE + ESPESSURA * 2,
    ),
    matParede,
  );
  teto.position.y = ALTURA + ESPESSURA / 2;
  buildingGroup.add(teto);

  // ── NEON RODAPÉ ───────────────────────────────────────────────────────────
  const criarNeon = (w, h, d, x, y, z, mat) => {
    const n = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    n.position.set(x, y, z);
    buildingGroup.add(n);
  };

  criarNeon(LARGURA, 0.5, 0.5, 0, 0.25, -(PROFUNDIDADE / 2), matNeonCiana);
  criarNeon(0.5, 0.5, PROFUNDIDADE, -(LARGURA / 2), 0.25, 0, matNeonRoxa);
  criarNeon(0.5, 0.5, PROFUNDIDADE, LARGURA / 2, 0.25, 0, matNeonRoxa);

  // ── LUZES ────────────────────────────────────────────────────────────────
  const light1 = new THREE.PointLight(0xff00ff, 500, 100);
  light1.position.set(-20, 40, -10);
  buildingGroup.add(light1);

  const light2 = new THREE.PointLight(0x00ffff, 500, 100);
  light2.position.set(20, 40, -10);
  buildingGroup.add(light2);

  return {
    grupo: buildingGroup,
    porta: portaGroup,
    balcao: balcaoGroup,
    perciana: percianaGroup,
  };
}
