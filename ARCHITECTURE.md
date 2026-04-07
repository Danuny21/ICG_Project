# Arquitetura do Projeto

## 🏗️ Diagrama de Fluxo (Claw Machine)

```
┌──────────────────────────────────┐
│      index.html                  │
│  (EntryPoint - import map)       │
└────────────┬─────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  src/js/main.js    │
    │  (Orquestração)    │
    └────────────────────┘
     │    │      │       │
     ▼    ▼      ▼       ▼
   Scene Camera Render  Lights
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌─────────┐ ┌──────────┐ ┌─────────┐
│ Claw    │ │Brinquedos│ │Confetis │
│Machine  │ │          │ │         │
│         │ │Models/   │ │Models/  │
│Models/  │ │Claw      │ │Confetti │
│Claw     │ │Machine   │ │.js      │
│Machine  │ │.js       │ │         │
│.js      │ │          │ │         │
└─────────┘ └──────────┘ └─────────┘
     │
     ▼
┌──────────────────┐
│ ClawController   │
│                  │
│Systems/          │
│Claw              │
│Controller.js     │
└──────────────────┘
     │
    ▼
┌────────────────────────┐
│   Game Loop (animate)  │
│ - Controller.update()  │
│ - Confetti update      │
│ - Render              │
└────────────────────────┘
```

## 📦 Estrutura da Claw Machine

```
ClawMachine {
    grupo: Group                    // Grupo principal
    eixoGrupo: Group               // Eixo superior (posição X, Z)
    eixoCentral: Group             // Eixo central (profundidade)
    garras: Array[4]               // 4 garras para apanhar
    posicaoGarras: {
        x: number,                 // Eixo horizontal esquerda/direita
        z: number,                 // Eixo horizontal frente/trás
        depth: number              // Profundidade (cima/baixo)
    }
}
```

## 🎮 Fluxo de Jogo

```
ESPERANDO
  │
  │ [SPACE] ou [Botão Clique]
  ▼
JOGANDO (30s timer)
  │
  ├─ [SETAS]: Mover garras (X, Z)
  ├─ [A/D]: Profundidade
  ├─ [ENTER]: Fechar garras + verificar colisões
  │
  ├─ Colisão = Brinquedo apanhado (+10 pontos)
  │
  ▼
RETORNANDO (2s animação)
  │
  ▼
ESPERANDO (ready para nova tentativa)
```

## 🎯 Sistema de Colisão

```javascript
// Raio de apanha: 1.5 unidades
// Posição das garras = (x, depth, z)
// Se distância(brinquedo, garras) < 1.5
//   └─> Brinquedo apanhado!
//       └─> Animação de saída (-5 Y)
//           └─> Remove do scene
//               └─> Dispara confetis
//                   └─> +10 pontos
```

## 📊 Estados e Transições

```
Estado: ESPERANDO
├─ UI: Mostra botão START
├─ Input: Aceita SPACE ou click
└─ Garras: Posição (0, 0, 0)

Estado: JOGANDO
├─ UI: Mostra timer e pontos
├─ Input: Setas, A/D, ENTER
├─ Gameloop: 30 segundos
└─ Garras: Controladas pelo player

Estado: RETORNANDO (2s)
├─ UI: "Processando..."
├─ Input: Desabilitado
├─ Animação: Garras voltam ao topo
└─ Brinquedos: Saem da cena

Fim de Jogo
├─ Mostrar: Pontos totais
├─ Resetar: Brinquedos na cena
└─> Volta a ESPERANDO
```

## 🔧 Modelos 3D

### Claw Machine
- **Base**: BoxGeometry(12, 1, 8)
- **Paredes**: BoxGeometry lateral
- **Teto**: BoxGeometry(11, 1, 7.5)
- **Motor**: CylinderGeometry(0.5, 0.5, 0.5)
- **Garras**: 4x BoxGeometry(0.3, 0.3, 2.5) posicionadas radialmente

### Brinquedos
- **Forma**: BoxGeometry(0.6, 0.6, 0.6)
- **Cores**: 5 cores diferentes
- **Propriedades**: apanhado, velocidade, emMovimento

## 📂 Ficheiros Principais

| Ficheiro | Função |
|----------|--------|
| `main.js` | Setup de scene, orquestração do jogo |
| `clawMachine.js` | Modelos 3D (máquina de garras, brinquedos) |
| `ClawController.js` | Lógica de jogo, colisões, controles |
| `confetti.js` | Sistema de partículas |
| `style.css` | UI com tema cyberpunk |

---

**Nota**: O projeto mantém compatibilidade com os sistemas anteriores (CapsuleOpener) mas o foco agora é a Claw Machine completa.
