import * as THREE from "three";
import { sortearPremio } from "../config/prizes.js";
import { carregarPremio } from "./PrizeLoader.js";

/**
 * Gere a interação do rato (cliques) com as cápsulas na área do depósito.
 */
export class InteractionSystem {
    constructor(camera, capsulas, capsuleOpener, collectionManager, prizeInspector) {
        this.camera = camera;
        this.capsulas = capsulas;
        this.capsuleOpener = capsuleOpener;
        this.collectionManager = collectionManager;
        this.prizeInspector = prizeInspector;

        this.raycaster = new THREE.Raycaster();
        this.pontoClique = new THREE.Vector2();

        this._onMouseClick = this._onMouseClick.bind(this);
    }

    // Começa a ouvir eventos de clique.    
    init() {
        window.addEventListener("click", this._onMouseClick);
    }

    // Para de ouvir eventos de clique (limpeza).
    dispose() {
        window.removeEventListener("click", this._onMouseClick);
    }

    _onMouseClick(e) {
        // Só permite clicar se nada estiver a ser aberto/inspecionado
        if (this.capsuleOpener.estado !== "INATIVA") return;
        if (this.prizeInspector && this.prizeInspector.estado !== "INATIVA") return;

        this.pontoClique.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pontoClique.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pontoClique, this.camera);

        // --- 1. VERIFICAR CÁPSULAS ---
        const disponiveis = this.capsulas.filter(c => c.saiu && !c.aberta && !c.apanhada);
        const hitsCapsulas = this.raycaster.intersectObjects(disponiveis.map(c => c.mesh), true);
        
        if (hitsCapsulas.length > 0) {
            const hit = hitsCapsulas[0].object;
            const capsulaLogic = disponiveis.find(c => {
                let found = false;
                c.mesh.traverse(child => { if (child === hit) found = true; });
                return found;
            });

            if (capsulaLogic) {
                this._abrirCapsula(capsulaLogic);
                return;
            }
        }

        // --- 2. VERIFICAR PRÉMIOS NA COLEÇÃO ---
        if (this.collectionManager && this.prizeInspector) {
            const modelosColecao = this.collectionManager.getClickableModels();
            const hitsColecao = this.raycaster.intersectObjects(modelosColecao, true);

            if (hitsColecao.length > 0) {
                // Encontrar o root do modelo (que tem o nome collection_...)
                let modelRoot = hitsColecao[0].object;
                while (modelRoot.parent && !modelRoot.name.startsWith('collection_')) {
                    modelRoot = modelRoot.parent;
                }

                if (modelRoot.name.startsWith('collection_')) {
                    const prizeId = modelRoot.userData.prizeId;
                    const count = this.collectionManager.getPrizeCount(prizeId);

                    if (count > 0) {
                        this.prizeInspector.inspect(modelRoot, prizeId);
                    }
                }
            }
        }
    }

    _abrirCapsula(capsulaLogic) {
        capsulaLogic.aberta = true;
        const premioSorteado = sortearPremio();

        carregarPremio(premioSorteado.ficheiro, capsulaLogic.mesh, (modelo, animações) => {
            const s = premioSorteado.escala;
            modelo.scale.set(s, s, s);
            modelo.position.set(0, premioSorteado.offsetY, 0);
            capsulaLogic.modeloInterno = modelo;

            this.capsuleOpener.abrirCapsula(
                { grupo: capsulaLogic.mesh, dobradica: capsulaLogic.dobradica },
                capsulaLogic,
                modelo,
                premioSorteado.escalaAlvo,
                animações,
                premioSorteado.idle,
                premioSorteado.nome
            );

            if (this.collectionManager) {
                this.collectionManager.unlockPrize(premioSorteado.nome);
            }
        });
    }
}
