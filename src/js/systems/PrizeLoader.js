import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Função genérica para carregar qualquer modelo GLB/GLTF para os prémios
export function carregarPremio(caminhoFicheiro, parentGroup, onLoadCallback) {
    const loader = new GLTFLoader();

    // Caminho para a pasta onde os modelos estão guardados
    loader.load(`./src/js/models/glb/${caminhoFicheiro}`, function (gltf) {
        const modelo = gltf.scene; 
        
        modelo.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Tamanho e base inicial
        modelo.scale.set(0.5, 0.5, 0.5);
        modelo.position.set(0, 0, 0);

        if (parentGroup) {
            parentGroup.add(modelo);
        }

        if (onLoadCallback) {
            onLoadCallback(modelo);
        }

    }, undefined, function (error) {
        console.error(`Erro a carregar o modelo ${caminhoFicheiro}:`, error);
    });
}