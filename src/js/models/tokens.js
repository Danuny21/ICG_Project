import * as THREE from 'three';

export function createTokens() {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
    const tokenGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);
    
    // Otimização: InstancedMesh desenha os 6 tokens numa única "draw call" na placa gráfica!
    const instancedTokens = new THREE.InstancedMesh(tokenGeom, goldMat, 6);
    instancedTokens.name = "Tokens";
    instancedTokens.castShadow = true;
    instancedTokens.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let i = 0;

    // Pilha de 4 tokens
    for (let j = 0; j < 4; j++) {
        dummy.position.set(0, 0.02 + j * 0.04, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        instancedTokens.setMatrixAt(i++, dummy.matrix);
    }

    // 1 token espalhado bem juntinho
    dummy.position.set(0.25, 0.02, 0.2);
    dummy.rotation.set(0, Math.PI / 6, 0);
    dummy.updateMatrix();
    instancedTokens.setMatrixAt(i++, dummy.matrix);

    // 1 token encostado à pilha (tombado)
    dummy.position.set(0.18, 0.1, 0.0);
    dummy.rotation.set(0, Math.PI / 6, Math.PI / 2.5);
    dummy.updateMatrix();
    instancedTokens.setMatrixAt(i++, dummy.matrix);

    return instancedTokens;
}
