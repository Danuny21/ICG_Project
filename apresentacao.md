# Esquema de Apresentação Final — ICG 2025/2026
> ⏱️ Duração total: **12–15 min** → Slides: 6–7 min | Demo ao vivo: 4–5 min  
> 📌 Usa **tópicos curtos**, nunca frases completas. Coloca **imagens/screenshots em quase todos os slides**.

---

## Slide 1 — Título
- Nome do projeto (destaque visual)
- Nome + número de aluno
- Link do projeto e do repositório
- Screenshot ou render apelativo do projeto como fundo/imagem principal

> 💡 *A primeira impressão conta — escolhe uma imagem impactante do teu projeto.*

---

## Slide 2 — O Projeto
- O que é? Uma frase de contexto (tema, inspiração)
- O que pode o utilizador fazer? (lista curta de funcionalidades principais)
- Three.js base ou com módulos adicionais? (quais?)
- Versão do Three.js utilizada

> 💡 *Um GIF ou screenshot da cena principal aqui ajuda a "vender" o projeto logo de início.*

---

## Slide 3 — Modelos & Scene Graph
- Lista dos modelos presentes na cena (criados por ti? importados? de onde?)
- Como está organizado o scene graph
- **Diagrama em árvore do scene graph** (obrigatório — faz no draw.io, Mermaid, ou à mão)

> 💡 *O diagrama é o elemento mais importante deste slide — dedica-lhe espaço.*  
> 💡 *Indica se os modelos são primitivas Three.js, GLTF/OBJ importados, ou gerados proceduralmente.*

---

## Slide 4 — Iluminação, Materiais & Texturas
- Tipos de materiais usados (`MeshStandardMaterial`, `MeshPhongMaterial`, etc.) e porquê
- Fontes de luz (tipo, quantidade, posição, cor)
- Shaders personalizados? (GLSL próprio ou de biblioteca?) — indica a origem
- Tipos de mapas de textura usados:
  - `map` (diffuse), `normalMap`, `roughnessMap`, `aoMap`, `envMap`, etc.
  - Propósito de cada um
  - Origem (criadas por ti, Poly Haven, etc.)

> 💡 *Side-by-side antes/depois (sem textura vs. com textura) é sempre muito eficaz visualmente.*

---

## Slide 5 — Animação
- Quais as animações existentes? (personagens, objetos, câmera, partículas…)
- Como são implementadas:
  - `requestAnimationFrame` / loop manual?
  - Three.js `AnimationMixer` + clips?
  - GSAP ou outra biblioteca?
- Detalhes relevantes: funções de easing, interpolação, trigonometria usada, etc.

> 💡 *Um pequeno diagrama de timeline ou uma sequência de frames pode ajudar a explicar animações complexas.*

---

## Slide 6 — Interação com o Utilizador
- Tipo de câmera (`PerspectiveCamera`, `OrthographicCamera`) e justificação
- Controlos de câmera (`OrbitControls`, `FlyControls`, etc.)
- Interações disponíveis:
  - ⌨️ Teclado — que teclas fazem o quê
  - 🖱️ Rato — cliques, drag, hover
  - 📋 Menus / GUI (ex: `dat.GUI`, `lil-gui`)

> 💡 *Uma tabela simples Tecla → Ação é muito legível neste slide.*

---

## Slide 7 — Desenvolvimento
- Ambiente de desenvolvimento (VS Code, Live Server, Vite, etc.)
- Organização do código (estrutura de ficheiros/módulos)
- Detalhes de implementação relevantes e não óbvios
- Screenshots do código se ilustrativo
- Dificuldades encontradas e como foram resolvidas

> 💡 *Sê honesto nas dificuldades — mostra que sabes identificar problemas técnicos.*

---

## Slide 8 — Uso de IA
- Ferramentas utilizadas (GitHub Copilot, ChatGPT, etc.)
- Para que tarefas concretas? — sê específico, por exemplo:
  - *"ChatGPT foi usado para debugar o mapeamento de UV nas texturas"*
  - *"Copilot sugeriu a lógica de travessia do Scene Graph"*
- Grau de dependência (sugestão pontual vs. geração de blocos de código)

> 💡 *Não tens de minimizar o uso de IA — o importante é seres transparente e demonstrares que entendes o que foi gerado.*

---

