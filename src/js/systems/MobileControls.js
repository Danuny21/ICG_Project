export class MobileControls {
    constructor(keys, onAction) {
        this.keys = keys;
        this.onAction = onAction;

        this.joystick = document.getElementById('joystick-container');
        this.stick = document.getElementById('joystick-stick');
        this.actionButton = document.getElementById('action-button');

        this.maxDistance = 50; // Max move distance for the stick
        this.active = false;
        this.startX = 0;
        this.startY = 0;

        this.init();
    }

    init() {
        // Joystick Events
        this.joystick.addEventListener('touchstart', (e) => this.onStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
        window.addEventListener('touchend', () => this.onEnd(), { passive: false });

        // Action Button
        this.actionButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.action = true;
            if (this.onAction) this.onAction();
            setTimeout(() => (this.keys.action = false), 300);
        });
    }

    onStart(e) {
        e.preventDefault();
        this.active = true;
        const touch = e.touches[0];
        const rect = this.joystick.getBoundingClientRect();
        this.startX = rect.left + rect.width / 2;
        this.startY = rect.top + rect.height / 2;
    }

    onMove(e) {
        if (!this.active) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);

        const limitedDistance = Math.min(distance, this.maxDistance);
        const moveX = Math.cos(angle) * limitedDistance;
        const moveY = Math.sin(angle) * limitedDistance;

        this.stick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

        // Update teclas
        const threshold = 15;
        this.keys.left = deltaX < -threshold;
        this.keys.right = deltaX > threshold;
        this.keys.up = deltaY < -threshold;
        this.keys.down = deltaY > threshold;
    }

    onEnd() {
        if (!this.active) return;
        this.active = false;
        this.stick.style.transform = `translate(-50%, -50%)`;

        // Reset teclas
        this.keys.left = false;
        this.keys.right = false;
        this.keys.up = false;
        this.keys.down = false;
    }
}
