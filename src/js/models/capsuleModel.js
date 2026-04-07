import * as THREE from "three";

export function criarCapsula() {
    const capsuleGroup = new THREE.Group();

    const matBottom = new THREE.MeshPhongMaterial({ color: 0xffaa00, flatShading: true, shininess: 100 }); 
    const matTop = new THREE.MeshPhongMaterial({ color: 0x00ccff, flatShading: true, shininess: 100, transparent: true, opacity: 0.7 }); 

    const bottomGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const topGeo = new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);

    const bottomHalf = new THREE.Mesh(bottomGeo, matBottom);
    bottomHalf.castShadow = true;
    bottomHalf.receiveShadow = true;
    capsuleGroup.add(bottomHalf);

    // Dobradiça
    const hinge = new THREE.Group(); 
    hinge.position.set(0, 0, -1.5); 
    capsuleGroup.add(hinge);

    const topHalf = new THREE.Mesh(topGeo, matTop);
    topHalf.position.set(0, 0, 1.5); 
    topHalf.castShadow = true;
    topHalf.receiveShadow = true;
    hinge.add(topHalf); 

    // Aro de detalhe
    const ringGeo = new THREE.TorusGeometry(1.54, 0.075, 6, 12);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true}));
    ring.rotation.x = Math.PI / 2;
    bottomHalf.add(ring);

    // Exportamos o grupo (para pôr na cena) e a dobradiça (para animar)
    return {
        grupo: capsuleGroup,
        dobradica: hinge
    };
}
