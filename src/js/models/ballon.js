import * as THREE from 'three';

export function createBalloons() {
    const group = new THREE.Group();

    // Cores dos 3 balões
    const colors = [0xff2222, 0x2288ff, 0xffdd22];

    // Posições e inclinações de cada balão
    const configs = [
        { x: -0.3, y: 3.0, z: 0.2, rotZ: 0.1 },
        { x: 0.3, y: 3.2, z: -0.2, rotZ: -0.15 },
        { x: 0.0, y: 3.5, z: 0.0, rotZ: 0 }
    ];

    const balloonGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const knotGeo = new THREE.CylinderGeometry(0.01, 0.06, 0.1, 8);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    configs.forEach((cfg, index) => {
        const balloonMat = new THREE.MeshStandardMaterial({
            color: colors[index],
            roughness: 0.2,
            metalness: 0.1
        });

        const sub = new THREE.Group();

        // Parte redonda do balão (oval)
        const balloon = new THREE.Mesh(balloonGeo, balloonMat);
        balloon.scale.y = 1.3;
        sub.add(balloon);

        // Nó do balão
        const knot = new THREE.Mesh(knotGeo, balloonMat);
        knot.position.y = -0.55;
        sub.add(knot);

        sub.position.set(cfg.x, cfg.y, cfg.z);
        sub.rotation.z = cfg.rotZ;
        group.add(sub);

        // Fio dinâmico do nó até à base
        const knotX = cfg.x + 0.55 * Math.sin(cfg.rotZ);
        const knotY = cfg.y - 0.55 * Math.cos(cfg.rotZ);
        const knotPos = new THREE.Vector3(knotX, knotY, cfg.z);
        const basePos = new THREE.Vector3(0, 0, 0);

        const dist = knotPos.distanceTo(basePos);
        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, dist), stringMat);
        string.position.copy(new THREE.Vector3().addVectors(knotPos, basePos).multiplyScalar(0.5));
        string.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), knotPos.clone().normalize());
        group.add(string);
    });

    // Base que prende os fios
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), baseMat);
    base.position.y = 0.05;
    group.add(base);

    return group;
}
