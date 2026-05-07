import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function setupOrbitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.1; // Evita ver por baixo do chão
    controls.target.set(0, 18, 0);
    controls.update();
    return controls;
}

export function setupKeyboard(canAct, onSpaceAction) {
    const teclas = { up: false, down: false, left: false, right: false, action: false };

    window.addEventListener("keydown", (e) => {
        if (!canAct()) return;

        if (e.key === "ArrowUp")    teclas.up    = true;
        if (e.key === "ArrowDown")  teclas.down  = true;
        if (e.key === "ArrowLeft")  teclas.left  = true;
        if (e.key === "ArrowRight") teclas.right = true;

        if (e.key === " ") {
            teclas.action = true;
            if (onSpaceAction) onSpaceAction();
            setTimeout(() => (teclas.action = false), 300);
        }
    });

    window.addEventListener("keyup", (e) => {
        if (e.key === "ArrowUp")    teclas.up    = false;
        if (e.key === "ArrowDown")  teclas.down  = false;
        if (e.key === "ArrowLeft")  teclas.left  = false;
        if (e.key === "ArrowRight") teclas.right = false;
    });

    return teclas;
}
