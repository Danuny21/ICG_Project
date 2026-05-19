/**
 * Visual themes for the Claw Machine
 */
export const THEMES = {
    classic: {
        name: "Clássico",
        STRUCTURE: 0xcc0000,
        ARCADE_COLORS: [0xff3333, 0x33ff33, 0x3333ff, 0xffff33],
        FLOOR: 0xeeeeee,
        FRAME: 0xffa500,
        GLASS: 0x87ceeb,
        METAL: 0xdcdde1,
        RAMP: 0xcc0000,
        DOOR: 0xeeeeee,
        MECHANISM: 0x333333,
        CABLE: 0xcccccc,
        CLAW_FINGER: 0xffaa00,
        JOY_BASE: 0x444444,
        JOY_BALL: 0xff0000,
        BTN_BASE: 0x222222,
        BTN_MAIN: 0xffffff,
        CAPSULE_TOP: 0x00ccff,
        CAPSULE_RING: 0xffffff,
        COLOR_PALETTE: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffaa00, 0xff007f],
        BACKGROUND: 0x87ceeb
    },
    dark: {
        name: "Dark",
        STRUCTURE: 0x11052C,
        ARCADE_COLORS: [0x050A1F, 0x3B0059, 0x001B3D, 0x2B2B36], // Pretos, Roxos escuros, Azuis escuros, Cinzentos
        FLOOR: 0x050A1F,
        FRAME: 0x00E5FF,
        GLASS: 0x00A2E8,
        METAL: 0x2B2B36,
        RAMP: 0x11052C,
        DOOR: 0x00E5FF,
        MECHANISM: 0x151515,
        CABLE: 0xFF0055,
        CLAW_FINGER: 0xCCFF00,
        JOY_BASE: 0x20202A,
        JOY_BALL: 0xFF007F,
        BTN_BASE: 0x111111,
        BTN_MAIN: 0x00E5FF,
        CAPSULE_TOP: 0xFF0055,
        CAPSULE_RING: 0x2B2B36,
        COLOR_PALETTE: [0xFF0055, 0x00E5FF, 0xCCFF00, 0x7000FF, 0xFF00FF, 0x00FF9D, 0xFF5500],
        BACKGROUND: 0x87ceeb
    },
    light: {
        name: "Light",
        STRUCTURE: 0x4A3018,
        ARCADE_COLORS: [0x274E13, 0x3E2723, 0xFFB7C5, 0x8C705F], // Verde árvore, Castanho, Folhas Cherry Blossom, Castanho cinza
        FLOOR: 0x384D23,
        FRAME: 0xC0A062,
        GLASS: 0xE8F5E9,
        METAL: 0x8C705F,
        RAMP: 0x4A3018,
        DOOR: 0xE8F5E9,
        MECHANISM: 0x3B332C,
        CABLE: 0x8B7355,
        CLAW_FINGER: 0xB89947,
        JOY_BASE: 0x3E2723,
        JOY_BALL: 0xB33939,
        BTN_BASE: 0x2C2A29,
        BTN_MAIN: 0xE6A119,
        CAPSULE_TOP: 0x6D9773,
        CAPSULE_RING: 0xD4C19C,
        COLOR_PALETTE: [0x8E1600, 0xD35400, 0xF1C40F, 0x27AE60, 0x2980B9, 0x8E44AD, 0x16A085, 0x7D6608],
        BACKGROUND: 0xA9DFBF
    }
};

export const THEME = THEMES.classic;