import * as THREE from 'three';

export function createRoundTable() {
    const tableGroup = new THREE.Group();
    tableGroup.name = "RoundTable";

    // Material de madeira para a mesa
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B5A2B,
        roughness: 0.6
    });

    // Altura total da mesa: ~3 unidades
    const tableHeight = 3;

    // Tampo da mesa
    const topGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const top = new THREE.Mesh(topGeom, woodMaterial);
    top.position.y = tableHeight;
    tableGroup.add(top);

    // Perna central
    const legGeom = new THREE.CylinderGeometry(0.3, 0.3, tableHeight - 0.3, 16);
    const leg = new THREE.Mesh(legGeom, woodMaterial);
    leg.position.y = tableHeight / 2;
    tableGroup.add(leg);

    // Base da perna
    const baseGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
    const base = new THREE.Mesh(baseGeom, woodMaterial);
    base.position.y = 0.05;
    tableGroup.add(base);

    return tableGroup;
}