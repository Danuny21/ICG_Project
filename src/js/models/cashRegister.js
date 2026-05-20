import * as THREE from 'three';

// Cria uma caixa registadora detalhada com teclado e ecrã LCD.
export function createCashRegister() {
    const group = new THREE.Group();

    // Função auxiliar para criar materiais MeshStandardMaterial
    const mat = (color, roughness = 0.55, metalness = 0.05) =>
        new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const matWhite   = mat(0xdcdcdc, 0.60, 0.05);
    const matLGray   = mat(0xc8c8c8, 0.65, 0.05);
    const matDGray   = mat(0x888898, 0.60, 0.10);
    const matChrome  = mat(0xbbbbcc, 0.25, 0.85);
    const matTeal    = mat(0x3a9a8a, 0.75, 0.05);
    const matBlue    = mat(0x3a6acc, 0.75, 0.05);
    const matRed     = mat(0xcc3333, 0.75, 0.05);
    const matCream   = mat(0xd4cc88, 0.75, 0.05);
    const matPurple  = mat(0x8844aa, 0.75, 0.05);
    const matDarkKey = mat(0x444455, 0.75, 0.05);

    // Ecrã LCD gerado via Canvas (mostra "0.00")
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#001108';
    ctx.fillRect(0, 0, 256, 80);
    ctx.font = 'bold 52px monospace';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('0.00', 236, 42);
    const displayTex = new THREE.CanvasTexture(canvas);
    const matDisplay = new THREE.MeshStandardMaterial({
        map: displayTex, emissiveMap: displayTex,
        emissive: new THREE.Color(0x003a18), emissiveIntensity: 0.8,
        roughness: 0.3, metalness: 0.0
    });

    // Offset para colocar a base em Y=0
    const Y = 0.275;

    // Função auxiliar para criar e adicionar uma caixa ao grupo
    function box(w, h, d, material, x = 0, y = 0, z = 0) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y + Y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
    }

    // Gaveta base
    box(3.80, 0.55, 2.50, matDGray,  0.00,  0.00,  0.00);
    box(3.78, 0.52, 0.06, matDGray,  0.00,  0.00,  1.26); // Frente da gaveta
    box(0.60, 0.09, 0.12, matChrome, 0.00,  0.05,  1.33); // Puxador
    box(0.12, 0.12, 0.06, matChrome,-0.60,  0.00,  1.33); // Fechadura

    // Corpo principal
    box(3.50, 0.80, 2.20, matWhite, 0, 0.675, 0);
    box(3.50, 0.07, 2.20, matLGray, 0, 1.075, 0); // Tampo

    // Bloco traseiro com poste e ecrã
    box(3.50, 1.10, 0.50, matWhite, 0, 1.38, -0.80);
    box(3.50, 0.07, 0.50, matLGray, 0, 1.94, -0.80);
    box(0.12, 1.00, 0.12, mat(0x111111), -1.20, 2.30, -0.95); // Poste
    box(1.30, 0.45, 0.22, mat(0x111111), -1.20, 2.90, -1.02); // Caixa do ecrã
    box(1.10, 0.30, 0.02, matDisplay,    -1.20, 2.90, -1.14); // Ecrã LCD

    // Teclado — layout de teclas por cor e posição (coluna, linha)
    const keyLayout = [
        ['teal',0,0],['blue',1,0],['teal',2,0],['teal',3,0],
        ['teal',0,1],['red',1,1], ['teal',2,1],['teal',3,1],
        ['teal',0,2],['teal',1,2],['teal',2,2],['teal',3,2],
        ['dk',5,0],['dk',6,0],['dk',7,0],
        ['dk',5,1],['dk',6,1],['dk',7,1],
        ['dk',5,2],['dk',6,2],['dk',7,2],
        ['dk',5,3],['dk',6,3],['dk',7,3],
        ['cream',9,0],['cream',10,0],
        ['cream',9,1],['cream',10,1],
        ['cream',9,2],['cream',10,2],
        ['cream',9,3],['cream',10,3],
    ];
    const keyMats = { teal: matTeal, blue: matBlue, red: matRed, cream: matCream, purple: matPurple, dk: matDarkKey };
    const KEY_W = 0.22, KEY_GAP = 0.28, BASE_X = -1.30, BASE_Z = 0.55;

    keyLayout.forEach(([color, col, row]) => {
        box(KEY_W, 0.09, KEY_W, keyMats[color], BASE_X + col * KEY_GAP, 1.16, BASE_Z - row * 0.30);
    });

    // Tecla grande CASH
    box(0.56, 0.10, 0.22, matPurple, 1.07, 1.17, -0.35);

    return group;
}
