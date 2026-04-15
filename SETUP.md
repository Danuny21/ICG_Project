# Setup & Instruções - Claw Machine

## Configuração Inicial

### Requisitos

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Servidor HTTP (para evitar CORS issues)

### Opção 1: Python (SimpleHTTPServer)

```bash
python -m http.server 8000
# Aceder a: http://localhost:8000
```

### Opção 2: Node.js (http-server)

```bash
npm install -g http-server
http-server
# Aceder a: http://localhost:8080
```

### Opção 3: VS Code Live Server

Extensão recomendada: **Live Server** (Ritwick Dey)

- Instalar extensão
- Botão direito em `index.html` → "Open with Live Server"

---

## Como Jogar a Claw Machine

### 1. Iniciar o Jogo

- Abre `http://localhost:8000` no browser
- Pressiona **SPACE** ou clica no botão "PRESSIONA SPACE"
- Tens **30 segundos** cada turno!

### 2. Controles

| Tecla | Ação |
| ------- | ---- |
| Setas (esquerda/direita) | Mover garras para esquerda/direita |
| Setas (cima/baixo) | Mover garras para frente/atrás |
| `SPACE` | Iniciar novo jogo |

### 3. Objetivos & Dinâmica

**Objetivo:** Apanhar brinquedos coloridos com as garras!

**Dinâmica:**

1. Move as garras até perto de um brinquedo
2. Ajusta a profundidade (A/D) para alinhá-lo bem
3. Pressiona ENTER para fechar as garras
4. Se conseguisses apanhar, o brinquedo sai e ganhas 10 pontos
5. As garras retornam sozinhas ao topo

**Pontuação:**

- Cada brinquedo apanhado = **10 pontos**
- Máx 8 brinquedos = 80 pontos possíveis
- Tempo limite: 30 segundos por turno

### 4. Feedback Visual

- **Confetis**: Disparam quando apanhas com sucesso
- **Painel UI**: Mostra estado, tempo, pontos e brinquedos apanhados
- **Console**: Mensagens de debug (F12 para abrir)

---

## Setup do Desenvolvimento

### Estrutura de Pastas

```text
src/
├── js/
│   ├── main.js               # Orquestração principal
│   ├── models/
│   │   ├── capsuleModel.js   # Modelo cápsula
│   │   ├── clawMachine.js    # Modelo 3D da máquina
│   │   ├── confetti.js       # Partículas
│   ├── systems/
│   │   ├── CapsuleOpener.js  # Sistema antigo (backup)
│   │   ├── ClawController.js # Lógica do jogo
│   │   ├── PhysicsSystem.js  # Física
│   │   ├── PrizeLoader.js    # Carregamento de prémios
│   └── glb/                  # (pasta para modelos glb, se existir)
└── styles/
    └── style.css             # Estilo cyberpunk
```

---

## Troubleshooting

### CORS Error / Failed to fetch

**Problema**: Abriste HTML diretamente no browser (`file://`)
**Solução**: Usa um servidor HTTP (Python, Node.js, ou VS Code Live Server)

### Cannot find module 'three'

**Problema**: Import map está inativo ou incorrecto
**Solução**: Verifica que o HTML tem `<script type="importmap">` correcto

### Garras não se movem

**Problema**: Inputs podem não estar registados
**Solução**: Clica no canvas primeiro, depois tenta as setas

### Brinquedos não são apanhados

**Problema**: Posição das garras não está alinhada
**Solução**: Ajusta com as setas até ver as garras align com o brinquedo, depois A/D para profundidade
