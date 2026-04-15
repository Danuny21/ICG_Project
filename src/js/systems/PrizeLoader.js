import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const cacheModelos = {}; // { caminho: { scene: THREE.Group, animations: AnimationClip[] } }

// ── Carregar prémio p/ cache ou cena ─────────────────────────────────────────
export function carregarPremio(caminhoFicheiro, parentGroup, onLoadCallback) {
    if (cacheModelos[caminhoFicheiro]) {
        const cached = cacheModelos[caminhoFicheiro];
        // SkeletonUtils.clone é essencial para modelos com SkinnedMesh (ossos)
        const clone = SkeletonUtils.clone(cached.scene);

        clone.scale.set(1, 1, 1);
        clone.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(clone);
        if (onLoadCallback) onLoadCallback(clone, cached.animations);
        return;
    }

    const loader = new GLTFLoader();

    loader.load(`./src/js/models/glb/${caminhoFicheiro}`, function (gltf) {
        const baseScene = gltf.scene;
        const animations = gltf.animations;

        baseScene.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                // Garante que o modelo é visível de ambos os lados (corrige buracos em modelos simples)
                if (node.material) {
                    node.material.side = THREE.DoubleSide;
                }
            }
        });

        // Guardamos o master e as animações na cache!
        cacheModelos[caminhoFicheiro] = { scene: baseScene, animations: animations };

        const cloneInicial = SkeletonUtils.clone(baseScene);

        cloneInicial.scale.set(1, 1, 1);
        cloneInicial.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(cloneInicial);
        if (onLoadCallback) onLoadCallback(cloneInicial, animations);

    }, undefined, function (error) {
        console.error(`Erro a carregar o modelo ${caminhoFicheiro}:`, error);
    });
}