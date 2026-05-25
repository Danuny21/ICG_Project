# Claw Machine 3D - Projeto ICG

## Sobre o Projeto

Este projeto consiste numa experiência interativa de uma máquina de garras (Claw Machine) inserida num ambiente de salão de jogos (Arcade). Foi desenvolvido no âmbito da cadeira de Introdução à Computação Gráfica, recorrendo inteiramente a tecnologias web, mais especificamente Three.js para a renderização gráfica em 3D e Rapier3D para a simulação de física realista.

O objetivo é proporcionar uma simulação lúdica onde o utilizador pode controlar uma garra mecânica, tentar apanhar cápsulas e colecionar os diversos prémios em formato de modelos 3D que se encontram no interior das mesmas.

## Funcionalidades e Características

- Simulação Física Realista: Através do motor Rapier3D, todas as cápsulas dentro da máquina têm colisão dinâmica e gravidade, o que faz com que a interação da garra seja realista e imprevisível, como numa máquina de garras real.
- Sistema de Coleção de Prémios: Existem dezenas de modelos 3D (baseados em assets do Kenney) que podem ser recolhidos e visualizados. Cada cápsula apanhada gera um prémio de forma aleatória.
- Modos e Temas Visuais: O ambiente reage a três temas distintos que alteram a iluminação geral da cena (Clássico, Cyberpunk e Floresta), garantindo estéticas bastante diferentes através de um menu de controlo lateral.
- Efeitos Visuais: Implementação de luzes dinâmicas, sombras, materiais fisicamente baseados (PBR), e até um sistema de partículas personalizado (confetis) que é acionado na revelação de um prémio.
- Interatividade e Câmara: Sistema de câmaras gerido automaticamente para alternar e focar a garra durante o jogo, aproximando em seguida a cápsula na altura de revelar o prémio. Além disso, os controlos permitem rotacionar livremente a cena e interagir com o ambiente com o rato e o teclado.

## Como Jogar

A interação divide-se em fases de movimento da garra e abertura da cápsula.

### Controlos Principais

- Teclas de Setas (Cima, Baixo, Esquerda, Direita): Movem a garra nos eixos horizontais sobre a montanha de cápsulas. A garra está limitada pelas paredes de vidro da máquina.
- Tecla Espaço (Descer Garra): Inicia a animação de descida. A garra vai tentar apanhar a cápsula que estiver imediatamente por baixo.
- Tecla Espaço (Após apanhar a cápsula e esta cair no buraco): Inicia a sequência de abertura da cápsula para mostrar o modelo 3D do prémio conquistado.
- Rato (Arrastar e Scroll): Permite usar os OrbitControls para rodar a câmara, aproximar ou afastar a vista sobre toda a sala arcade.
- Dispositivos Móveis (Mobile): O jogo é compatível com smartphones e tablets. Ao aceder num dispositivo móvel, surgem controlos táteis no ecrã (joystick ou botões virtuais) para mover a garra e um botão para a descer / abrir a cápsula. Pode também usar o toque para rodar a câmara.

## Como Executar Localmente

Como o projeto faz o carregamento de diversos modelos 3D (.glb) e texturas externas, é necessário corrê-lo num servidor local para evitar bloqueios de segurança do browser (erros de CORS).

### Opção Recomendada: VS Code Live Server

Se utilizar o Visual Studio Code, esta é a forma mais simples:

1. Instale a extensão **Live Server** (de Ritwick Dey).
2. Clique com o botão direito do rato no ficheiro `index.html` e selecione **"Open with Live Server"**.
3. O jogo irá abrir automaticamente no seu browser.

### Opção Alternativa: Python

1. Garanta que tem o Python instalado.
2. Abra o terminal na pasta raiz do projeto e execute:

   ```bash
   python -m http.server 8000
   ```

3. Aceda a `http://localhost:8000` no seu browser.

## Estrutura do Projeto

O código encontra-se fortemente modularizado, separando a construção dos objetos visuais da lógica de sistemas operacionais do jogo.

