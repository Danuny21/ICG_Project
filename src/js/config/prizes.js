/**
 * Configuração dos prémios disponíveis nas cápsulas
 * peso: probabilidade relativa
 * escala: tamanho do prémio dentro da cápsula
 * escalaAlvo: tamanho do prémio quando sai da cápsula
 * offsetY: posição vertical do prémio
 */

// export const LISTA_PREMIOS = [
//     {
//         id: "frog",
//         ficheiro: "frog.glb",
//         peso: 70,       // Comum
//         escala: 0.025,
//         escalaAlvo: 0.1,
//         offsetY: 0
//     },
//     {
//         id: "dog",
//         ficheiro: "dog.glb",
//         peso: 30,       // Mais raro
//         escala: 0.0025,
//         escalaAlvo: 0.01,
//         offsetY: -0.5
//     }
// ];

export const LISTA_PREMIOS = [
    // ── ANIMALS ──────────────────────────────────────────────────────────────
    { id: "alpaca", ficheiro: "animals/Alpaca.glb", peso: 10, escala: 0.25, escalaAlvo: 1, offsetY: -0.5, idle: "Idle_2" },
    { id: "bat", ficheiro: "animals/Bat.glb", peso: 10, escala: 0.25, escalaAlvo: 1, offsetY: 0, idle: "Bat_Flying" },
    { id: "cow", ficheiro: "animals/Cow.glb", peso: 10, escala: 0.25, escalaAlvo: 1, offsetY: -0.5, idle: "Idle" },
    { id: "donkey", ficheiro: "animals/Donkey.glb", peso: 10, escala: 0.3, escalaAlvo: 1, offsetY: -0.5, idle: "Eating" },
    { id: "fox", ficheiro: "animals/Fox.glb", peso: 10, escala: 0.35, escalaAlvo: 1.5, offsetY: -0.5, idle: "Idle_2" },
    { id: "husky", ficheiro: "animals/Husky.glb", peso: 10, escala: 0.4, escalaAlvo: 2, offsetY: -0.5, idle: "Gallop" },
    { id: "shiba", ficheiro: "animals/Shiba Inu.glb", peso: 10, escala: 0.4, escalaAlvo: 2, offsetY: -0.5, idle: "Gallop" },
    { id: "stag", ficheiro: "animals/Stag.glb", peso: 10, escala: 0.3, escalaAlvo: 1.5, offsetY: -0.5, idle: "Attack_Headbutt" },
    { id: "white_horse", ficheiro: "animals/White Horse.glb", peso: 10, escala: 0.3, escalaAlvo: 1.5, offsetY: -0.5, idle: "Gallop" },
    { id: "wolf", ficheiro: "animals/Wolf.glb", peso: 10, escala: 0.45, escalaAlvo: 2, offsetY: -0.5, idle: "Attack" },

    // ── DINOSAURS ────────────────────────────────────────────────────────────
    { id: "apatosaurus", ficheiro: "dinossaurs/Apatosaurus.glb", peso: 10, escala: 0.05, escalaAlvo: 0.5, offsetY: 0, idle: "Run" },
    { id: "parasaurolophus", ficheiro: "dinossaurs/Parasaurolophus.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Parasaurolophus_Run" },
    { id: "stegosaurus", ficheiro: "dinossaurs/Stegosaurus.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Idle" },
    { id: "trex", ficheiro: "dinossaurs/T-Rex.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Idle" },
    { id: "triceratops", ficheiro: "dinossaurs/Triceratops.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Idle" },
    { id: "velociraptor", ficheiro: "dinossaurs/Velociraptor.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Idle" },

    // ── MONSTERS ─────────────────────────────────────────────────────────────
    { id: "dragon", ficheiro: "monsters/Dragon.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.5, idle: "Idle" },
    { id: "skeleton", ficheiro: "monsters/Skeleton.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.3, idle: "Idle" },
    { id: "slime", ficheiro: "monsters/Slime.glb", peso: 10, escala: 0.25, escalaAlvo: 0.5, offsetY: -0.3, idle: "Idle" }
];

/**
 * Sorteia um prémio com base nos pesos definidos
 */
export function sortearPremio() {
    // const totalPesos = LISTA_PREMIOS.reduce((acc, p) => acc + p.peso, 0);
    // let sorteio = Math.random() * totalPesos;

    // for (const premio of LISTA_PREMIOS) {
    //     if (sorteio < premio.peso) return premio;
    //     sorteio -= premio.peso;
    // }

    // TODO Corrigir bat e monsters e dinossauros

    return LISTA_PREMIOS[11]; // Fallback
}
