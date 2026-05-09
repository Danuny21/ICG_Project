import * as THREE from 'three';
import { createFloatingShelf } from '../models/shelf.js';
import { LISTA_PREMIOS } from '../config/prizes.js';
import { carregarPremio } from './PrizeLoader.js';

export class CollectionManager {
    /**
     * Inicializa o gestor da Collection Room.
     * @param {THREE.Scene} scene A cena principal do Three.js onde os modelos estão instanciados.
     */
    constructor(scene) {
        this.scene = scene;

        // Map para guardar as contagens dos prémios apanhados (ex: 't-rex' -> 1)
        this.inventory = new Map();

        // Caches para armazenar o estado original dos modelos
        this.originalMaterials = new Map();
        this.mixers = new Map();

        // Material preto para aplicar aos modelos ainda não desbloqueados (silhuetas)
        this.silhouetteMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    }

    /**
     * Regista um prémio no sistema. Deve ser chamado logo após o modelo 3D do prémio 
     * ser carregado e adicionado à Collection Room na cena.
     * @param {string} prizeId O identificador único do prémio (ex: 't-rex', 'cat')
     * @param {THREE.Object3D} model O modelo 3D carregado e adicionado à cena
     * @param {Array<THREE.AnimationClip>} animations Array de animações (opcional)
     */
    registerPrize(prizeId, model, animations = []) {
        // Inicializa a contagem a zero no inventário (se ainda não existir)
        if (!this.inventory.has(prizeId)) {
            this.inventory.set(prizeId, 0);
        }

        // Garante que o modelo tem um nome padronizado para ser facilmente encontrado mais tarde
        model.name = `collection_${prizeId}`;

        // Processa os materiais e aplica a silhueta
        const materialsCache = new Map();

        model.traverse((child) => {
            if (child.isMesh) {
                // Guarda o material original (clonado ou apenas a referência, dependendo da necessidade)
                // Se o material for partilhado por vários meshes, guardar a referência é suficiente.
                materialsCache.set(child.uuid, child.material);

                // Se o prémio ainda não foi apanhado, aplica o material totalmente preto
                if (this.inventory.get(prizeId) === 0) {
                    child.material = this.silhouetteMaterial;
                }
            }
        });

        this.originalMaterials.set(prizeId, materialsCache);

        // Processa as animações (se existirem)
        if (animations && animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);

            // Assume-se que queremos tocar a primeira animação do modelo em loop (idle)
            const action = mixer.clipAction(animations[0]);
            action.play();

            // Pausa a animação se o prémio ainda não foi desbloqueado
            if (this.inventory.get(prizeId) === 0) {
                action.paused = true;
            }

            this.mixers.set(prizeId, mixer);
        }
    }

    /**
     * Função chamada quando a garra deixa cair o prémio no buraco.
     * Trata do desbloqueio visual na sala ou apenas incrementa o inventário.
     * @param {string} prizeId O identificador do prémio que acabou de ser apanhado
     */
    unlockPrize(prizeId) {
        const currentCount = this.inventory.get(prizeId) || 0;

        if (currentCount === 0) {
            // --- PRIMEIRA VEZ QUE O PRÉMIO É APANHADO ---
            console.log(`🎉 Novo prémio desbloqueado na Collection Room: ${prizeId}!`);

            // 1. Localiza o modelo 3D correspondente na cena
            const modelName = `collection_${prizeId}`;
            const model = this.scene.getObjectByName(modelName);

            if (model) {
                // 2. Restaura os materiais originais em cache
                const materialsCache = this.originalMaterials.get(prizeId);
                if (materialsCache) {
                    model.traverse((child) => {
                        if (child.isMesh && materialsCache.has(child.uuid)) {
                            // Devolve a cor e textura original ao Mesh
                            child.material = materialsCache.get(child.uuid);
                        }
                    });
                }

                // 3. Inicia as animações (retira da pausa)
                const mixer = this.mixers.get(prizeId);
                if (mixer) {
                    mixer._actions.forEach(action => {
                        action.paused = false; // Retoma a animação idle
                    });
                }
            } else {
                console.warn(`[CollectionManager] Modelo para o prémio '${prizeId}' não encontrado na cena.`);
            }
        } else {
            // --- PRÉMIO REPETIDO ---
            console.log(`Prémio repetido: ${prizeId}. Contagem anterior: ${currentCount}. Apenas incrementando no inventário.`);
        }

        // Incrementa o contador do prémio no inventário
        this.inventory.set(prizeId, currentCount + 1);

        // Aqui podes disparar eventos para atualizar a UI do jogo, por exemplo:
        // document.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: this.getInventoryState() }));
    }

    /**
     * Atualiza os AnimationMixers. Deve ser chamado no loop de renderização (requestAnimationFrame).
     * @param {number} deltaTime O tempo decorrido desde a última frame (em segundos)
     */
    update(deltaTime) {
        this.mixers.forEach((mixer) => {
            mixer.update(deltaTime);
        });
    }

    /**
     * Retorna a quantidade de vezes que um prémio foi apanhado.
     * @param {string} prizeId O identificador do prémio
     * @returns {number} A contagem no inventário
     */
    getPrizeCount(prizeId) {
        return this.inventory.get(prizeId) || 0;
    }

    /**
     * Retorna um objeto simples com o estado de todo o inventário (útil para UI e guardar o jogo).
     * @returns {Object}
     */
    getInventoryState() {
        return Object.fromEntries(this.inventory);
    }

    /**
     * Configura as estantes e carrega os prémios (silhuetas) para a sala de coleção.
     * @param {Object} arcadeBuilding O objeto do edifício onde as estantes serão adicionadas.
     */
    setupRoom(arcadeBuilding) {
        // Tipos de prémios para cada estante e a respetiva largura pretendida (aumentada 10%)
        const categorias = [
            { id: "animals", largura: 48 }, // 40 * 1.1
            { id: "dinossaurs", largura: 30 }, // 25 * 1.1
            { id: "monsters", largura: 15 } // 12 * 1.1
        ];

        // Empilhar na vertical
        const espacamentoY = 8;
        const yBase = 18; // Altura da primeira prateleira (logo acima do balcão)

        // Posição ao longo da parede esquerda (movida mais para a "direita", na direção da porta frontal)
        const zBase = 43;

        categorias.forEach((categoriaInfo, index) => {
            const categoria = categoriaInfo.id;
            const larguraPrateleira = categoriaInfo.largura;

            const estante = createFloatingShelf(larguraPrateleira);

            // Rodar para encostar à parede esquerda do ArcadeBuilding
            estante.rotation.y = Math.PI / 2;

            // LARGURA do building = 100 -> Parede esquerda = -50.
            // Para ficar encostada à parede, X = -48.5
            estante.position.set(-48.5, yBase + index * espacamentoY, zBase);

            arcadeBuilding.grupo.add(estante);

            // Filtrar os prémios desta categoria
            const premiosCategoria = LISTA_PREMIOS.filter(p => p.ficheiro.includes(categoria));

            premiosCategoria.forEach((premioConfig, pIndex) => {

                // Lógica para distribuir espaçadamente ao longo da única prateleira
                const espaco = (larguraPrateleira - 2) / (premiosCategoria.length || 1);
                const startX = -larguraPrateleira / 2 + 1 + espaco / 2;
                const posX = startX + pIndex * espaco;

                carregarPremio(premioConfig.ficheiro, null, (modelo, animations) => {
                    // Ajustar a escala do prémio
                    const s = premioConfig.escala * 2.5;
                    modelo.scale.set(s, s, s);

                    // A prateleira tem thickness = 0.5. O topo está em Y = 0.5 (porque pivot = 0 e a tábua é thickness/2 = 0.25 offset + centro?
                    // Na vdd em shelf.js: board.position.set(0, thickness/2, 0); => topo está em thickness = 0.5.
                    const topoPrateleira = 0.5;

                    modelo.position.set(posX, topoPrateleira - (premioConfig.offsetY * s), 0);

                    // Virar para a frente
                    modelo.rotation.y = Math.PI / 2;

                    estante.add(modelo);

                    // Registar o modelo na sala de coleção
                    this.registerPrize(premioConfig.nome, modelo, animations);
                });
            });
        });
    }
}
