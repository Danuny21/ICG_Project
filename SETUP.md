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

### Iniciar o Jogo

- Abre `http://localhost:8000` no browser
- Pressiona **SPACE** ou clica no botão "PRESSIONA SPACE"

### Comandos

| Tecla | Ação |
| ------- | ---- |
| Setas (esquerda/direita) | Mover garras para esquerda/direita |
| Setas (cima/baixo) | Mover garras para frente/atrás |
| `SPACE` | Iniciar novo jogo |

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
