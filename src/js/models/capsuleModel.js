import * as THREE from "three";
import { THEME } from "../config/theme.js";

export function criarCapsula() {
    const capsuleGroup = new THREE.Group();

    const coresCapsulas = THEME.PALETA_CORES;
    const corAleatoria = coresCapsulas[Math.floor(Math.random() * coresCapsulas.length)];

    const matBottom = new THREE.MeshPhongMaterial({ color: corAleatoria, flatShading: true, shininess: 100, side: THREE.DoubleSide });
    // Começa opaco (sem transparência). O Abridor de Cápsulas vai torná-lo transparente e com opacidade 0.4 quando ativado.
    const matTop = new THREE.MeshPhongMaterial({ color: THEME.CAPSULA_TOPO, flatShading: true, shininess: 100, transparent: false, opacity: 1.0, side: THREE.DoubleSide });
    // Guardamos o 0.4 como userData para ser utilizado mais tarde
    matTop.userData.originalOpacity = 0.4;

    const bottomGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const topGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);

    const bottomHalf = new THREE.Mesh(bottomGeo, matBottom);
    bottomHalf.castShadow = true;
    bottomHalf.receiveShadow = true;
    capsuleGroup.add(bottomHalf);

    const hinge = new THREE.Group();
    hinge.position.set(0, 0, -1.5);
    capsuleGroup.add(hinge);

    const topHalf = new THREE.Mesh(topGeo, matTop);
    topHalf.position.set(0, 0, 1.5);
    topHalf.castShadow = true;
    topHalf.receiveShadow = true;
    hinge.add(topHalf);

    const ringGeo = new THREE.TorusGeometry(1.54, 0.075, 6, 12);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: THEME.CAPSULA_ANEL, flatShading: true }));
    ring.rotation.x = Math.PI / 2;
    bottomHalf.add(ring);

    // Exporta o grupo e a dobradiça
    return {
        grupo: capsuleGroup,
        dobradica: hinge
    };
}
