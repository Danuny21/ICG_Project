# Claw Machine - Projeto ICG (Three.js)

Uma experiência interativa de máquina de garras (arcade) desenvolvida com **Three.js**, focada em física realista, estética modular e personalização.

## Funcionalidades Principais

- **Física Realista (Rapier3D)**: Simulação completa de colisões, gravidade e o mecanismo de garra.
- **Arquitetura Modular**: Lógica separada em sistemas especializados (`Physics`, `Spawner`, `Interaction`, `Opener`).
- **Sistema de Prémios**: Mais de 22 modelos de animais (`Kenney Assets`), totalmente localizados para PT-PT e com suporte a animações.
- **Temas Dinâmicos**: Três modos visuais distintos:
  - **Clássico**: A estética tradicional das arcades.
  - **Cyberpunk**: Cores vibrantes, néons e atmosfera futurista.
  - **Floresta**: Ambiente natural e tons orgânicos.
- **Efeitos Visuais**: Sistema de confetis, UI dinâmica de revelação de prémio e transições de câmara suaves.

## Como Jogar

### Controles

- **Setas (◄ ▲ ► ▼)**: Mover a garra nas direções X e Z.
- **ESPAÇO**: Descer a garra e tentar apanhar uma cápsula.
- **ESPAÇO (após apanhar)**: Abrir a cápsula e revelar o prémio.
- **Orbit Controls (Rato)**: Rodar e fazer zoom para ver a máquina de qualquer ângulo.

### Executar Localmente

Para evitar problemas de CORS com os loaders de modelos 3D, recomenda-se o uso de um servidor local:

```bash
# Exemplo com Python
python -m http.server 8000
# Aceder em: http://localhost:8000
```

## Estrutura do Projeto

```text
src/
├── js/
│   ├── main.js              # Ponto de entrada e orquestração
│   ├── systems/             # Sistemas de lógica operacional
│   │   ├── PhysicsSystem.js   # Simulação física com Rapier3D
│   │   ├── CapsuleSpawner.js  # Lógica de geração de cápsulas e exclusão
│   │   ├── InteractionSystem.js # Gestão de cliques e seleção de cápsulas
│   │   ├── CapsuleOpener.js   # Fluxo de abertura (atualizarCapsula)
│   │   └── ClawAnimation.js   # Máquina de estados da garra (atualizarAnimacaoGarra)
│   ├── models/              # Definições geométricas (Three.js)
│   │   ├── clawMachine.js     # Estrutura 3D da arcade
│   │   ├── capsuleModel.js    # Geometria da cápsula e dobradiça
│   │   ├── confetti.js        # Sistema de partículas (confetis)
│   │   └── PrizeLoader.js     # Carregador assíncrono de modelos GLB
│   ├── config/              # Parâmetros, Temas e Dificuldade
│   └── utils/               # Funções matemáticas auxiliares
└── styles/                  # Estilização da interface (CSS)
```

## Tecnologias

- **Three.js**: Motor gráfico para renderização 3D.
- **Rapier3D**: Motor de física de alta performance.
- **lil-gui**: Controlos de interface para depuração e troca de temas.
- **JavaScript (ES6+)**: Lógica e modularização.

---
**Autor**: Daniel Nunes
**Âmbito**: Projeto para a cadeira de Introdução à Computação Gráfica.
**UA - Universidade de Aveiro**
