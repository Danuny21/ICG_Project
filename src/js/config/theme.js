/**
 * Definição de temas visuais para a Claw Machine
 */
export const TEMAS = {
    classico: {
        nome: "Clássico",
        ESTRUTURA: 0xcc0000,
        CHAO: 0xeeeeee,
        MODURA: 0xffa500,
        VIDRO: 0x87ceeb,
        METAL: 0xdcdde1,
        RAMPA: 0xcc0000,
        PORTA: 0xeeeeee,
        MECANISMO: 0x333333,
        CABO: 0xcccccc,
        GARRA_DEDO: 0xffaa00,
        JOY_BASE: 0x444444,
        JOY_BOLA: 0xff0000,
        BTN_BASE: 0x222222,
        BTN_PRINCIPAL: 0xffffff,
        CAPSULA_TOPO: 0x00ccff,
        CAPSULA_ANEL: 0xffffff,
        PALETA_CORES: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffaa00, 0xff007f],
        FUNDO: 0x87ceeb    // Azul Céu
    },
    cyberpunk: {
        nome: "Cyberpunk",
        ESTRUTURA: 0x11052C,    // Midnight Escuro / Roxo Noite (Melhor contraste para neóns)
        CHAO: 0x050A1F,         // Chão de grelha metálica muito escuro
        MODURA: 0x00E5FF,       // Ciano Neon mais refinado
        VIDRO: 0x00A2E8,        // Vidro com leve *tint* azulado tecnológico
        METAL: 0x2B2B36,        // Metal Escuro / Gunmetal
        RAMPA: 0x11052C,        // Acompanha a estrutura
        PORTA: 0x00E5FF,        // Acrílico Ciano
        MECANISMO: 0x151515,    // Motor industrial escuro
        CABO: 0xFF0055,         // Cabo Rosa Neon
        GARRA_DEDO: 0xCCFF00,   // Garras Verde Lima (Dá um toque tóxico/cyber)
        JOY_BASE: 0x20202A,
        JOY_BOLA: 0xFF007F,     // Magenta Vivo
        BTN_BASE: 0x111111,
        BTN_PRINCIPAL: 0x00E5FF, // Botão Ciano
        CAPSULA_TOPO: 0xFF0055,  // Topos Rosa Neon
        CAPSULA_ANEL: 0x2B2B36,  // Base de metal escuro
        PALETA_CORES: [0xFF0055, 0x00E5FF, 0xCCFF00, 0x7000FF, 0xFF00FF, 0x00FF9D, 0xFF5500], // Cores Synthwave
        FUNDO: 0x87ceeb    // Azul Céu
    },
    floresta: {
        nome: "Floresta",
        ESTRUTURA: 0x4A3018,    // Madeira Quente / Mogno
        CHAO: 0x384D23,         // Musgo / Relva Seca
        MODURA: 0xC0A062,       // Bronze / Ouro Envelhecido
        VIDRO: 0xE8F5E9,        // Vidro com leve tom de hortelã limpo
        METAL: 0x8C705F,        // Cobre Desgastado
        RAMPA: 0x4A3018,        // Madeira
        PORTA: 0xE8F5E9,        // Vidro limpo
        MECANISMO: 0x3B332C,    // Ferro Escuro Fundido
        CABO: 0x8B7355,         // Cor de Corda / Videira
        GARRA_DEDO: 0xB89947,   // Garras em Latão/Bronze
        JOY_BASE: 0x3E2723,     // Bloco de Madeira
        JOY_BOLA: 0xB33939,     // Baga Vermelha / Cogumelo Venenoso
        BTN_BASE: 0x2C2A29,
        BTN_PRINCIPAL: 0xE6A119, // Âmbar / Folha de Outono Brilhante
        CAPSULA_TOPO: 0x6D9773,  // Verde Sálvia
        CAPSULA_ANEL: 0xD4C19C,  // Branco Casca de Ovo / Madeira Clara
        PALETA_CORES: [0x8E1600, 0xD35400, 0xF1C40F, 0x27AE60, 0x2980B9, 0x8E44AD, 0x16A085, 0x7D6608], // Cores da natureza (Flores, Folhas, Bagas)
        FUNDO: 0xA9DFBF         // Nevoeiro Verde Esmeralda Suave / Alvorada
    }
};

export const THEME = TEMAS.classico;