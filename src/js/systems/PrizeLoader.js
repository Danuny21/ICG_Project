import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const cacheModelos = {};

// ── Carregar prémio p/ cache ou cena ─────────────────────────────────────────
export function carregarPremio(caminhoFicheiro, parentGroup, onLoadCallback) {
    if (cacheModelos[caminhoFicheiro]) {
        // Se já está em cache, apenas usamos um clone exacto mas instantâneo
        const clone = cacheModelos[caminhoFicheiro].clone();
        
        // Tamanho e base inicial
        clone.scale.set(0.5, 0.5, 0.5);
        clone.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(clone);
        if (onLoadCallback) onLoadCallback(clone);
        return;
    }

    const loader = new GLTFLoader();
    
    loader.load(`./src/js/models/glb/${caminhoFicheiro}`, function (gltf) {
        const baseScene = gltf.scene; 
        
        baseScene.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Guardamos o master na cache!
        cacheModelos[caminhoFicheiro] = baseScene;

        const cloneInicial = baseScene.clone();

        // Tamanho e base inicial
        cloneInicial.scale.set(0.5, 0.5, 0.5);
        cloneInicial.position.set(0, 0, 0);

        if (parentGroup) parentGroup.add(cloneInicial);
        if (onLoadCallback) onLoadCallback(cloneInicial);

    }, undefined, function (error) {
        console.error(`Erro a carregar o modelo ${caminhoFicheiro}:`, error);
    });
}