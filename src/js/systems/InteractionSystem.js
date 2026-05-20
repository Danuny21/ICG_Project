import * as THREE from "three";
import { drawPrize } from "../config/prizes.js";
import { loadPrize } from "./PrizeLoader.js";

// Gere a deteção de cliques do rato/toque para interação com cápsulas e prémios da coleção.
// Usa raycasting para identificar o objeto clicado e delega a ação ao sistema responsável.
export class InteractionSystem {
    constructor(camera, capsules, capsuleOpener, collectionManager, prizeInspector) {
        this.camera = camera;
        this.capsules = capsules;
        this.capsuleOpener = capsuleOpener;
        this.collectionManager = collectionManager;
        this.prizeInspector = prizeInspector;

        this.raycaster = new THREE.Raycaster();
        this.clickPoint = new THREE.Vector2();

        this._onMouseClick = this._onMouseClick.bind(this);
    }

    // Liga o listener de clique ao window
    init() { window.addEventListener("click", this._onMouseClick); }

    // Remove o listener (limpeza)
    dispose() { window.removeEventListener("click", this._onMouseClick); }

    _onMouseClick(e) {
        // Ignora cliques se algum sistema de inspeção estiver ativo
        if (this.capsuleOpener.state !== "IDLE") return;
        if (this.prizeInspector?.state !== "IDLE") return;

        // Converte as coordenadas do ecrã para espaço normalizado (-1 a 1)
        this.clickPoint.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.clickPoint.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.clickPoint, this.camera);

        // Verifica se o clique acertou numa cápsula que já saiu e ainda não foi aberta
        const available = this.capsules.filter(c => c.saiu && !c.aberta && !c.apanhada);
        const capsuleHits = this.raycaster.intersectObjects(available.map(c => c.mesh), true);

        if (capsuleHits.length > 0) {
            const hit = capsuleHits[0].object;
            const capsule = available.find(c => {
                let found = false;
                c.mesh.traverse(child => { if (child === hit) found = true; });
                return found;
            });
            if (capsule) { this._openCapsule(capsule); return; }
        }

        // Verifica se o clique acertou num modelo da coleção
        if (this.collectionManager && this.prizeInspector) {
            const collectionModels = this.collectionManager.getClickableModels();
            const collectionHits = this.raycaster.intersectObjects(collectionModels, true);

            if (collectionHits.length > 0) {
                // Sobe na hierarquia até encontrar o objeto raiz da coleção (prefixo 'collection_')
                let root = collectionHits[0].object;
                while (root.parent && !root.name.startsWith('collection_')) root = root.parent;

                if (root.name.startsWith('collection_')) {
                    const prizeId = root.userData.prizeId;
                    // Só permite inspecionar se o prémio já foi desbloqueado
                    if (this.collectionManager.getPrizeCount(prizeId) > 0)
                        this.prizeInspector.inspect(root, prizeId);
                }
            }
        }
    }

    // Sorteia um prémio, carrega o modelo 3D e inicia a sequência de abertura da cápsula
    _openCapsule(capsule) {
        capsule.aberta = true;
        const prize = drawPrize();

        loadPrize(prize.file, capsule.mesh, (model, animations) => {
            model.scale.setScalar(prize.scale);
            model.position.set(0, prize.offsetY, 0);
            capsule.modeloInterno = model;

            this.capsuleOpener.openCapsule(
                { group: capsule.mesh, hinge: capsule.dobradica },
                capsule,
                model,
                prize.targetScale,
                animations,
                prize.idle,
                prize.name
            );

            // Desloqueia o prémio
            this.collectionManager?.unlockPrize(prize.name);
        });
    }
}
