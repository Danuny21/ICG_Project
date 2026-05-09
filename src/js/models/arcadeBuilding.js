import * as THREE from "three";
import { carregarConjuntoTexturas } from "../systems/TextureLoader.js";
import { createRoundTable } from './table.js';
import { createChair } from './chair.js';
import { createBilliardTable } from './poolTable.js';
import { createArcadeMachine } from './arcadeMachine.js';
import { createPizza } from './pizza.js';
import { createJuiceGlass } from './juice.js';
import { createFloorPlant } from './plantFloor.js';
import { createTablePlant } from './plantTable.js';
import { createCashRegister } from './cashRegister.js';
import { createBalloons } from './ballon.js';

/**
 * Cria um edifício arcade retro com janela, porta, balcão, perciana e decorações extras.
 */
export function criarArcadeBuilding(scene) {
  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  // ── CONFIGURAÇÕES DE DIMENSÃO ──────────────────────────────────────────────
  const LARGURA = 100;
  const ALTURA = 50;
  const PROFUNDIDADE = 140;
  const ESPESSURA = 2;

  // ── MATERIAIS ────────────────────────────────────────────────────────────────
  // (Serão atualizados com texturas abaixo)
  let matParede = new THREE.MeshPhongMaterial({
    color: 0x1a1a3e,
    shininess: 30,
  });
  const matPiso = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 10,
  });
  const matNeonAzul = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 2,
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
  // --- Carregamento do Chão via Sistema ---
  const tamanhoAzulejo = 20;
  const repete = { x: LARGURA / tamanhoAzulejo, y: PROFUNDIDADE / tamanhoAzulejo };

  const t = carregarConjuntoTexturas(
    "./src/js/textures/floor/Tiles074_1K-JPG",
    ["Color", "NormalGL", "Roughness", "Displacement"],
    repete
  );

  const matChao = new THREE.MeshPhongMaterial({
    map: t.color,
    normalMap: t.normal,
    specularMap: t.roughness,
    shininess: 60,
    specular: 0x444444
  });

  // --- Carregamento da Parede ---
  const repeteParede = { x: 4, y: 2 };
  const tw = carregarConjuntoTexturas(
    "./src/js/textures/wall/PaintedPlaster017_1K-JPG",
    ["Color", "NormalGL", "Roughness", "Displacement"],
    repeteParede
  );

  // Atualiza o material da parede com as texturas
  matParede.map = tw.color;
  matParede.normalMap = tw.normal;
  matParede.specularMap = tw.roughness;
  matParede.color.set(0x666688); // Tint para manter o aspeto retro/escuro

  // Aumentar segmentos da geometria para o displacementMap funcionar
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA, PROFUNDIDADE), matChao);
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  buildingGroup.add(chao);

  // ── PAREDES ──────────────────────────────────────────────────────────────────

  // 1. Parede Traseira (COM JANELA E PERCIANA)
  const paredeTraseiraZ = -(PROFUNDIDADE / 2) - ESPESSURA / 2;
  const janelaLargura = 30;
  const janelaAltura = 18;
  const janelaPeitoril = 12;
  const largAsa = (LARGURA - janelaLargura) / 2;

  const trasEsq = new THREE.Mesh(new THREE.BoxGeometry(largAsa, ALTURA, ESPESSURA), matParede);
  trasEsq.position.set(-(LARGURA / 2) + largAsa / 2, ALTURA / 2, paredeTraseiraZ);
  buildingGroup.add(trasEsq);

  const trasDir = new THREE.Mesh(new THREE.BoxGeometry(largAsa, ALTURA, ESPESSURA), matParede);
  trasDir.position.set(LARGURA / 2 - largAsa / 2, ALTURA / 2, paredeTraseiraZ);
  buildingGroup.add(trasDir);

  const trasBaixo = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura, janelaPeitoril, ESPESSURA), matParede);
  trasBaixo.position.set(0, janelaPeitoril / 2, paredeTraseiraZ);
  buildingGroup.add(trasBaixo);

  const altCimaTras = ALTURA - janelaPeitoril - janelaAltura;
  const trasCima = new THREE.Mesh(new THREE.BoxGeometry(janelaLargura, altCimaTras, ESPESSURA), matParede);
  trasCima.position.set(0, ALTURA - altCimaTras / 2, paredeTraseiraZ);
  buildingGroup.add(trasCima);

  const vidroTras = new THREE.Mesh(
    new THREE.BoxGeometry(janelaLargura - 0.1, janelaAltura - 0.1, ESPESSURA * 0.1),
    matVidro,
  );
  vidroTras.position.set(0, janelaPeitoril + janelaAltura / 2, paredeTraseiraZ + ESPESSURA * 0.3);
  buildingGroup.add(vidroTras);

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

  // Maçaneta interior
  const macanetaInt = macaneta.clone();
  macanetaInt.position.set(-portaLargura + 2, 0, -espessuraPorta / 2 - 0.4);
  portaGroup.add(macanetaInt);

  portaGroup.rotation.y = -Math.PI / 5;
  buildingGroup.add(portaGroup);

  // 4. Parede Direita (SÓLIDA)
  const paredeDirX = LARGURA / 2 + ESPESSURA / 2;
  const compLateralDir = PROFUNDIDADE + ESPESSURA * 2;
  const paredeDir = new THREE.Mesh(
    new THREE.BoxGeometry(ESPESSURA, ALTURA, compLateralDir),
    matParede,
  );
  paredeDir.position.set(paredeDirX, ALTURA / 2, 0);
  buildingGroup.add(paredeDir);

  // ── PERCIANA NA PAREDE TRASEIRA ───────────────────────────────────────────
  const percianaGroup = new THREE.Group();
  percianaGroup.position.set(0, janelaPeitoril + janelaAltura, paredeTraseiraZ + ESPESSURA * 0.3);

  const numLaminas = 22;
  const alturaLamina = 0.6;
  const espacamentoLamina = 0.1;
  const extensaoPerciana = 0.7;

  const matPerciana = new THREE.MeshPhongMaterial({ color: 0x33333d, shininess: 80, side: THREE.DoubleSide });

  for (let i = 0; i < numLaminas * extensaoPerciana; i++) {
    const lamina = new THREE.Mesh(
      new THREE.BoxGeometry(janelaLargura - 0.1, alturaLamina, ESPESSURA * 0.2),
      matPerciana,
    );
    lamina.rotation.x = -Math.PI / 8;
    lamina.position.y = -(i * (alturaLamina + espacamentoLamina)) - alturaLamina / 2;
    percianaGroup.add(lamina);
  }

  const barraInferior = new THREE.Mesh(
    new THREE.BoxGeometry(janelaLargura - 0.1, 1.2, ESPESSURA * 0.4),
    matMetal,
  );
  barraInferior.position.y = -(numLaminas * extensaoPerciana * (alturaLamina + espacamentoLamina)) - 0.6;
  percianaGroup.add(barraInferior);
  buildingGroup.add(percianaGroup);

  // ── O BALCÃO DE ATENDIMENTO ──────────────────────────────────────────────
  const balcaoGroup = new THREE.Group();
  // Encostar à parede da porta (frente, Z) e manter na esquerda, mas afastada da parede lateral (X)
  balcaoGroup.position.set(-(LARGURA / 2) + 15, 0, PROFUNDIDADE / 2 - 28);

  const balcaoAltura = 8;
  const balcaoBase = new THREE.Mesh(
    new THREE.BoxGeometry(8, balcaoAltura, 70), // Bem mais esticado
    matBalcao,
  );
  balcaoBase.position.set(0, balcaoAltura / 2, 0);
  balcaoGroup.add(balcaoBase);

  const tampoAltura = 1;
  const balcaoTampo = new THREE.Mesh(
    new THREE.BoxGeometry(9, tampoAltura, 71.5), // Acompanha o aumento
    matMetal,
  );
  balcaoTampo.position.set(0, balcaoAltura + tampoAltura / 2, 0);
  balcaoGroup.add(balcaoTampo);

  const neonBalcao = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 0.4, 70.5), // Acompanha o aumento
    matNeonAzul,
  );
  neonBalcao.position.set(0, 5, 0);
  balcaoGroup.add(neonBalcao);



  balcaoGroup.scale.set(0.8, 0.8, 0.8);

  // Adicionar Caixa Registadora no balcão
  const cashReg = createCashRegister();
  cashReg.position.set(0, 9.0, 20); // Em cima do tampo (Y=9.0 local), mais para a frente (Z=20)
  cashReg.rotation.y = -Math.PI / 2; // Virada para quem atende (-X)
  balcaoGroup.add(cashReg);

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

  criarNeon(LARGURA, 0.5, 0.5, 0, 0.25, -(PROFUNDIDADE / 2), matNeonAzul);
  criarNeon(0.5, 0.5, PROFUNDIDADE, -(LARGURA / 2), 0.25, 0, matNeonAzul);
  criarNeon(0.5, 0.5, PROFUNDIDADE, LARGURA / 2, 0.25, 0, matNeonAzul);

  // ── LUZES ────────────────────────────────────────────────────────────────
  const light1 = new THREE.PointLight(0x00ffff, 400, 100);
  light1.position.set(-20, 40, -10);
  buildingGroup.add(light1);

  const light2 = new THREE.PointLight(0x00ffff, 400, 100);
  light2.position.set(20, 40, -10);
  buildingGroup.add(light2);

  // ── DECORAÇÃO EXTRA (Mesas, Bilhar, Arcades) ──────────────────────────────
  const SCALE_FACTOR = 3;

  // 1. Máquinas de Arcade: "do lado" (ao longo da parede direita, parte traseira)
  const coresArcade = [0xff3333, 0x33ff33, 0x3333ff, 0xffff33];
  for (let i = 0; i < 4; i++) {
    const maquina = createArcadeMachine(coresArcade[i]);
    maquina.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    // Parede direita é X=50 (LARGURA/2). Como o pivot traseiro está em Z=0 local,
    // colocar X=50 encosta exatamente as costas da máquina à parede.
    maquina.position.set(50, 0, -55 + i * 12);
    maquina.rotation.y = -Math.PI / 2; // Viradas para a esquerda (centro)
    buildingGroup.add(maquina);
  }

  // 2. Mesa de Bilhar: "ao lado da janela" (parede traseira)
  const bilhar = createBilliardTable();
  const bilharScale = SCALE_FACTOR * 1.5; // Aumentar em 50%
  bilhar.scale.set(bilharScale, bilharScale, bilharScale);
  // Janela está no centro (X=0) e em Z=-70 (parede traseira).
  // Mover mais para o fundo para ficar perfeitamente centralizada e enquadrada com a janela.
  bilhar.position.set(0, 0, -55);
  bilhar.rotation.y = Math.PI / 2; // Rodada para ficar paralela à janela
  buildingGroup.add(bilhar);

  // 3. Mesas redondas: "parede oposta ao balcão" (parede direita, parte frontal)
  const posMesas = [
    { x: 32, z: 15 },
    { x: 32, z: 45 }
  ];

  posMesas.forEach((pos, index) => {
    const mesa = createRoundTable();
    mesa.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    mesa.position.set(pos.x, 0, pos.z);
    
    // Adicionar comida/bebidas/plantas ao tampo da mesa (local Y=3.1)
    if (index === 0) {
      const pizza = createPizza();
      pizza.position.set(0, 3.1, 0);
      mesa.add(pizza);

      const juice = createJuiceGlass();
      juice.position.set(1.2, 3.1, 0.5);
      mesa.add(juice);

      const juice2 = createJuiceGlass();
      juice2.position.set(-1.0, 3.1, -0.8);
      mesa.add(juice2);
    } else {
      const plant = createTablePlant();
      plant.position.set(0, 3.1, 0);
      mesa.add(plant);

      const juice = createJuiceGlass();
      juice.position.set(1.0, 3.1, -0.5);
      mesa.add(juice);
    }

    buildingGroup.add(mesa);

    const offsetCadeira = 9;

    // Cadeira 1 (Frente)
    const cadeira1 = createChair();
    cadeira1.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    cadeira1.position.set(pos.x, 0, pos.z - offsetCadeira);
    cadeira1.rotation.y = 0;
    buildingGroup.add(cadeira1);

    // Cadeira 2 (Trás)
    const cadeira2 = createChair();
    cadeira2.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    cadeira2.position.set(pos.x, 0, pos.z + offsetCadeira);
    cadeira2.rotation.y = Math.PI;
    buildingGroup.add(cadeira2);

    // Cadeira 3 (Esquerda)
    const cadeira3 = createChair();
    cadeira3.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    cadeira3.position.set(pos.x - offsetCadeira, 0, pos.z);
    cadeira3.rotation.y = Math.PI / 2;
    buildingGroup.add(cadeira3);

    // Cadeira 4 (Direita)
    const cadeira4 = createChair();
    cadeira4.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
    cadeira4.position.set(pos.x + offsetCadeira, 0, pos.z);
    cadeira4.rotation.y = -Math.PI / 2;
    buildingGroup.add(cadeira4);
  });

  // 4. Plantas de chão nos cantos
  const floorPlant1 = createFloorPlant();
  floorPlant1.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
  floorPlant1.position.set(-45, 0, 65); // Canto esquerdo junto à porta
  buildingGroup.add(floorPlant1);

  const floorPlant2 = createFloorPlant();
  floorPlant2.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
  floorPlant2.position.set(45, 0, -65); // Canto direito ao fundo (perto das arcades)
  buildingGroup.add(floorPlant2);

  // 5. Balões decorativos
  const balloons = createBalloons();
  balloons.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
  balloons.position.set(-25, 0, 45); // Perto do balcão e da porta
  buildingGroup.add(balloons);

  return {
    grupo: buildingGroup,
    porta: portaGroup,
    balcao: balcaoGroup,
    perciana: percianaGroup,
  };
}
