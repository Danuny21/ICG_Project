import * as THREE from "three";
import { THEME } from "../config/theme.js";

export function criarCapsula() {
    const grupoCapsula = new THREE.Group();

    const coresCapsulas = THEME.PALETA_CORES;
    const corAleatoria = coresCapsulas[Math.floor(Math.random() * coresCapsulas.length)];

    const matBase = new THREE.MeshPhongMaterial({ color: corAleatoria, flatShading: true, shininess: 100, side: THREE.DoubleSide });
    const matTopo = new THREE.MeshPhongMaterial({ color: THEME.CAPSULA_TOPO, flatShading: true, shininess: 100, transparent: false, opacity: 1.0, side: THREE.DoubleSide });
    matTopo.userData.originalOpacity = 0.4;

    const geoBase = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const geoTopo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);

    // Parte de baixo
    const metadeBase = new THREE.Mesh(geoBase, matBase);
    metadeBase.castShadow = true;
    metadeBase.receiveShadow = true;
    grupoCapsula.add(metadeBase);

    // Dobradiça (permite a cápsula abrir)
    const dobradica = new THREE.Group();
    dobradica.position.set(0, 0, -1.5);
    grupoCapsula.add(dobradica);

    // Parte de cima
    const metadeTopo = new THREE.Mesh(geoTopo, matTopo);
    metadeTopo.position.set(0, 0, 1.5);
    metadeTopo.castShadow = true;
    metadeTopo.receiveShadow = true;
    dobradica.add(metadeTopo);

    // Anel
    const geoAnel = new THREE.TorusGeometry(1.54, 0.075, 6, 12);
    const anel = new THREE.Mesh(geoAnel, new THREE.MeshPhongMaterial({ color: THEME.CAPSULA_ANEL, flatShading: true }));
    anel.rotation.x = Math.PI / 2;
    metadeBase.add(anel);

    // Exporta o grupo e a dobradiça
    return {
        grupo: grupoCapsula,
        dobradica: dobradica
    };
}
