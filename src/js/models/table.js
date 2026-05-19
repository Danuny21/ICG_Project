import * as THREE from 'three';

export function createRoundTable() {
    const tableGroup = new THREE.Group();
    tableGroup.name = "RoundTable";

    // Material de metal para a base e perna
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.2
    });

    // Material de plástico para o topo
    const plasticMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc2222,
        roughness: 0.3,
        metalness: 0.0
    });

    // Altura total da mesa: ~3 unidades
    const tableHeight = 3;

    // Tampo da mesa (Plástico)
    const topGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const top = new THREE.Mesh(topGeom, plasticMaterial);
    top.position.y = tableHeight;
    tableGroup.add(top);

    // Perna central (Metal)
    const legGeom = new THREE.CylinderGeometry(0.3, 0.3, tableHeight - 0.2, 16);
    const leg = new THREE.Mesh(legGeom, metalMaterial);
    leg.position.y = (tableHeight - 0.2) / 2;
    tableGroup.add(leg);

    // Base da perna (Metal)
    const baseGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
    const base = new THREE.Mesh(baseGeom, metalMaterial);
    base.position.y = 0.05;
    tableGroup.add(base);

    return {
        group: tableGroup,
        updateTheme: (theme) => {
            plasticMaterial.color.setHex(theme.TABLE || theme.FRAME);
            metalMaterial.color.setHex(theme.TABLE_LEGS || theme.METAL);
        }
    };
}