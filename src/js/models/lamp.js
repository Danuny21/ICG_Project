import * as THREE from 'three';

export function createLamp(showBulb = true, intensity = 100) {
    const lampGroup = new THREE.Group();
    lampGroup.name = "Lamp";

    // Cabo (fio)
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 15), cableMat);
    cable.position.y = 7.5; // Vai de 0 até 15 para cima
    lampGroup.add(cable);

    // Abajur (Cone aberto)
    const shadeMat = new THREE.MeshStandardMaterial({ 
        color: 0x005522, 
        roughness: 0.5, 
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.2, 16, 1, true), shadeMat);
    shade.position.y = 0; 
    lampGroup.add(shade);

    // Borda do abajur
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffddaa, metalness: 0.8, roughness: 0.3 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 8, 24), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.6; // Base do cone
    lampGroup.add(rim);

    // Lâmpada (Esfera emissiva)
    if (showBulb) {
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 2 });
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bulbMat);
        bulb.position.y = -0.2; // Bem no centro, a espreitar
        lampGroup.add(bulb);
    }

    // Foco de Luz apontado para baixo
    const spotLight = new THREE.SpotLight(0xffffee, intensity);
    spotLight.position.set(0, -0.2, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.6;
    spotLight.decay = 1.5;
    spotLight.distance = 40;
    spotLight.castShadow = true;
    
    // Alvo da luz
    const target = new THREE.Object3D();
    target.position.set(0, -10, 0);
    lampGroup.add(target);
    spotLight.target = target;
    
    lampGroup.add(spotLight);

    return lampGroup;
}
