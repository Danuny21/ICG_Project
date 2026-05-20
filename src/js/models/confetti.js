import * as THREE from "three";
import { THEME } from "../config/theme.js";

// Cria um sistema de partículas de confetis para celebrar quando o jogador ganha um prémio.
export function createConfetti(scene) {
    const confettiList = [];
    const confettiColors = THEME.COLOR_PALETTE;

    // Gerar meshes
    for (let i = 0; i < 500; i++) {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        const geometry = new THREE.ConeGeometry(0.35, 0.35, 3);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.visible = false;
        scene.add(mesh);

        confettiList.push({
            mesh: mesh,
            velocity: new THREE.Vector3(),
            rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random())
        });
    }

    return {
        // Lançar confetis
        fire: function (position = new THREE.Vector3(0, 0, 0)) {
            confettiList.forEach(c => {
                c.mesh.position.copy(position);
                c.mesh.visible = true;
                c.velocity.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.4 + 0.2,
                    (Math.random() - 0.5) * 0.3
                );
            });
        },
        // Apagar confetis
        hide: function () { 
            confettiList.forEach(c => { 
                c.mesh.visible = false;
            });
        },
        // Fisica simples de gravidade e rotação
        update: function () {
            confettiList.forEach(c => {
                if (c.mesh.visible) {
                    c.velocity.y -= 0.005
                    c.mesh.position.add(c.velocity);

                    c.mesh.rotation.x += c.rotationSpeed.x * 0.1;
                    c.mesh.rotation.y += c.rotationSpeed.y * 0.1;
                    c.mesh.rotation.z += c.rotationSpeed.z * 0.1;

                    if (c.mesh.position.y < -10) {
                        c.mesh.visible = false;
                    }
                }
            });
        },
        updateColors: function (newPalette) {
            confettiList.forEach(c => {
                const newColor = newPalette[Math.floor(Math.random() * newPalette.length)];
                c.mesh.material.color.set(newColor);
            });
        }
    };
}
