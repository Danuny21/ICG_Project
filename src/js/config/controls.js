import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Cria e configura os controlos de câmara orbital (zoom, rotação, pan)
export function setupOrbitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;          // Suaviza os movimentos da câmara
    controls.minDistance = 20;              // Distância mínima ao alvo
    controls.maxDistance = 85;              // Distância máxima ao alvo
    controls.maxPolarAngle = Math.PI / 2.1; // Impede a câmara dpassar do chão
    controls.minAzimuthAngle = 0;           // Impede a câmara de pssar do teto
    controls.maxAzimuthAngle = Math.PI * 0.75;
    controls.target.set(0, 18, 0);         // Ponto inicial para onde a câmara olha
    controls.update();
    return controls;
}

// Configura o teclado para controlar a garra.
// Suporta teclas de seta e WASD. O callback 'canAct' define se o input é permitido.
// O callback 'onSpaceAction' é chamado quando o jogador prime ESPAÇO.
export function setupKeyboard(canAct, onSpaceAction) {
    const keys = { up: false, down: false, left: false, right: false, action: false };

    window.addEventListener("keydown", (e) => {
        if (!canAct()) return; // Ignora input se a ação não for permitida (ex: garra em movimento)
        const key = e.key.toLowerCase();
        if (key === "arrowup"    || key === "w") keys.up    = true;
        if (key === "arrowdown"  || key === "s") keys.down  = true;
        if (key === "arrowleft"  || key === "a") keys.left  = true;
        if (key === "arrowright" || key === "d") keys.right = true;
        if (e.key === " ") {
            keys.action = true;
            if (onSpaceAction) onSpaceAction();           // Dispara a descida da garra/animações das cápsulas e prémiso
            setTimeout(() => (keys.action = false), 300); // Reseta após animação do botão
        }
    });

    window.addEventListener("keyup", (e) => { // Resetar o estado quando soltra a tecla
        const key = e.key.toLowerCase();
        if (key === "arrowup"    || key === "w") keys.up    = false;
        if (key === "arrowdown"  || key === "s") keys.down  = false;
        if (key === "arrowleft"  || key === "a") keys.left  = false;
        if (key === "arrowright" || key === "d") keys.right = false;
    });

    return keys;
}