## Slide 9 — Performance & Conclusões
- Otimizações feitas:
  - **Instancing**: Uso de `InstancedMesh` para renderizar os *tokens* de ouro (moedas) sobre as mesas, colapsando o que seriam dezenas de *draw calls* numa única instrução de desenho na placa gráfica.
  - **Limpeza de Memória (Garbage Collection)**: Resolução de um *Memory Leak* no sistema de animações das cápsulas (`CapsuleOpener`). Sempre que uma cápsula termina de encolher, o sistema executa um `scene.remove(model)` obrigatório para libertar VRAM, evitando a acumulação de instâncias invisíveis.
  - **Geometrias & Sombras Otimizadas**: Substituição de modelos de faces sobrepostas pelo formato matemático limpo e volumétrico `ExtrudeGeometry` (ex: Triângulo do bilhar). Limitação assertiva de propriedades como `distance`, `decay`, e mapeamento de sombras nas luzes dinâmicas (`SpotLights`) criadas para o ciclo noturno, poupando cálculo de iluminação ociosa nas paredes exteriores.
  - **Ciclo de Vida Completo das Cápsulas (Physics + GPU + Array)**: Após a animação de abertura de uma cápsula, o sistema executa limpeza a três níveis em `_finalizeClose()`:
    1. **Motor de Física (Rapier3D)** — o `RigidBody` correspondente é removido do mundo físico via `world.removeRigidBody()`, impedindo que a simulação continue a calcular colisões para corpos invisíveis.
    2. **GPU (Three.js)** — cada `Mesh` da cápsula passa por `geometry.dispose()` e `material.dispose()`, libertando a VRAM ocupada pelos buffers de vértices e texturas.
    3. **Array de Estado** — a entrada da cápsula é removida do array global via `splice()`, eliminando-a dos ciclos de raycasting, sincronização de física e deteção de colisão com a porta, que processariam entradas mortas a cada frame.
  - **Ignorar Cápsulas Abertas na Sincronização de Física**: O método `_syncMeshes` do `PhysicsWorld` salta agora cápsulas com a flag `aberta = true`, evitando iteração desnecessária sobre entidades já descartadas antes de estas serem removidas do array.
  - **Pré-carregamento de Modelos GLTF (`preloadAllPrizes`)**: Os 19 modelos `.glb` de prémios eram carregados *on-demand* no momento do clique, causando freezes de 2-5 segundos (parse de geometria + upload de texturas para a GPU na thread principal). A solução foi criar uma função `preloadAllPrizes()` que carrega todos os ficheiros **em paralelo** durante o loading screen, antes do jogo arrancar. A partir desse momento, o `loadPrize()` encontra sempre o modelo em cache e entrega uma cópia via `SkeletonUtils.clone()` sem qualquer custo de I/O.
  - **Pré-compilação de Shaders do Pedestal de Inspeção**: O `PrizeInspector` criava geometrias e materiais `MeshStandardMaterial` (PBR) novos a cada clique num prémio da coleção. O Three.js compila o shader GLSL na **primeira vez que um material é renderizado**, processo que pode demorar 1-3 segundos na thread principal. A solução foi mover a construção do pedestal para o **construtor** do `PrizeInspector` (chamado no arranque), de modo a que a compilação ocorra no primeiro frame invisível — antes de qualquer interação do jogador. Nas utilizações seguintes, o pedestal é simplesmente tornado visível/invisível via `visible = true/false`, sem criar nem destruir objetos.
- Compatibilidade: funciona em diferentes browsers? E em smartphone?
- Features mais interessantes / de que mais te orgulhas
- O que farias diferente se começasses agora?

> 💡 *Termina com algo positivo — destaca a feature mais "wow" do teu projeto.*

---

## Slide 10 — Referências
- Livros, tutoriais, documentação oficial, assets
- **Não coloques só URLs** — indica o título e para que serviu
  - Ex: *Three.js Journey (Bruno Simon) — base de aprendizagem de materiais e shaders*
  - Ex: *Poly Haven (polyhaven.com) — texturas HDR e mapas PBR*

> 💡 *5 a 8 referências bem descritas são mais do que suficientes.*

---

## Checklist Final
- [ ] Slides em PDF exportados
- [ ] Imagem/screenshot em quase todos os slides
- [ ] Diagrama do Scene Graph incluído
- [ ] Demo ao vivo preparada e testada (4–5 min)
- [ ] Tempo total ensaiado (12–15 min)