# Claw Machine 3D - Projeto ICG (Three.js)

## Sobre o Projeto

Este projeto consiste numa experiencia interativa de uma maquina de garras (Claw Machine) inserida num ambiente de salao de jogos (Arcade). Foi desenvolvido no ambito da cadeira de Introducao a Computacao Grafica, recorrendo inteiramente a tecnologias web, mais especificamente Three.js para a renderizacao grafica em 3D e Rapier3D para a simulacao de fisica realista.

O objetivo e proporcionar uma simulacao ludica onde o utilizador pode controlar uma garra mecanica, tentar apanhar capsulas e colecionar os diversos premios em formato de modelos 3D que se encontram no interior das mesmas.

## Funcionalidades e Caracteristicas

- Simulacao Fisica Realista: Atraves do motor Rapier3D, todas as capsulas dentro da maquina tem colisao dinamica e gravidade, o que faz com que a interacao da garra seja realista e imprevisivel, como numa maquina de garras real.
- Sistema de Colecao de Premios: Existem dezenas de modelos 3D (baseados em assets do Kenney) que podem ser recolhidos e visualizados. Cada capsula apanhada gera um premio de forma aleatoria.
- Modos e Temas Visuais: O ambiente reage a tres temas distintos que alteram a iluminacao geral da cena (Classico, Cyberpunk e Floresta), garantindo esteticas bastante diferentes atraves de um menu de controlo lateral.
- Efeitos Visuais: Implementacao de luzes dinamicas, sombras, materiais fisicamente baseados (PBR), e ate um sistema de particulas personalizado (confetis) que e acionado na revelacao de um premio.
- Interatividade e Camera: Sistema de camaras gerido automaticamente para alternar e focar a garra durante o jogo, aproximando em seguida a capsula na altura de revelar o premio. Alem disso, os controlos permitem rotacionar livremente a cena e interagir com o ambiente com o rato e o teclado.

## Como Jogar

A interacao divide-se em fases de movimento da garra e abertura da capsula.

### Controlos Principais

- Teclas de Setas (Cima, Baixo, Esquerda, Direita): Movem a garra nos eixos horizontais sobre a montanha de capsulas. A garra esta limitada pelas paredes de vidro da maquina.
- Tecla Espaco (Descer Garra): Inicia a animacao de descida. A garra vai tentar apanhar a capsula que estiver imediatamente por baixo.
- Tecla Espaco (Apos apanhar a capsula e esta cair no buraco): Inicia a sequencia de abertura da capsula para mostrar o modelo 3D do premio conquistado.
- Rato (Arrastar e Scroll): Permite usar os OrbitControls para rodar a camara, aproximar ou afastar a vista sobre toda a sala arcade.

## Como Executar Localmente

Como o projeto faz o carregamento de diversos modelos 3D (.glb) e texturas externas, e necessario corre-lo num servidor local para evitar bloqueios de seguranca do browser (erros de CORS).

### Opcao Recomendada: VS Code Live Server
Se utilizar o Visual Studio Code, esta e a forma mais simples:
1. Instale a extensao **Live Server** (de Ritwick Dey).
2. Clique com o botao direito do rato no ficheiro `index.html` e selecione **"Open with Live Server"**.
3. O jogo ira abrir automaticamente no seu browser.

### Opcao Alternativa: Python
1. Garanta que tem o Python instalado.
2. Abra o terminal na pasta raiz do projeto e execute:
   ```bash
   python -m http.server 8000
   ```
3. Aceda a `http://localhost:8000` no seu browser.

## Estrutura do Projeto

O codigo encontra-se fortemente modularizado, separando a construcao dos objetos visuais da logica de sistemas operacionais do jogo.

