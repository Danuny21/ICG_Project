import * as THREE from 'three';

export function createChair() {
    const chairGroup = new THREE.Group();
    chairGroup.name = "Chair";

    // Material de metal para as pernas e suportes
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.3,
        roughness: 0.4
    });

    // Material de plástico para o assento e encosto
    const plasticMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc2222, // Vermelho retro de plástico
        roughness: 0.4,
        metalness: 0.0
    });

    const seatHeight = 1.5;

    // Assento
    const seatGeom = new THREE.BoxGeometry(1.5, 0.15, 1.5);
    const seat = new THREE.Mesh(seatGeom, plasticMaterial);
    seat.position.y = seatHeight;
    chairGroup.add(seat);

    // Pernas
    const legGeom = new THREE.CylinderGeometry(0.1, 0.1, seatHeight, 8);
    const offset = 0.6;
    const legPositions = [
        [-offset, -offset], [offset, -offset],
        [-offset, offset], [offset, offset]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeom, metalMaterial);
        leg.position.set(pos[0], seatHeight / 2, pos[1]);
        chairGroup.add(leg);
    });

    // Encosto
    const backGeom = new THREE.BoxGeometry(1.7, 0.6, 0.17);
    const backrest = new THREE.Mesh(backGeom, plasticMaterial);
    backrest.position.set(0, seatHeight + 0.8, -offset);
    chairGroup.add(backrest);

    // Suportes do encosto
    const supGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const sup1 = new THREE.Mesh(supGeom, metalMaterial);
    sup1.position.set(-offset, seatHeight + 0.3, -offset);

    const sup2 = new THREE.Mesh(supGeom, metalMaterial);
    sup2.position.set(offset, seatHeight + 0.3, -offset);

    chairGroup.add(sup1, sup2);

    return {
        group: chairGroup,
        updateTheme: (theme) => {
            plasticMaterial.color.setHex(theme.CHAIR || theme.FRAME);
            metalMaterial.color.setHex(theme.CHAIR_LEGS || theme.METAL);
        }
    };
}