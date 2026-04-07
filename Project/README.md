# Claw Machine - Projeto ICG (Three.js)

Projeto de Introdução à Computação Gráfica com tema de **Claw Machine** - uma máquina de garras para ganhar prémios!

## 📁 Estrutura do Projeto

```
claw-machine/
├── index.html                 # Ficheiro principal (entrypoint)
├── src/                       # Código-fonte
│   ├── js/
│   │   ├── main.js           # Script principal (inicialização da cena)
│   │   ├── systems/          # Sistemas de lógica
│   │   │   └── CapsuleOpener.js   # Sistema de abertura da cápsula
│   │   ├── models/           # Modelos 3D e loaders
│   │   │   ├── capsuleModel.js    # Cápsula (geometria própria)
│   │   │   ├── animalLoader.js    # Loader de modelos de animais
│   │   │   └── confetti.js        # Sistema de confetis
│   │   └── utils/            # Utilitários (em desenvolvimento)
│   └── styles/
│       └── style.css         # Estilos globais
│
├── assets/                    # Assets (modelos, texturas)
│   ├── models/               # Modelos 3D importados
│   │   └── kenney_cube-pets/  # Assets de animais (Kenney)
│   └── textures/             # Texturas (em desenvolvimento)
│
└── README.md                  # Este ficheiro

```

## 🚀 Como Usar

### Executar o Projeto
```bash
# Simples - abrir index.html num browser
# Ou usar um servidor local (recomendado para evitar CORS)

python -m http.server 8000
# Depois aceder a: http://localhost:8000
```

### Adicionar Novos Animais
1. Adicionar modelo GLB em `assets/models/`
2. Usar em `main.js`:
```javascript
carregarAnimal(scene, callback, 'nome-do-animal.glb');
```

## 📦 Pastas e Responsabilidades

| Pasta | Descrição |
|-------|-----------|
| `/src/js/main.js` | Inicialização: cena, câmara, renderer, controles |
| `/src/js/systems/` | Lógica complexa (CapsuleOpener, Claw logic, etc) |
| `/src/js/models/` | Modelos 3D e loaders (GLB, OBJ, etc) |
| `/src/js/utils/` | Funções auxiliares (math, helpers, etc) |
| `/src/styles/` | CSS e styling |
| `/assets/models/` | Modelos 3D importados (third-party, Kenney, etc) |
| `/assets/textures/` | Texturas e materiais |

## � Componentes Principais

### Claw Machine (`src/js/models/clawMachine.js`)
Modelo completo 3D da máquina de garras incluindo:
- **Base e estrutura** - Caixa principal com paredes
- **Teto e motor** - Cilindro vermelho rotativo
- **Sistema de garras** - 4 garras posicionadas radialmente
- **Brinquedos** - Objectos coloridos que podem ser apanhados

**Uso:**
```javascript
const clawMachine = criarClawMachine();
scene.add(clawMachine.grupo);

const brinquedos = criarBrinquedos(scene, 8);
```

### ClawController (`src/js/systems/ClawController.js`)
Sistema de controle completo do jogo:
- **Movimento das garras** (X, Z, profundidade)
- **Colisão e apanha** de brinquedos
- **Sistema de pontuação**
- **Timer de 30 segundos**
- **Controles de teclado**

**Controles:**
- `⬅️ ➡️ ⬆️ ⬇️` - Mover garras (X e Z)
- `A / D` - Aprofundar/Retirar garras
- `ENTER` - Fechar garras e tentar apanhar
- `SPACE` - Iniciar jogo

**Uso:**
```javascript
const gameController = new ClawController(clawMachine, brinquedos, scene, confetis);
gameController.update(time); // Cada frame
```

### CapsuleOpener (`src/js/systems/CapsuleOpener.js`)
Sistema antigo (ainda disponível) para animação de cápsula com prémio.

### Confetis (`src/js/models/confetti.js`)
Sistema de partículas que dispara quando apanhas um brinquedo.

## 🔧 Próximos Passos

- [x] Implementar a lógica completa da Claw Machine
- [x] Sistema de movimento e colisão
- [x] Sistema de pontuação
- [ ] Adicionar mais variedades de brinquedos
- [ ] Melhorar física de apanha
- [ ] Som e efeitos visuais
- [ ] Dificuldade progressiva
- [ ] Ranking de pontos

## 📚 Documentação

- **[SETUP.md](SETUP.md)** - Como jogar e configurar
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura técnica
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Resumo da implementação

---

**Autor**: Projeto ICG 2º Semestre - Universidade de Aveiro
