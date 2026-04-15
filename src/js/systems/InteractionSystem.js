import * as THREE from "three";
import { sortearPremio } from "../config/prizes.js";
import { carregarPremio } from "./PrizeLoader.js";

/**
 * Gere a interação do rato (cliques) com as cápsulas na área do depósito.
 */
export class InteractionSystem {
    constructor(camera, capsulas, capsuleOpener) {
        this.camera = camera;
        this.capsulas = capsulas;
        this.capsuleOpener = capsuleOpener;

        this.raycaster = new THREE.Raycaster();
        this.pontoClique = new THREE.Vector2();

        this._onMouseClick = this._onMouseClick.bind(this);
    }

    /**
     * Começa a ouvir eventos de clique.
     */
    init() {
        window.addEventListener("click", this._onMouseClick);
    }

    /**
     * Para de ouvir eventos de clique (limpeza).
     */
    dispose() {
        window.removeEventListener("click", this._onMouseClick);
    }

    _onMouseClick(e) {
        // Só permite clicar se nenhuma cápsula estiver a ser aberta no momento
        if (this.capsuleOpener.estado !== "INATIVA") return;

        // Converte a posição do rato para coordenadas normalizadas (-1 a +1)
        this.pontoClique.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pontoClique.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Atualiza o raycaster com a câmara e a posição do rato
        this.raycaster.setFromCamera(this.pontoClique, this.camera);

        // Filtra as cápsulas que estão no depósito (saiu) e que ainda não foram abertas ou apanhadas
        const disponiveis = this.capsulas.filter(c => c.saiu && !c.aberta && !c.apanhada);
        
        // Verifica interseções
        const hits = this.raycaster.intersectObjects(disponiveis.map(c => c.mesh), true);
        if (!hits.length) return;

        // Obtém o primeiro objeto atingido
        const hit = hits[0].object;
        
        // Encontra o objeto lógico da cápsula associado à mesh atingida
        const capsulaLogic = disponiveis.find(c => {
            let found = false;
            c.mesh.traverse(child => { if (child === hit) found = true; });
            return found;
        });

        if (!capsulaLogic) return;

        // Marca a cápsula como aberta para que não possa ser clicada novamente
        capsulaLogic.aberta = true;

        // Sorteia um prémio da configuração
        const premioSorteado = sortearPremio();

        // Carrega o modelo 3D do prémio
        carregarPremio(premioSorteado.ficheiro, capsulaLogic.mesh, (modelo, animações) => {
            const s = premioSorteado.escala;
            modelo.scale.set(s, s, s);
            modelo.position.set(0, premioSorteado.offsetY, 0);
            capsulaLogic.modeloInterno = modelo;

            // Ativa a sequência de abertura da cápsula
            this.capsuleOpener.abrirCapsula(
                { grupo: capsulaLogic.mesh, dobradica: capsulaLogic.dobradica },
                capsulaLogic,
                modelo,
                premioSorteado.escalaAlvo,
                animações,
                premioSorteado.idle,
                premioSorteado.nome
            );
        });
    }
}
