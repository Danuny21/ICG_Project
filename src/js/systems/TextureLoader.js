import * as THREE from "three";

/**
 * Utilitário para carregar um conjunto de texturas PBR/Phong.
 * @param {string} basePath Caminho base do ficheiro (ex: "./textures/floor/Tiles074")
 * @param {Array} maps Lista de sufixos a carregar (ex: ["Color", "NormalGL", "Roughness"])
 * @param {object} repeat Configuração de repetição { x, y }
 * @returns {object} Objeto com as texturas carregadas
 */
export function loadTextureSet(basePath, maps = [], repeat = { x: 1, y: 1 }) {
    const textureLoader = new THREE.TextureLoader();
    const textures = {};

    maps.forEach(mapType => {
        // Tenta carregar .jpg (padrão do teu projeto)
        const tex = textureLoader.load(`${basePath}_${mapType}.jpg`);
        
        // Configura wrapping e repetição
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat.x, repeat.y);
        
        // Guarda no objeto (ex: textures.color)
        const key = mapType.toLowerCase().replace("gl", "").replace("dx", "");
        textures[key] = tex;
    });

    return textures;
}
