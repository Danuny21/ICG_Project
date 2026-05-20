// Lista de todos os prémios disponíveis na máquina de garras.
// Cada entrada define o nome, ficheiro 3D, peso de probabilidade,
// escala inicial (dentro da cápsula), escala final (na inspeção),
// deslocamento vertical e nome da animaçãa.
export const PRIZE_LIST = [
    // ANIMAIS
    { name: "Alpaca",       file: "animals/Alpaca.glb",       weight: 10, scale: 0.25, targetScale: 0.75, offsetY: -0.5, idle: "Idle_2" },
    { name: "Morcego",      file: "animals/Bat.glb",          weight: 10, scale: 0.2,  targetScale: 0.75, offsetY: -0.5, idle: "BatArmature|Bat_Flying" },
    { name: "Vaca",         file: "animals/Cow.glb",          weight: 10, scale: 0.25, targetScale: 0.75, offsetY: -0.5, idle: "Idle" },
    { name: "Burro",        file: "animals/Donkey.glb",       weight: 10, scale: 0.3,  targetScale: 0.75, offsetY: -0.5, idle: "Eating" },
    { name: "Raposa",       file: "animals/Fox.glb",          weight: 10, scale: 0.35, targetScale: 1.1,  offsetY: -0.5, idle: "Idle_2" },
    { name: "Husky",        file: "animals/Husky.glb",        weight: 10, scale: 0.4,  targetScale: 1.5,  offsetY: -0.5, idle: "Gallop" },
    { name: "Shiba Inu",    file: "animals/Shiba Inu.glb",    weight: 10, scale: 0.4,  targetScale: 1.5,  offsetY: -0.5, idle: "Gallop" },
    { name: "Veado",        file: "animals/Stag.glb",         weight: 10, scale: 0.3,  targetScale: 1.1,  offsetY: -0.5, idle: "Attack_Headbutt" },
    { name: "Cavalo",       file: "animals/White Horse.glb",  weight: 10, scale: 0.3,  targetScale: 1.1,  offsetY: -0.5, idle: "Gallop" },
    { name: "Lobo",         file: "animals/Wolf.glb",         weight: 10, scale: 0.45, targetScale: 1.5,  offsetY: -0.5, idle: "Attack" },

    // DINOSSAUROS
    { name: "Apatossauro",     file: "dinossaurs/Apatosaurus.glb",     weight: 5, scale: 0.05, targetScale: 0.35, offsetY: 0,    idle: "Armature|Apatosaurus_Run" },
    { name: "Parassaurolofo",  file: "dinossaurs/Parasaurolophus.glb", weight: 5, scale: 0.2,  targetScale: 0.75, offsetY: -0.5, idle: "Armature|Parasaurolophus_Run" },
    { name: "Estegossauro",    file: "dinossaurs/Stegosaurus.glb",     weight: 5, scale: 0.08, targetScale: 0.35, offsetY: -0.2, idle: "Armature|Stegosaurus_Attack" },
    { name: "T-Rex",           file: "dinossaurs/T-Rex.glb",           weight: 5, scale: 0.08, targetScale: 0.35, offsetY: -0.5, idle: "Armature|TRex_Attack" },
    { name: "Triceratops",     file: "dinossaurs/Triceratops.glb",     weight: 5, scale: 0.08, targetScale: 0.35, offsetY: -0.2, idle: "Armature|Triceratops_Walk" },
    { name: "Velociraptor",    file: "dinossaurs/Velociraptor.glb",    weight: 5, scale: 0.18, targetScale: 0.75, offsetY: -0.3, idle: "Armature|Velociraptor_Run" },

    // MONSTROS
    { name: "Dragão",    file: "monsters/Dragon.glb",   weight: 1, scale: 0.3,  targetScale: 1.5, offsetY: -0.5, idle: "DragonArmature|Dragon_Flying" },
    { name: "Esqueleto", file: "monsters/Skeleton.glb", weight: 1, scale: 0.25, targetScale: 1.1, offsetY: -0.3, idle: "SkeletonArmature|Skeleton_Running" },
    // O modelo do Slime está exportado com orientação invertida — corrigido com rotationY extra
    { name: "Slime",     file: "monsters/Slime.glb",    weight: 1, scale: 0.5,  targetScale: 1.5, offsetY: -0.3, idle: "SlimeArmature|Slime_Walk", rotationY: Math.PI },
];

// Sorteia um prémio da lista com base no peso de cada entrada.
// Prémios com maior peso têm mais probabilidade de ser selecionados.
export function drawPrize() {
    const total = PRIZE_LIST.reduce((acc, p) => acc + p.weight, 0);
    let roll = Math.random() * total;
    for (const prize of PRIZE_LIST) {
        if (roll < prize.weight) return prize;
        roll -= prize.weight;
    }
    // Fallback caso haja erro de arredonadar o valor
    return PRIZE_LIST[0];
}
