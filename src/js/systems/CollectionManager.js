import * as THREE from 'three';
import { createFloatingShelf } from '../models/shelf.js';
import { PRIZE_LIST } from '../config/prizes.js';
import { carregarPremio } from './PrizeLoader.js';

// Gere a coleção de prémios desbloqueados pelo jogador.
// Prémios bloqueados aparecem como silhuetas negras; ao desbloquear, restauram os materiais originais.
export class CollectionManager {
    constructor(scene) {
        this.scene = scene;
        this.inventory = new Map();           // prizeId → quantidade obtida
        this.originalMaterials = new Map();   // Materiais originais de cada modelo
        this.mixers = new Map();              // Animadores de cada modelo
        this.silhouetteMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    }

    // Regista um modelo na coleção; aplica silhueta se ainda não desbloqueado
    registerPrize(prizeId, model, animations = [], idleAnimName = null) {
        if (!this.inventory.has(prizeId)) this.inventory.set(prizeId, 0);

        model.name = `collection_${prizeId}`;
        model.userData.prizeId = prizeId;
        model.userData.animations = animations;
        model.userData.idleAnimName = idleAnimName;

        const materialsCache = new Map();
        const isLocked = this.inventory.get(prizeId) === 0;

        model.traverse(child => {
            if (child.isMesh) {
                child.frustumCulled = false;
                materialsCache.set(child.uuid, child.material);
                if (isLocked) child.material = this.silhouetteMaterial;
            }
        });
        this.originalMaterials.set(prizeId, materialsCache);

        if (animations?.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const clip = this._findClip(animations, idleAnimName);
            const action = mixer.clipAction(clip);
            action.play();
            if (isLocked) action.paused = true; // Pausa animação até desbloquear
            this.mixers.set(prizeId, mixer);
        }
    }

    // Desbloqueia um prémio: restaura materiais e retoma a animação; incrementa contador
    unlockPrize(prizeId) {
        const count = this.inventory.get(prizeId) || 0;

        if (count === 0) {
            const model = this.scene.getObjectByName(`collection_${prizeId}`);
            if (model) {
                const materialsCache = this.originalMaterials.get(prizeId);
                if (materialsCache) {
                    model.traverse(child => {
                        if (child.isMesh) {
                            child.frustumCulled = false;
                            if (materialsCache.has(child.uuid))
                                child.material = materialsCache.get(child.uuid);
                        }
                    });
                }
                this.mixers.get(prizeId)?._actions.forEach(a => a.paused = false);
            } else {
                console.warn(`[CollectionManager] Modelo '${prizeId}' não encontrado.`);
            }
        }

        this.inventory.set(prizeId, count + 1);
    }

    // Atualiza todos os animadores a cada frame
    update(deltaTime) {
        this.mixers.forEach(mixer => mixer.update(deltaTime));
    }

    getPrizeCount(prizeId) { return this.inventory.get(prizeId) || 0; }

    getInventoryState() { return Object.fromEntries(this.inventory); }

    // Cria as prateleiras na sala e popula-as com os modelos de cada categoria
    setupRoom(arcadeBuilding) {
        const categories = [
            { id: "animals",    width: 48 },
            { id: "dinossaurs", width: 30 },
            { id: "monsters",   width: 15 },
        ];
        const ySpacing = 8, yBase = 10, zBase = 43;

        categories.forEach((cat, index) => {
            const shelf = createFloatingShelf(cat.width);
            shelf.rotation.y = Math.PI / 2;
            shelf.position.set(-48.5, yBase + index * ySpacing, zBase);
            arcadeBuilding.grupo.add(shelf);

            const prizes = PRIZE_LIST.filter(p => p.file.includes(cat.id));
            const spacing = (cat.width - 2) / (prizes.length || 1);
            const startX = -cat.width / 2 + 1 + spacing / 2;

            prizes.forEach((cfg, i) => {
                carregarPremio(cfg.file, null, (model, animations) => {
                    const s = cfg.scale * 2.5;
                    model.scale.setScalar(s);
                    model.position.set(startX + i * spacing, 0.5 - cfg.offsetY * s, 0);
                    model.rotation.y = Math.PI / 2;
                    shelf.add(model);
                    this.registerPrize(cfg.name, model, animations, cfg.idle);
                });
            });
        });
    }

    // Devolve todos os objetos da coleção clicáveis (prefixo 'collection_')
    getClickableModels() {
        const models = [];
        this.scene.traverse(obj => {
            if (obj.name?.startsWith('collection_')) models.push(obj);
        });
        return models;
    }

    // Procura uma animação pelo nome (exato ou aproximado), com fallback para 'idle'
    _findClip(clips, name) {
        if (name) {
            const exact = clips.find(c => c.name === name);
            if (exact) return exact;
            const fuzzy = clips.find(c => {
                const a = c.name.toLowerCase(), b = name.toLowerCase();
                return a === b || a.includes(b) || b.includes(a);
            });
            if (fuzzy) return fuzzy;
        }
        return clips.find(c => c.name.toLowerCase().includes("idle")) ?? clips[0];
    }
}
