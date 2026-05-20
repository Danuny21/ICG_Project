import * as THREE from "three";

// Carrega um conjunto de texturas (color, normal, roughness, etc.)
export function loadTextureSet(basePath, maps = [], repeat = { x: 1, y: 1 }) {
    const textureLoader = new THREE.TextureLoader();
    const textures = {};

    maps.forEach(mapType => {
        // Tenta carregar .jpg
        const tex = textureLoader.load(`${basePath}_${mapType}.jpg`);
        // Configura wrapping e repetição
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat.x, repeat.y);
        // Guarda no objeto 
        const key = mapType.toLowerCase().replace("gl", "").replace("dx", "");
        textures[key] = tex;
    });

    return textures;
}
