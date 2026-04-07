# Setup & Instruções - Claw Machine

## ⚙️ Configuração Inicial

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

## 🎮 Como Jogar a Claw Machine

### 1. Iniciar o Jogo
- Abre `http://localhost:8000` no browser
- Pressiona **SPACE** ou clica no botão "PRESSIONA SPACE"
- Tens **30 segundos** cada turno!

### 2. Controles

| Tecla | Ação |
|-------|------|
| `⬅️ ➡️` | Mover garras para esquerda/direita |
| `⬆️ ⬇️` | Mover garras para frente/atrás |
| `A` | Aprofundar as garras (descer) |
| `D` | Retirar as garras (subir) |
| `ENTER` | Fechar garras e tentar apanhar |
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
- ✅ Cada brinquedo apanhado = **10 pontos**
- ✅ Máx 8 brinquedos = 80 pontos possíveis
- 📊 Tempo limite: 30 segundos por turno

### 4. Feedback Visual
- **Confetis**: Disparam quando apanhas com sucesso
- **Painel UI**: Mostra estado, tempo, pontos e brinquedos apanhados
- **Console**: Mensagens de debug (F12 para abrir)

---

## 🏗️ Setup do Desenvolvimento

### Estrutura de Pastas
```
src/
├── js/
│   ├── main.js               # Orquestração principal
│   ├── systems/
│   │   ├── ClawController.js # Lógica do jogo
│   │   └── CapsuleOpener.js  # Sistema antigo (backup)
│   ├── models/
│   │   ├── clawMachine.js    # Modelo 3D da máquina
│   │   ├── confetti.js       # Partículas
│   │   └── animalLoader.js   # Loader de modelos (backup)
│   └── utils/
└── styles/
    └── style.css             # Estilo cyberpunk

assets/
├── models/                   # Modelos 3D importados
└── textures/                 # Texturas (futuro)
```

---

## 🐛 Troubleshooting

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

---

## 📝 Convenções Código

### Nomes de Ficheiros
- **Classes (Systems)**: `ClawController.js` (CamelCase)
- **Funções (Models)**: `clawMachine.js` (camelCase)
- **Estilos**: `style.css`

### Exemplo de Módulo
```javascript
import * as THREE from "three";

/**
 * Descrição
 * @param {Type} param - Descrição do param
 * @returns {Type} Descrição do retorno
 */
export function meuComponente(param) {
    // implementação
    return resultado;
}
```

### Exemplo de Classe
```javascript
export class MeuSistema {
    constructor(scene, configs = {}) {
        this.scene = scene;
        this.estado = "INICIAL";
    }

    update(time) {
        // Chamada a cada frame
    }
}
```

---

## 🏗️ Expandir Funcionalidades

### Adicionar Novos Brinquedos
Edit `src/js/models/clawMachine.js`:
```javascript
export function criarBrinquedos(scene, quantidade = 8) {
    // Modifica cores, formas, posições
    const geo = new THREE.SphereGeometry(0.3, 16, 16); // Esfera ao invés de cubo!
    // ...
}
```

### Aumentar Dificuldade
Edit `src/js/systems/ClawController.js`:
```javascript
this.tempoMaxJogo = 20;         // 20s em vez de 30s
this.velocidadeMovimento = 0.08; // Mais lento
this.velocidadeDepth = 0.08;     // Mais lento
```

### Adicionar Nova Mecânica
Cria novo ficheiro em `src/js/systems/`:
```javascript
// src/js/systems/MeuSistema.js
export class MeuSistema {
    constructor(scene) { /* ... */ }
    update(time) { /* ... */ }
}
```

Depois importa em `main.js`:
```javascript
import { MeuSistema } from "./systems/MeuSistema.js";
const meuSistema = new MeuSistema(scene);
```

---

## 🎯 Tips para Ter Sucesso

1. **Planeamento** - Observa antes de começar onde estão os brinquedos
2. **Posição** - Move primeiro, depois aprofunda (A/D)
3. **Timing** - Não apresses, aproveita outro turno
4. **Ângulo** - Tenta diferentes posições se uma não funciona
5. **Prática** - Cada jogo te faz melhor!

---

## 📚 Recursos Adicionais

- [Three.js Documentação](https://threejs.org/docs/)
- [WebGL Best Practices](https://www.khronos.org/webgl/)
- [OrbitControls](https://threejs.org/docs/index.html?q=orbit#examples/en/controls/OrbitControls)

---

💡 **Dica Final**: Guarda screenshots dos teus melhores scores! 🏆
