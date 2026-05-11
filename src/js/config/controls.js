import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function setupOrbitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 20;
    controls.maxDistance = 85;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minAzimuthAngle = 0;
    controls.maxAzimuthAngle = Math.PI * 0.75;
    controls.target.set(0, 18, 0);
    controls.update();
    return controls;
}

export function setupKeyboard(canAct, onSpaceAction) {
    const keys = { up: false, down: false, left: false, right: false, action: false };

    window.addEventListener("keydown", (e) => {
        if (!canAct()) return;
        const key = e.key.toLowerCase();
        if (key === "arrowup"    || key === "w") keys.up    = true;
        if (key === "arrowdown"  || key === "s") keys.down  = true;
        if (key === "arrowleft"  || key === "a") keys.left  = true;
        if (key === "arrowright" || key === "d") keys.right = true;
        if (e.key === " ") {
            keys.action = true;
            if (onSpaceAction) onSpaceAction();
            setTimeout(() => (keys.action = false), 300);
        }
    });

    window.addEventListener("keyup", (e) => {
        const key = e.key.toLowerCase();
        if (key === "arrowup"    || key === "w") keys.up    = false;
        if (key === "arrowdown"  || key === "s") keys.down  = false;
        if (key === "arrowleft"  || key === "a") keys.left  = false;
        if (key === "arrowright" || key === "d") keys.right = false;
    });

    return keys;
}
