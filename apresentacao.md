# Roteiro da Demonstração - Claw Machine (ICG)

Este documento serve como guia para a gravação do vídeo demonstrativo do projeto e para testar todas as funcionalidades desenvolvidas de forma sistemática.

## 1. Introdução e Visão Geral
- **Ação:** Começar a gravação com a câmara centrada na máquina de garras.
- **Narrativa:** "Olá, o meu nome é Daniel Nunes e este é o meu projeto para a cadeira de Introdução à Computação Gráfica. Desenvolvi uma Claw Machine (Máquina de Garras) interativa em 3D usando Three.js e Rapier3D para a física."
- **Demonstração:** Usar os OrbitControls (rato) para rodar a câmara à volta da máquina e fazer zoom, evidenciando a estrutura 3D, a iluminação inicial e as cápsulas empilhadas lá dentro.

## 2. Temas Visuais (lil-gui)
- **Ação:** Mostrar o painel de controlo (lil-gui) no canto superior direito.
- **Narrativa:** "O projeto possui um sistema de temas dinâmicos que altera a iluminação e as cores de toda a cena em tempo real."
- **Demonstração:** 
  1. Mostrar o tema **Clássico** (padrão).
  2. Mudar para o tema **Cyberpunk** (mostrar os néons, cores vibrantes e atmosfera futurista).
  3. Mudar para o tema **Floresta** (mostrar os tons mais orgânicos e ambiente natural).
  - *Dica:* Pode manter o seu tema favorito para o resto da demonstração.

## 3. Jogabilidade e Física
- **Ação:** Voltar a centrar a câmara na zona de jogo.
- **Narrativa:** "O sistema de física foi implementado usando o motor Rapier3D, garantindo colisões e gravidade altamente realistas para todas as cápsulas."
- **Demonstração:** 
  1. Usar as **Setas do Teclado (◄ ▲ ► ▼)** para mover a garra sobre o monte de cápsulas. Explicar como ela se restringe aos limites da caixa.
  2. Pressionar **ESPAÇO** para descer a garra.
  3. Mostrar o mecanismo de fecho da garra. Se apanhar uma cápsula, mostrar o transporte automático até à conduta de saída. (Se falhar a primeira vez, é normal! Mostra a aleatoriedade realista do jogo. Tente mais uma vez).

## 4. Revelação do Prémio e Efeitos Visuais
- **Ação:** Esperar que a cápsula caia pelo buraco de prémio.
- **Narrativa:** "Depois de recolhermos uma cápsula com sucesso, entramos na fase de revelação do prémio, onde temos mais de 22 modelos de animais diferentes."
- **Demonstração:** 
  1. Pressionar **ESPAÇO** novamente (ou seguir as instruções na UI) para abrir a cápsula.
  2. Focar na animação de abertura (a cápsula a separar-se).
  3. Realçar a **Revelação do Prémio**:
     - O disparo do sistema de partículas (Confetis).
     - A UI dinâmica (Nome do prémio em português).
     - O modelo 3D (GLB) do animal a surgir no ecrã.
  4. (Opcional) Tentar apanhar um segundo prémio num corte rápido do vídeo para demonstrar a variedade dos prémios.

## 5. Arquitetura e Código (Como foi feito/editado)
- **Ação:** Mostrar uma vista geral do projeto ou sobrepor excertos de código/estrutura.
- **Narrativa:** "A nível técnico, o código foi organizado de forma modular. Caso queiram testar ou editar componentes específicos, esta é a organização da pasta `src/js/`:"
  - **`PhysicsSystem.js`**: Podem alterar aqui propriedades de restituição (salto) ou atrito do Rapier3D.
  - **`CapsuleSpawner.js`**: Onde se define quantas cápsulas são geradas no início e as suas cores.
  - **`ClawAnimation.js`**: Máquina de estados. Se quiserem alterar a velocidade da garra a descer, é feito neste ficheiro.
  - **`PrizeLoader.js` / `InteractionSystem.js`**: Onde os modelos GLB do Kenney são carregados de forma assíncrona.

## 6. Conclusão
- **Narrativa:** "Muito obrigado pela atenção, espero que tenham gostado deste projeto interativo."
- **Ação:** Despedida e fecho do vídeo.
