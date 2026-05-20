import * as THREE from 'three';

// Cria um prédio simples com janelas emissivas e cobertura
export function createBuilding(width = 10, height = 30, depth = 10, wallColor = 0x2a2a3a) {
    const group = new THREE.Group();
    group.name = "Building";

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 });

    // Corpo principal
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Cobertura ligeiramente mais larga
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.6, 1.2, depth + 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.9 })
    );
    roof.position.y = height + 0.6;
    group.add(roof);

    // Janelas emissivas distribuídas pela fachada
    const winMat = new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 0.8
    });
    const winGeo = new THREE.BoxGeometry(1.2, 1.6, 0.1);

    const cols = Math.max(2, Math.floor(width / 3));
    const rows = Math.max(3, Math.floor(height / 5));
    const colSpacing = (width - 2) / (cols - 1 || 1);
    const rowSpacing = (height - 4) / (rows - 1 || 1);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Algumas janelas apagadas aleatoriamente para aspeto realista
            if (Math.random() < 0.25) continue;
            const win = new THREE.Mesh(winGeo, winMat);
            win.position.set(
                -width / 2 + 1 + c * colSpacing,
                2 + r * rowSpacing,
                depth / 2 + 0.05
            );
            group.add(win);
        }
    }

    return group;
}