src/
|-- js/
|   |-- main.js (Ponto de entrada, inicialização da cena e do ciclo de renderização principal)
|   |-- config/ (Definições visuais, temas de iluminação e variáveis de configuração globais)
|   |-- systems/ (Sistemas de processamento lógico contínuo)
|   |   |-- PhysicsSystem.js (Integração do motor físico Rapier3D e atualização de colisões)
|   |   |-- ClawAnimation.js (Máquina de estados da garra: repouso, descida, fechar, subida e retorno)
|   |   |-- ClawController.js (Gestão dos inputs do utilizador para mover os carris da garra)
|   |   |-- CapsuleSpawner.js (Criação inicial das múltiplas cápsulas físicas com cores variadas)
|   |   |-- CapsuleOpener.js (Animação detalhada da separação das metades da cápsula de prémio)
|   |   |-- PrizeLoader.js e PrizeInspector.js (Carregamento assíncrono e inspeção de modelos GLB)
|   |   |-- InteractionSystem.js (Gestão de cliques do rato sobre os elementos da interface do mundo e UI)
|   |   |-- CameraManager.js e CameraCollision.js (Gestão de transições de visão e limitações da perspetiva)
|   |   |-- CollectionManager.js (Sistema de armazenamento do histórico e inventário da coleção de prémios)
|   |-- models/ (Geometrias e elementos que compõem o cenário 3D)
|   |   |-- clawMachine.js (Construção hierárquica principal da máquina de garras, cabine e painéis)
|   |   |-- arcadeBuilding.js, exterior.js, building.js (As paredes, teto e exterior da sala de jogos)
|   |   |-- capsule.js (Construção do modelo 3D de uma cápsula do zero com materiais transparentes)
|   |   |-- confetti.js (Lógica do emissor de partículas usado na vitória)
|   |   |-- (Vários outros ficheiros para decoração: chair.js, table.js, poolTable.js, lamp.js, etc.)
|   |-- textures/ (Imagens carregadas pelo TextureLoader aplicadas em materiais de jogo)
|-- styles/
|   |-- style.css (Estilização da interface do utilizador 2D, botões, notificações e painéis sobrepostos)
|-- index.html (Estrutura base da interface web, import maps para bibliotecas, e UI em HTML)

## Detalhes Técnicos e Funcionamento

A arquitetura de renderização baseia-se num ciclo de jogo (Game Loop) contínuo, gerido através da função requestAnimationFrame padrão do ecossistema Web.

A cada frame gerado, ocorrem os seguintes processos principais:

1. Física: O motor Rapier3D avança a simulação no tempo. Após os cálculos termodinâmicos e vetoriais, as coordenadas (posição e rotação) produzidas pelo simulador são extraídas e aplicadas de forma espelhada aos objetos visuais (meshes) criados pelo Three.js, fazendo as cápsulas cair e ressaltar de forma natural.
2. Controlo e Máquina de Estados: O script central verifica o estado em que a garra se encontra. Se o utilizador iniciar a jogada, a máquina transita pelos estados interpolados de deslocamento vertical, rotação e atrito da garra para agarrar os objetos sob ela, independentemente das ações do teclado.
3. Interpolação de Câmara: O gestor de câmara calcula a transição suave entre a perspetiva de jogabilidade e a perspetiva cinematográfica usada para admirar um novo prémio adquirido, reajustando também o campo de visão (FOV).
4. Renderização Final: A cena montada contendo a geometria, iluminações, cálculo de sombras em tempo real e materiais PBR é enviada para o WebGLRenderer, e desenhada no canvas final do utilizador.

O sistema de iluminação recorre a luzes ambiente globais misturadas com uma luz direcional capaz de projetar sombras resolutas nas cápsulas e na cena. Vários grupos de PointLights e SpotLights emitem focos coloridos e de contraste para simular luzes de teto fluorescentes e painéis de neon consoante o tema selecionado no menu lil-gui.

## Tecnologias Utilizadas

- Three.js: Biblioteca core para gestão e construção do universo 3D, gráficos e WebGL.
- Rapier3D: Motor de física Rust/WebAssembly de alto desempenho para deteção de colisões em tempo real e integração de gravidade.
- lil-gui: Ferramenta de desenvolvimento acoplada para criar o painel de debug flutuante utilizado na transição e teste dos diferentes temas do jogo.
- HTML5, CSS3, e JavaScript Moderno (ES6+): Base estrutural nativa de apresentação visual na web. Toda a lógica de jogo corre em cliente.

## Uso de Inteligência Artificial

- Sincronização Física/Visual: Apoio no debugging e implementação da sincronização de coordenadas entre o motor Rapier3D e o Three.js.
- Arquitetura Lógica: Sugestão e estruturação das máquinas de estados responsáveis pelo ciclo de vida da garra e das cápsulas.
- Gestão de Assets 3D: Resolução de erros na importação de modelos no formato .glb e na execução das respetivas animações.
- Debug e Resolução de Bugs no Geral: Assistência na identificação de anomalias lógicas, análise de comportamentos inesperados e propostas para a correção de falhas gerais durante o desenvolvimento do projeto.

---
Autor: Daniel Nunes
Âmbito: Projeto para a cadeira de Introdução à Computação Gráfica
Instituição: UA - Universidade de Aveiro
