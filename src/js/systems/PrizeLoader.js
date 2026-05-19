import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const modelCache = {}; // { path: { scene: THREE.Group, animations: AnimationClip[] } }
const _loader = new GLTFLoader(); // Reutilizar o mesmo loader evita overhead de criação

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

    const loader = _loader;

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

/**
 * Pré-carrega todos os modelos da lista para a cache em background.
 * Deve ser chamado durante o loading screen para evitar freezes durante o jogo.
 * @param {Array} prizeList - Array de { file } de prizes.js
 * @param {Function} [onProgress] - Callback(loaded, total) chamado a cada modelo carregado
 * @returns {Promise} Resolve quando todos os modelos estiverem em cache
 */
export function preloadAllPrizes(prizeList, onProgress) {
    const toLoad = prizeList.filter(p => !modelCache[p.file]);
    if (toLoad.length === 0) return Promise.resolve();

    let loaded = 0;
    const total = toLoad.length;

    const promises = toLoad.map(prize => new Promise((resolve) => {
        _loader.load(
            `./src/js/models/glb/${prize.file}`,
            (gltf) => {
                const baseScene = gltf.scene;
                baseScene.traverse(node => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        if (node.material) {
                            const mats = Array.isArray(node.material) ? node.material : [node.material];
                            mats.forEach(m => { m.side = THREE.DoubleSide; });
                        }
                    }
                });
                modelCache[prize.file] = { scene: baseScene, animations: gltf.animations };
                loaded++;
                if (onProgress) onProgress(loaded, total);
                resolve();
            },
            undefined,
            (err) => {
                console.warn(`[preload] Falha ao carregar ${prize.file}:`, err);
                loaded++;
                if (onProgress) onProgress(loaded, total);
                resolve(); // Não bloqueia os restantes
            }
        );
    }));

    return Promise.all(promises);
}