/**
 * Definição de temas visuais para a Claw Machine
 */
export const TEMAS = {
    classico: {
        nome: "Clássico",
        ESTRUTURA: 0xcc0000,
        CHAO:      0xeeeeee,
        MODURA:    0xffa500,
        VIDRO:     0x87ceeb,
        METAL:     0xcccccc,
        RAMPA:     0xcc0000,
        PORTA:     0xeeeeee,
        MECANISMO: 0x333333,
        CABO:      0xcccccc,
        GARRA_DEDO: 0xffaa00,
        JOY_BASE:  0x444444,
        JOY_BOLA:  0xff0000,
        BTN_BASE:  0x222222,
        BTN_PRINCIPAL: 0x32cd32,
        CAPSULA_TOPO: 0x00ccff,
        CAPSULA_ANEL: 0xffffff,
        PALETA_CORES: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffaa00, 0xff007f]
    },
    cyberpunk: {
        nome: "Cyberpunk",
        ESTRUTURA: 0x1a0033,    // Roxo muito escuro
        CHAO:      0x000b1e,    // Azul profundo
        MODURA:    0x00ffff,    // Ciano Neon
        VIDRO:     0x00ffff,    // Ciano (com opacidade controlada no material)
        METAL:     0xff00ff,    // Rosa Magenta Neon
        RAMPA:     0x1a0033,
        PORTA:     0x00ffff,
        MECANISMO: 0x000000,
        CABO:      0xff00ff,
        GARRA_DEDO: 0x00ffff,
        JOY_BASE:  0x111111,
        JOY_BOLA:  0xff00ff,
        BTN_BASE:  0x000000,
        BTN_PRINCIPAL: 0x00ffff,
        CAPSULA_TOPO: 0xff00ff,
        CAPSULA_ANEL: 0x00ffff,
        PALETA_CORES: [0xff00ff, 0x00ffff, 0x00ff00, 0xffff00, 0xff007f, 0x7b00ff, 0x00ffcc]
    },
    floresta: {
        nome: "Floresta",
        ESTRUTURA: 0x1b4d3e,    // Verde Pinheiro
        CHAO:      0x3d2b1f,    // Terra/Castanho
        MODURA:    0xd4af37,    // Dourado/Metálico
        VIDRO:     0x90ee90,    // Verde claro translúcido
        METAL:     0x5d4037,    // Castanho Madeira
        RAMPA:     0x1b4d3e,
        PORTA:     0x90ee90,
        MECANISMO: 0x222222,
        CABO:      0x5d4037,
        GARRA_DEDO: 0xd4af37,
        JOY_BASE:  0x2e1a0d,
        JOY_BOLA:  0x228b22,
        BTN_BASE:  0x1a1a1a,
        BTN_PRINCIPAL: 0xffd700,
        CAPSULA_TOPO: 0x90ee90,
        CAPSULA_ANEL: 0xffffff,
        PALETA_CORES: [0x228b22, 0x8b4513, 0xd2b48c, 0xf0e68c, 0x556b2f, 0x808000, 0xbc8f8f]
    }
};

// Exportar o tema padrão inicial
export const THEME = TEMAS.classico;
