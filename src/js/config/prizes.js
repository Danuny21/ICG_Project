/**
 * Configuração dos prémios disponíveis nas cápsulas
 * peso: probabilidade relativa
 * escala: tamanho do prémio dentro da cápsula
 * escalaAlvo: tamanho do prémio quando sai da cápsula
 * offsetY: posição vertical do prémio
 * idle: animação que corre ao sair da cápsula
 */

export const LISTA_PREMIOS = [
    // ── ANIMALS ──────────────────────────────────────────────────────────────
    { nome: "Alpaca", ficheiro: "animals/Alpaca.glb", peso: 10, escala: 0.25, escalaAlvo: 0.75, offsetY: -0.5, idle: "Idle_2" },
    { nome: "Morcego", ficheiro: "animals/Bat.glb", peso: 10, escala: 0.2, escalaAlvo: 0.75, offsetY: -0.5, idle: "BatArmature|Bat_Flying" },
    { nome: "Vaca", ficheiro: "animals/Cow.glb", peso: 10, escala: 0.25, escalaAlvo: 0.75, offsetY: -0.5, idle: "Idle" },
    { nome: "Burro", ficheiro: "animals/Donkey.glb", peso: 10, escala: 0.3, escalaAlvo: 0.75, offsetY: -0.5, idle: "Eating" },
    { nome: "Raposa", ficheiro: "animals/Fox.glb", peso: 10, escala: 0.35, escalaAlvo: 1.1, offsetY: -0.5, idle: "Idle_2" },
    { nome: "Husky", ficheiro: "animals/Husky.glb", peso: 10, escala: 0.4, escalaAlvo: 1.5, offsetY: -0.5, idle: "Gallop" },
    { nome: "Shiba Inu", ficheiro: "animals/Shiba Inu.glb", peso: 10, escala: 0.4, escalaAlvo: 1.5, offsetY: -0.5, idle: "Gallop" },
    { nome: "Veado", ficheiro: "animals/Stag.glb", peso: 10, escala: 0.3, escalaAlvo: 1.1, offsetY: -0.5, idle: "Attack_Headbutt" },
    { nome: "Cavalo", ficheiro: "animals/White Horse.glb", peso: 10, escala: 0.3, escalaAlvo: 1.1, offsetY: -0.5, idle: "Gallop" },
    { nome: "Lobo", ficheiro: "animals/Wolf.glb", peso: 10, escala: 0.45, escalaAlvo: 1.5, offsetY: -0.5, idle: "Attack" },

    // ── DINOSAURS ────────────────────────────────────────────────────────────
    { nome: "Apatossauro", ficheiro: "dinossaurs/Apatosaurus.glb", peso: 10, escala: 0.05, escalaAlvo: 0.35, offsetY: 0, idle: "Armature|Apatosaurus_Run" },
    { nome: "Parassaurolofo", ficheiro: "dinossaurs/Parasaurolophus.glb", peso: 10, escala: 0.2, escalaAlvo: 0.75, offsetY: -0.5, idle: "Armature|Parasaurolophus_Run" },
    { nome: "Estegossauro", ficheiro: "dinossaurs/Stegosaurus.glb", peso: 10, escala: 0.08, escalaAlvo: 0.35, offsetY: -0.2, idle: "Armature|Stegosaurus_Attack" },
    { nome: "T-Rex", ficheiro: "dinossaurs/T-Rex.glb", peso: 10, escala: 0.08, escalaAlvo: 0.35, offsetY: -0.5, idle: "Armature|TRex_Attack" },
    { nome: "Triceratops", ficheiro: "dinossaurs/Triceratops.glb", peso: 10, escala: 0.08, escalaAlvo: 0.35, offsetY: -0.2, idle: "Armature|Triceratops_Walk" },
    { nome: "Velociraptor", ficheiro: "dinossaurs/Velociraptor.glb", peso: 10, escala: 0.18, escalaAlvo: 0.75, offsetY: -0.3, idle: "Armature|Velociraptor_Run" },

    // ── MONSTERS ─────────────────────────────────────────────────────────────
    { nome: "Dragão", ficheiro: "monsters/Dragon.glb", peso: 10, escala: 0.3, escalaAlvo: 1.5, offsetY: -0.5, idle: "DragonArmature|Dragon_Flying" },
    { nome: "Esqueleto", ficheiro: "monsters/Skeleton.glb", peso: 10, escala: 0.25, escalaAlvo: 1.1, offsetY: -0.3, idle: "SkeletonArmature|Skeleton_Running" },
    { nome: "Slime", ficheiro: "monsters/Slime.glb", peso: 10, escala: 0.5, escalaAlvo: 1.5, offsetY: -0.3, idle: "SlimeArmature|Slime_Walk" }


];

/**
 * Sorteia um prémio com base nos pesos definidos
 */
export function sortearPremio() {
    const totalPesos = LISTA_PREMIOS.reduce((acc, p) => acc + p.peso, 0);
    let sorteio = Math.random() * totalPesos;

    for (const premio of LISTA_PREMIOS) {
        if (sorteio < premio.peso) return premio;
        sorteio -= premio.peso;
    }

    return LISTA_PREMIOS[0]; // Fallback
}
