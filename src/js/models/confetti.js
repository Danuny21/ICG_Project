import * as THREE from "three";

export function criarConfetis(scene) {
    const confettis = [];
    const coresConfetis = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff];
    
    // Gerar meshes
    for (let i = 0; i < 500; i++) {
        const cor = coresConfetis[Math.floor(Math.random() * coresConfetis.length)];
        const confMaterial = new THREE.MeshPhongMaterial({ color: cor, flatShading: true });
        const confGeo = new THREE.ConeGeometry(0.35, 0.35, 3);
        const confMesh = new THREE.Mesh(confGeo, confMaterial);
        
        confMesh.visible = false; 
        scene.add(confMesh);

        confettis.push({
            mesh: confMesh,
            velocidade: new THREE.Vector3(),
            rotacaoSpd: new THREE.Vector3(Math.random(), Math.random(), Math.random()) 
        });
    }

    // Funções para controlar os confetis
    return {
        disparar: function() {
            confettis.forEach(c => {
                c.mesh.position.set(0, 0.5, 0); 
                c.mesh.visible = true;
                c.velocidade.set(
                    (Math.random() - 0.5) * 0.5, 
                    Math.random() * 0.6 + 0.3, 
                    (Math.random() - 0.5) * 0.5
                );
            });
        },
        esconder: function() {
            confettis.forEach(c => { c.mesh.visible = false; });
        },
        atualizarMovimento: function() {
            confettis.forEach(c => {
                if (c.mesh.visible) {
                    c.velocidade.y -= 0.01; // Gravidade
                    c.mesh.position.add(c.velocidade);
                    
                    c.mesh.rotation.x += c.rotacaoSpd.x * 0.2;
                    c.mesh.rotation.y += c.rotacaoSpd.y * 0.2;
                    c.mesh.rotation.z += c.rotacaoSpd.z * 0.2;

                    if (c.mesh.position.y < -10) {
                        c.mesh.visible = false;
                    }
                }
            });
        }
    };
}
