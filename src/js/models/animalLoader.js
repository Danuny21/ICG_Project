import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Carrega um modelo de animal (GLB) desde assets/models
export function carregarAnimal(parentGroup, onLoadCallback, modelPath = 'animal-dog.glb') {
    const loader = new GLTFLoader();

    // Caminho relativo ao assets/models
    loader.load(`./assets/models/${modelPath}`, function (gltf) {
        const animal = gltf.scene; 
        
        animal.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        animal.scale.set(0.05, 0.05, 0.05);
        animal.position.set(0, -0.5, 0);

        parentGroup.add(animal);

        // Callback ao terminar de carregar
        if (onLoadCallback) {
            onLoadCallback(animal);
        }

    }, undefined, function (error) {
        console.error('Erro a carregar o animal:', error);
    });
}
