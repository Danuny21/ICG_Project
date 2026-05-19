import * as THREE from 'three';

export function createTokens() {
    const tokensGroup = new THREE.Group();
    tokensGroup.name = "Tokens";

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.3 });
    const tokenGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);

    // Pilha de 4 tokens
    for (let i = 0; i < 4; i++) {
        const token = new THREE.Mesh(tokenGeom, goldMat);
        token.position.set(0, 0.02 + i * 0.04, 0); 
        tokensGroup.add(token);
    }

    // 1 token espalhado bem juntinho
    const flatToken = new THREE.Mesh(tokenGeom, goldMat);
    flatToken.position.set(0.25, 0.02, 0.2);
    flatToken.rotation.y = Math.PI / 6;
    tokensGroup.add(flatToken);

    // 1 token encostado à pilha (tombado)
    const fallenToken = new THREE.Mesh(tokenGeom, goldMat);
    fallenToken.position.set(0.18, 0.1, 0.0);
    fallenToken.rotation.z = Math.PI / 2.5; 
    fallenToken.rotation.y = Math.PI / 6;
    tokensGroup.add(fallenToken);

    return tokensGroup;
}
