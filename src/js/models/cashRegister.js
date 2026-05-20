import * as THREE from 'three';

// Função para criar um caixa registadora detalhada
export function createCashRegister() {
    const group = new THREE.Group();

    // Func pa criar os materiais
    const mat = (color, rough = 0.55, metal = 0.05) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

    const mWhite = mat(0xdcdcdc, 0.60, 0.05);
    const mLGray = mat(0xc8c8c8, 0.65, 0.05);
    const mDGray = mat(0x888898, 0.60, 0.10);
    const mBlack = mat(0x111111, 0.80, 0.10);
    const mChrome = mat(0xbbbbcc, 0.25, 0.85);
    const mLED = mat(0x001108, 0.20, 0.00); 

    // Ecra com texutra
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = 256;
    displayCanvas.height = 80;
    const ctx = displayCanvas.getContext('2d');
    ctx.fillStyle = '#001108';            // Fundo escuro
    ctx.fillRect(0, 0, 256, 80);
    ctx.font = 'bold 52px monospace';       // Fonte monoespaçada para aspeto de LCD
    ctx.fillStyle = '#00ff88';            // Verde brilhante
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('0.00', 236, 42);
    const displayTexture = new THREE.CanvasTexture(displayCanvas);
    const mDisplay = new THREE.MeshStandardMaterial({
        map: displayTexture,
        emissiveMap: displayTexture,
        emissive: new THREE.Color(0x003a18),
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.0
    });

    const mTeal = mat(0x3a9a8a, 0.75, 0.05);
    const mBlue = mat(0x3a6acc, 0.75, 0.05);
    const mRed = mat(0xcc3333, 0.75, 0.05);
    const mCream = mat(0xd4cc88, 0.75, 0.05);
    const mPurple = mat(0x8844aa, 0.75, 0.05);
    const mDkKey = mat(0x444455, 0.75, 0.05);

    // Offset para colocar a base em Y=0
    const Y_OFFSET = 0.275;

    // Cria uma caixa e adiciona ao grupo
    function box(w, h, d, material, x = 0, y = 0, z = 0) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y + Y_OFFSET, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
    }

    // Gaveta base
    box(3.80, 0.55, 2.50, mDGray, 0.00, 0.00, 0.00);  // corpo gaveta
    box(3.78, 0.52, 0.06, mDGray, 0.00, 0.00, 1.26);  // frente gaveta
    box(0.60, 0.09, 0.12, mChrome, 0.00, 0.05, 1.33);  // puxador
    box(0.12, 0.12, 0.06, mChrome, -0.60, 0.00, 1.33);  // fechadura

    // Corpo principal
    box(3.50, 0.80, 2.20, mWhite, 0, 0.675, 0);          // corpo
    box(3.50, 0.07, 2.20, mLGray, 0, 1.075, 0);          // tampo

    // Bloco traseiro
    box(3.50, 1.10, 0.50, mWhite, 0, 1.38, -0.80);       // bloco
    box(3.50, 0.07, 0.50, mLGray, 0, 1.94, -0.80);       // tampo bloco

    //  Poste + display traseiro
    box(0.12, 1.00, 0.12, mBlack, -1.20, 2.30, -0.95);   // poste
    box(1.30, 0.45, 0.22, mBlack, -1.20, 2.90, -1.02);   // caixa display topo
    box(1.10, 0.30, 0.02, mDisplay, -1.20, 2.90, -1.14);   // ecrã LED com "0.00"

    // Teclado
    const keyLayout = [
        ['teal', 0, 0], ['blue', 1, 0], ['teal', 2, 0], ['teal', 3, 0],
        ['teal', 0, 1], ['red', 1, 1], ['teal', 2, 1], ['teal', 3, 1],
        ['teal', 0, 2], ['teal', 1, 2], ['teal', 2, 2], ['teal', 3, 2],

        ['dk', 5, 0], ['dk', 6, 0], ['dk', 7, 0],
        ['dk', 5, 1], ['dk', 6, 1], ['dk', 7, 1],
        ['dk', 5, 2], ['dk', 6, 2], ['dk', 7, 2],
        ['dk', 5, 3], ['dk', 6, 3], ['dk', 7, 3],

        ['cream', 9, 0], ['cream', 10, 0],
        ['cream', 9, 1], ['cream', 10, 1],
        ['cream', 9, 2], ['cream', 10, 2],
        ['cream', 9, 3], ['cream', 10, 3],
    ];

    const keyMat = { teal: mTeal, blue: mBlue, red: mRed, cream: mCream, purple: mPurple, dk: mDkKey };
    const KEY_W = 0.22;
    const KEY_GAP = 0.28;
    const BASE_X = -1.30;
    const BASE_Z = 0.55;

    // Criar as teclas do teclado
    keyLayout.forEach(([color, col, row]) => {
        const x = BASE_X + col * KEY_GAP;
        const z = BASE_Z - row * 0.30;
        box(KEY_W, 0.09, KEY_W, keyMat[color], x, 1.16, z);
    });

    // Tecla garndw CASH
    box(0.56, 0.10, 0.22, mPurple, 1.07, 1.17, -0.35);

    return group;
}