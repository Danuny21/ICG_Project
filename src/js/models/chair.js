import * as THREE from 'three';

export function createChair() {
    const chairGroup = new THREE.Group();
    chairGroup.name = "Chair";

    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4423,
        roughness: 0.7
    });

    const seatHeight = 1.5;

    // Assento
    const seatGeom = new THREE.BoxGeometry(1.5, 0.15, 1.5);
    const seat = new THREE.Mesh(seatGeom, woodMaterial);
    seat.position.y = seatHeight;
    chairGroup.add(seat);

    // Pernas
    const legGeom = new THREE.CylinderGeometry(0.1, 0.1, seatHeight, 8);
    // Posições das 4 pernas (nos cantos do assento)
    const offset = 0.6;
    const legPositions = [
        [-offset, -offset], [offset, -offset],
        [-offset, offset], [offset, offset]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeom, woodMaterial);
        leg.position.set(pos[0], seatHeight / 2, pos[1]);
        chairGroup.add(leg);
    });

    // Encosto (Tábua traseira)
    const backGeom = new THREE.BoxGeometry(1.5, 0.6, 0.15);
    const backrest = new THREE.Mesh(backGeom, woodMaterial);
    backrest.position.set(0, seatHeight + 0.8, -offset);
    chairGroup.add(backrest);

    // Suportes do encosto
    const supGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const sup1 = new THREE.Mesh(supGeom, woodMaterial);
    sup1.position.set(-offset, seatHeight + 0.3, -offset);

    const sup2 = new THREE.Mesh(supGeom, woodMaterial);
    sup2.position.set(offset, seatHeight + 0.3, -offset);

    chairGroup.add(sup1, sup2);

    return chairGroup;
}