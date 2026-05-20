import * as THREE from 'three';
import { createCashRegister } from './cashRegister.js';
import { createTablePlant } from './plantTable.js';
import { createPizza } from './pizza.js';
import { createJuiceGlass } from './juice.js';

export function createCounter() {
    const matNeonBlue = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2,
    });
    const matCounter = new THREE.MeshPhongMaterial({ color: 0x151525, shininess: 40 });
    const matMetal = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });

    const group = new THREE.Group();

    const height = 8 * 1.05;
    const base = new THREE.Mesh(new THREE.BoxGeometry(8, height, 70), matCounter);
    base.position.set(0, height / 2, 0);
    group.add(base);

    const topPartHeight = 1;
    const topPart = new THREE.Mesh(new THREE.BoxGeometry(9, topPartHeight, 71.5), matMetal);
    topPart.position.set(0, height + topPartHeight / 2, 0);
    group.add(topPart);

    const neon = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 70.5), matNeonBlue);
    neon.position.set(0, 5, 0);
    group.add(neon);

    const cashReg = createCashRegister();
    cashReg.scale.setScalar(1.5);
    cashReg.position.set(0, 9.4, 20);
    cashReg.rotation.y = -Math.PI / 2;
    group.add(cashReg);

    const plant = createTablePlant();
    plant.scale.setScalar(3.375);
    plant.position.set(0, 9.4, -20);
    group.add(plant);

    const pizza = createPizza();
    pizza.scale.setScalar(3);
    pizza.position.set(0, 9.4, 0);
    group.add(pizza);

    const juice = createJuiceGlass();
    juice.scale.setScalar(3);
    juice.position.set(1.5, 9.4, 3);
    group.add(juice);

    return {
        group,
        updateTheme: (theme) => { // Muda o tema ao balcão
            matCounter.color.setHex(theme.COUNTER || theme.STRUCTURE);
            matMetal.color.setHex(theme.METAL);
            matNeonBlue.color.setHex(theme.NEON || theme.FRAME);
            matNeonBlue.emissive.setHex(theme.NEON || theme.FRAME);
        }
    };
}
