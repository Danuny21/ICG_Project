import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

// Função recebe onde o sapo vai ser colocado (parentGroup) e uma função de aviso (onLoadCallback)
export function carregarSapo(parentGroup, onLoadCallback) {
    const loader = new GLTFLoader();

    loader.load('Project/kenney_cube-pets_1.0/Models/GLB format/animal-dog.glb', function (gltf) {
        const sapo = gltf.scene; 
        
        sapo.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        sapo.scale.set(0.05, 0.05, 0.05);
        sapo.position.set(0, -0.5, 0);

        parentGroup.add(sapo);

        // Avisa o main.js que acabou de carregar e entrega o modelo para ser animado
        if (onLoadCallback) {
            onLoadCallback(sapo);
        }

    }, undefined, function (error) {
        console.error('Erro a carregar o sapo:', error);
    });
}