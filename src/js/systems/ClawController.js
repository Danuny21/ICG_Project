import * as THREE from "three";

/**
 * Controlador completo da Claw Machine
 * Gestiona movimento, colisões, apanha de itens e pontuação
 */
export class ClawController {
    constructor(clawMachine, brinquedos, scene, confetis) {
        this.clawMachine = clawMachine;
        this.brinquedos = brinquedos;
        this.scene = scene;
        this.confetis = confetis;

        // Estado do jogo
        this.estado = "ESPERANDO"; // ESPERANDO, JOGANDO, RETORNANDO
        this.pontos = 0;
        this.brinquedosApanhados = 0;

        // Controles
        this.keys = {};
        this.velocidadeMovimento = 0.15;
        this.velocidadeDepth = 0.15;

        // Limites de movimento
        this.limites = {
            x: { min: -3, max: 3 },
            z: { min: -3, max: 3 },
            depth: { min: -3, max: 2 }
        };

        // Tempo de controle
        this.tempoJogo = 0;
        this.tempoMaxJogo = 30; // 30 segundos por tentativa
        this.emJogo = false;

        // Setup de inputs
        this.setupControles();
    }

    setupControles() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.estado === 'ESPERANDO') {
                this.iniciarJogo();
            }
            if (e.key === 'Enter') {
                this.fecharGarras();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    iniciarJogo() {
        console.log('🎮 JOGO INICIADO! Use as setas para mover, ENTER para apanhar!');
        this.estado = 'JOGANDO';
        this.tempoJogo = 0;
        this.brinquedosApanhados = 0;
        this.emJogo = true;
    }

    atualizarDeltas() {
        if (this.estado !== 'JOGANDO') return;

        const deltaX = (this.keys['arrowright'] ? 1 : 0) - (this.keys['arrowleft'] ? 1 : 0);
        const deltaZ = (this.keys['arrowdown'] ? 1 : 0) - (this.keys['arrowup'] ? 1 : 0);
        const deltaDepth = (this.keys['d'] ? 1 : 0) - (this.keys['a'] ? 1 : 0);

        // Atualizar posição
        this.clawMachine.posicaoGarras.x += deltaX * this.velocidadeMovimento;
        this.clawMachine.posicaoGarras.z += deltaZ * this.velocidadeMovimento;
        this.clawMachine.posicaoGarras.depth += deltaDepth * this.velocidadeDepth;

        // Aplicar limites
        this.clawMachine.posicaoGarras.x = Math.max(
            this.limites.x.min,
            Math.min(this.limites.x.max, this.clawMachine.posicaoGarras.x)
        );
        this.clawMachine.posicaoGarras.z = Math.max(
            this.limites.z.min,
            Math.min(this.limites.z.max, this.clawMachine.posicaoGarras.z)
        );
        this.clawMachine.posicaoGarras.depth = Math.max(
            this.limites.depth.min,
            Math.min(this.limites.depth.max, this.clawMachine.posicaoGarras.depth)
        );

        // Aplicar transformação ao eixo das garras
        this.clawMachine.eixoGrupo.position.x = this.clawMachine.posicaoGarras.x;
        this.clawMachine.eixoGrupo.position.z = this.clawMachine.posicaoGarras.z;
        this.clawMachine.eixoCentral.position.y = this.clawMachine.posicaoGarras.depth;
    }

    fecharGarras() {
        if (this.estado !== 'JOGANDO') return;

        console.log('👁️ Fechando garras...');
        
        // Verificar colisões
        this.verificarColisoes();
        
        // Simular movimento de retorno
        setTimeout(() => {
            this.estado = 'RETORNANDO';
            console.log(`📦 Apanhados: ${this.brinquedosApanhados}`);
        }, 500);

        // Reposicionar garras ao topo
        setTimeout(() => {
            this.clawMachine.posicaoGarras = { x: 0, z: 0, depth: 0 };
            this.clawMachine.eixoGrupo.position.set(0, 14, 0);
            this.clawMachine.eixoCentral.position.y = 0;
            this.estado = 'ESPERANDO';
            console.log('✅ Garras retornadas! Pressione SPACE para jogar novamente.');
        }, 2000);
    }

    verificarColisoes() {
        const posGarras = new THREE.Vector3(
            this.clawMachine.posicaoGarras.x,
            this.clawMachine.posicaoGarras.depth,
            this.clawMachine.posicaoGarras.z
        );

        const raioApanha = 1.5; // Raio de colisão

        this.brinquedos.forEach((brinquedo) => {
            if (brinquedo.userData.apanhado) return;

            const distancia = brinquedo.position.distanceTo(posGarras);
            
            if (distancia < raioApanha) {
                console.log(`✨ Apanhaste: ${brinquedo.userData.tipo || 'brinquedo'}`);
                this.apanharBrinquedo(brinquedo);
            }
        });
    }

    apanharBrinquedo(brinquedo) {
        brinquedo.userData.apanhado = true;
        this.brinquedosApanhados++;
        this.pontos += 10;

        // Animação de apanha
        brinquedo.userData.emMovimento = true;
        const targetPos = new THREE.Vector3(
            this.clawMachine.posicaoGarras.x,
            -5,
            this.clawMachine.posicaoGarras.z
        );

        const animacao = setInterval(() => {
            brinquedo.position.lerp(targetPos, 0.1);
            
            if (brinquedo.position.y < -4) {
                clearInterval(animacao);
                this.scene.remove(brinquedo);
                
                // Disparar confetis quando apanha algo
                if (this.confetis) {
                    this.confetis.disparar();
                }
            }
        }, 50);
    }

    update(time) {
        if (this.estado === 'JOGANDO') {
            this.tempoJogo += 0.016; // ~60fps
            
            // Atualizar movimento
            this.atualizarDeltas();

            // Fim do tempo de jogo
            if (this.tempoJogo > this.tempoMaxJogo) {
                this.finalizarJogo();
            }
        }

        // Animar rotação do motor
        this.clawMachine.eixoCentral.rotation.z += 0.02;
    }

    finalizarJogo() {
        this.estado = 'ESPERANDO';
        this.emJogo = false;
        console.log(`
╔═══════════════════════════════╗
║      FIM DO JOGO              ║
║ Pontos: ${this.pontos}              ║
║ Brinquedos: ${this.brinquedosApanhados}         ║
╚═══════════════════════════════╝
        `);
    }

    obterPontos() {
        return this.pontos;
    }

    obterStatusUI() {
        return {
            estado: this.estado,
            tempo: Math.ceil(this.tempoMaxJogo - this.tempoJogo),
            pontos: this.pontos,
            brinquedos: this.brinquedosApanhados
        };
    }
}
