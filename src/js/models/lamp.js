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

    // Luz esférica suave para iluminar o próprio candeeiro por dentro (abajur)
    const glowLight = new THREE.PointLight(0xffffee, intensity);
    glowLight.position.set(0, 0, 0); // No centro do abajur
    glowLight.distance = 25; // Preenchimento curto
    glowLight.decay = 1.0;
    lampGroup.add(glowLight);

    // Foco de Luz apontado para baixo
    const spotLight = new THREE.SpotLight(0xffffee, intensity * 5); // Multiplicado para iluminar forte (estava fraco)
    spotLight.position.set(0, 0.5, 0); // Puxado ligeiramente para cima no eixo central para não parecer "cortado"
    spotLight.angle = Math.PI / 3; // Ligeiramente mais aberto
    spotLight.penumbra = 0.5;
    spotLight.decay = 1.2; // Decay menor para a luz cair melhor no chão
    spotLight.distance = 120; // Maior distância
    spotLight.castShadow = false; // Desligado para poupar limite de sombras MAX_TEXTURE_IMAGE_UNITS
    
    // Alvo da luz
    const target = new THREE.Object3D();
    target.position.set(0, -10, 0);
    lampGroup.add(target);
    spotLight.target = target;
    
    lampGroup.add(spotLight);

    return lampGroup;
}
