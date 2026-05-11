import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const modelCache = {}; // { path: { scene: THREE.Group, animations: AnimationClip[] } }

// Carrega um prémio para a cache e para a cena, garantindo que clones funcionam corretamente com SkeletonUtils.
export function loadPrize(filePath, parentGroup, onLoadCallback) {
    if (modelCache[filePath]) {
        const cached = modelCache[filePath];
        // SkeletonUtils.clone é essencial para modelos com SkinnedMesh (ossos/animações)
        const clone = SkeletonUtils.clone(cached.scene);

        clone.scale.set(1, 1, 1);
        clone.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(clone);
        if (onLoadCallback) onLoadCallback(clone, cached.animations);
        return;
    }

    const loader = new GLTFLoader();

    loader.load(`./src/js/models/glb/${filePath}`, function (gltf) {
        const baseScene = gltf.scene;
        const animations = gltf.animations;

        baseScene.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
 
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(m => {
                            m.side = THREE.DoubleSide;
                        });
                    } else {
                        node.material.side = THREE.DoubleSide;
                    }
                }
            }
        });

        modelCache[filePath] = { scene: baseScene, animations: animations };

        const initialClone = SkeletonUtils.clone(baseScene);

        initialClone.scale.set(1, 1, 1);
        initialClone.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(initialClone);
        if (onLoadCallback) onLoadCallback(initialClone, animations);

    }, undefined, function (error) {
        console.error(`Erro ao carregar o modelo ${filePath}:`, error);
    });
}