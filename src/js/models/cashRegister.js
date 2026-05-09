import * as THREE from 'three';

export function createCashRegister() {
    const caixaGroup = new THREE.Group();

    const matCorpo = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
    const matPreto = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const matEcra = new THREE.MeshStandardMaterial({ color: 0x88ff88, emissive: 0x22aa22 });

    // Gaveta do dinheiro (Base)
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), matCorpo);
    base.position.y = 0.15;
    caixaGroup.add(base);

    // Ranhura da gaveta
    const ranhura = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 1.21), matPreto);
    ranhura.position.y = 0.15;
    caixaGroup.add(ranhura);

    // Corpo superior inclinado (Onde estão os botões)
    const topo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.8), matCorpo);
    topo.position.set(0, 0.5, -0.1);
    topo.rotation.x = Math.PI * 0.1; // Inclina para a frente
    caixaGroup.add(topo);

    // Teclado (Um quadrado preto onde estariam as teclas)
    const teclado = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.81), matPreto);
    teclado.position.set(0, 0.52, -0.1);
    teclado.rotation.x = Math.PI * 0.1;
    caixaGroup.add(teclado);

    // Ecrãzinho
    const ecra = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.1), matEcra);
    ecra.position.set(0, 0.9, -0.3);
    caixaGroup.add(ecra);

    return caixaGroup;
}