src/
|-- js/
|   |-- main.js (Ponto de entrada, inicializacao da cena e do ciclo de renderizacao principal)
|   |-- config/ (Definicoes visuais, temas de iluminacao e variaveis de configuracao globais)
|   |-- systems/ (Sistemas de processamento logico continuo)
|   |   |-- PhysicsSystem.js (Integracao do motor fisico Rapier3D e atualizacao de colisoes)
|   |   |-- ClawAnimation.js (Maquina de estados da garra: repouso, descida, fechar, subida e retorno)
|   |   |-- ClawController.js (Gestao dos inputs do utilizador para mover os carris da garra)
|   |   |-- CapsuleSpawner.js (Criacao inicial das multiplas capsulas fisicas com cores variadas)
|   |   |-- CapsuleOpener.js (Animacao detalhada da separacao das metades da capsula de premio)
|   |   |-- PrizeLoader.js e PrizeInspector.js (Carregamento assincrono e inspecao de modelos GLB)
|   |   |-- InteractionSystem.js (Gestao de cliques do rato sobre os elementos da interface do mundo e UI)
|   |   |-- CameraManager.js e CameraCollision.js (Gestao de transicoes de visao e limitacoes da perspetiva)
|   |   |-- CollectionManager.js (Sistema de armazenamento do historico e inventario da colecao de premios)
|   |-- models/ (Geometrias e elementos que compoem o cenario 3D)
|   |   |-- clawMachine.js (Construcao hierarquica principal da maquina de garras, cabine e paineis)
|   |   |-- arcadeBuilding.js, exterior.js, building.js (As paredes, teto e exterior da sala de jogos)
|   |   |-- capsule.js (Construcao do modelo 3D de uma capsula do zero com materiais transparentes)
|   |   |-- confetti.js (Logica do emissor de particulas usado na vitoria)
|   |   |-- (Varios outros ficheiros para decoracao: chair.js, table.js, poolTable.js, lamp.js, etc.)
|   |-- textures/ (Imagens carregadas pelo TextureLoader aplicadas em materiais de jogo)
|-- styles/
|   |-- style.css (Estilizacao da interface do utilizador 2D, botoes, notificacoes e paineis sobrepostos)
|-- index.html (Estrutura base da interface web, import maps para bibliotecas, e UI em HTML)

## Detalhes Tecnicos e Funcionamento

A arquitetura de renderizacao baseia-se num ciclo de jogo (Game Loop) continuo, gerido atraves da funcao requestAnimationFrame padrao do ecossistema Web.

A cada frame gerado, ocorrem os seguintes processos principais:
1. Fisica: O motor Rapier3D avanca a simulacao no tempo. Apos os calculos termodinâmicos e vetoriais, as coordenadas (posicao e rotacao) produzidas pelo simulador sao extraidas e aplicadas de forma espelhada aos objetos visuais (meshes) criados pelo Three.js, fazendo as capsulas cair e ressaltar de forma natural.
2. Controlo e Maquina de Estados: O script central verifica o estado em que a garra se encontra. Se o utilizador iniciar a jogada, a maquina transita pelos estados interpolados de deslocamento vertical, rotacao e atrito da garra para agarrar os objetos sob ela, independentemente das acoes do teclado.
3. Interpolacao de Camara: O gestor de camara calcula a transicao suave entre a perspetiva de jogabilidade e a perspetiva cinematografica usada para admirar um novo premio adquirido, reajustando tambem o campo de visao (FOV).
4. Renderizacao Final: A cena montada contendo a geometria, iluminacoes, calculo de sombras em tempo real e materiais PBR e enviada para o WebGLRenderer, e desenhada no canvas final do utilizador.

O sistema de iluminacao recorre a luzes ambiente globais misturadas com uma luz direcional capaz de projetar sombras resolutas nas capsulas e na cena. Varios grupos de PointLights e SpotLights emitem focos coloridos e de contraste para simular luzes de teto flourescentes e paineis de neon consoante o tema selecionado no menu lil-gui.

## Tecnologias Utilizadas

- Three.js: Biblioteca core para gestao e construcao do universo 3D, graficos e WebGL.
- Rapier3D: Motor de fisica Rust/WebAssembly de alto desempenho para deteccao de colisoes em tempo real e integracao de gravidade.
- lil-gui: Ferramenta de desenvolvimento acoplada para criar o painel de debug flutuante utilizado na transicao e teste dos diferentes temas do jogo.
- HTML5, CSS3, e JavaScript Moderno (ES6+): Base estrutural nativa de apresentacao visual na web. Toda a logica de jogo corre em cliente.

## Uso de Inteligencia Artificial

- Sincronizacao Fisica/Visual: Apoio no debugging e implementacao da sincronizacao de coordenadas entre o motor Rapier3D e o Three.js.
- Arquitetura Logica: Sugestao e estruturacao das maquinas de estados responsaveis pelo ciclo de vida da garra e das capsulas.
- Gestao de Assets 3D: Resolucao de erros na importacao de modelos no formato .glb e na execucao das respetivas animacoes.
- Debug e Resolucao de Bugs no Geral: Assistencia na identificacao de anomalias logicas, analise de comportamentos inesperados e propostas para a correcao de falhas gerais durante o desenvolvimento do projeto.

---
Autor: Daniel Nunes
Ambito: Projeto para a cadeira de Introducao a Computacao Grafica
Instituicao: UA - Universidade de Aveiro
