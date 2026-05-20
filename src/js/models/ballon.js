import * as THREE from 'three';

export function createBalloons() {
    const baloesGroup = new THREE.Group();

    // Cores dos 3 balões
    const cores = [0xff2222, 0x2288ff, 0xffdd22];

    // Posições e inclinações relativas à base do fio
    const configs = [
        { x: -0.3, y: 3.0, z: 0.2, rotZ: 0.1 },
        { x: 0.3, y: 3.2, z: -0.2, rotZ: -0.15 },
        { x: 0.0, y: 3.5, z: 0.0, rotZ: 0 }
    ];

    const geoBalao = new THREE.SphereGeometry(0.4, 16, 16);
    const geoNo = new THREE.CylinderGeometry(0.01, 0.06, 0.1, 8);
    const matFio = new THREE.MeshBasicMaterial({ color: 0xffffff });

    configs.forEach((cfg, index) => {
        const balizaMat = new THREE.MeshStandardMaterial({
            color: cores[index],
            roughness: 0.2,
            metalness: 0.1
        });

        const subGrupo = new THREE.Group();

        // A parte redonda do balão
        const balao = new THREE.Mesh(geoBalao, balizaMat);
        balao.scale.y = 1.3; // Esticar para ficar com forma oval
        subGrupo.add(balao);

        // Nó do balão
        const noBalao = new THREE.Mesh(geoNo, balizaMat);
        noBalao.position.y = -0.55;
        subGrupo.add(noBalao);

        // Posicionar este balão inteiro
        subGrupo.position.set(cfg.x, cfg.y, cfg.z);
        subGrupo.rotation.z = cfg.rotZ;

        baloesGroup.add(subGrupo);

        // Fio Dinâmico
        // Calcular onde o nó está exatamente no espaço do grupo dos balões
        const knotX = cfg.x + 0.55 * Math.sin(cfg.rotZ);
        const knotY = cfg.y - 0.55 * Math.cos(cfg.rotZ);
        const knotZ = cfg.z;
        const knotPos = new THREE.Vector3(knotX, knotY, knotZ);
        const basePos = new THREE.Vector3(0, 0, 0);
        
        const dist = knotPos.distanceTo(basePos);
        const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, dist), matFio);
        
        // Colocar o fio no ponto médio entre a base e o nó
        const midPoint = new THREE.Vector3().addVectors(knotPos, basePos).multiplyScalar(0.5);
        fio.position.copy(midPoint);
        
        // Rodar o fio para alinhar exatamente entre a base e o nó
        fio.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), knotPos.clone().normalize());
        
        baloesGroup.add(fio);
    });

    // Base que prende os fios
    const matBase = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const baseCilindro = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), matBase);
    baseCilindro.position.y = 0.05;
    baloesGroup.add(baseCilindro);

    return baloesGroup;
}