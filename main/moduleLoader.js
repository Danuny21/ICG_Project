import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Carrega qualquer modelo GLB/GLTF
 * @param {THREE.Scene} scene - Onde adicionar o modelo
 * @param {string} path - Caminho do ficheiro (ex: 'frog.glb')
 * @param {number} scale - Escala inicial
 * @param {function} callback - Função chamada quando termina de carregar
 */
export function carregarModelo(scene, path, scale, callback) {
    const loader = new GLTFLoader();

    loader.load(path, function (gltf) {
        const modelo = gltf.scene;
        
        modelo.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        modelo.scale.set(0, 0, 0); // Começa invisível para a animação de crescer
        modelo.position.set(0, 0, 0);
        
        scene.add(modelo);

        if (callback) {
            callback(modelo, scale); // Passamos o modelo e a escala desejada
        }

    }, undefined, function (error) {
        console.error('Erro ao carregar o modelo:', path, error);
    });
}