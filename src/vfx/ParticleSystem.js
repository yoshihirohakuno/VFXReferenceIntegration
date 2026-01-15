import { Particle } from './Particle.js';
import { Rocket } from './Rocket.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.rockets = [];
        this.palette = [
            '#ff4b4b', '#ffd93d', '#6bcfff',
            '#b983ff', '#3dffb5', '#ff7edb',
            '#ff934b', '#64ff8f', '#4b7dff'
        ];
    }

    update() {
        // Update Rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.update();
            if (r.dead) {
                // Detonate
                this.explode(r.x, r.y);
                this.rockets.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Rockets
        for (const r of this.rockets) r.draw(ctx);
        // Particles
        for (const p of this.particles) p.draw(ctx);
    }

    pickColor() {
        if (Math.random() < 0.12) return 'rgba(255,255,255,0.95)';
        return this.palette[Math.floor(Math.random() * this.palette.length)];
    }

    launchRocket(x, y) {
        // Target Y is random height in upper screen
        // Canvas height passed? No, need visual height. 
        // We can guess usually valid range or pass it in.
        // Assuming height ~ window.innerHeight. 
        // Target Y: 12% to 42% of screen height.
        const h = window.innerHeight; // Global access or pass in?
        const targetY = h * (0.12 + Math.random() * 0.3);

        // Spawn rocket at x, y
        // But Rocket class expects x, y=bottom. 
        // Our 'y' here is the hand position.
        // We want the rocket to START at hand position and go UP to targetY.
        // So:
        const r = new Rocket(x, y, targetY);
        this.rockets.push(r);
    }

    explode(x, y) {
        const power = 150 + Math.random() * 50;
        const speedMul = 1.5;
        const base = this.pickColor();
        const kind = Math.random();
        const TAU = Math.PI * 2;
        const rand = (a, b) => Math.random() * (b - a) + a;

        // 1) Classic Sphere
        if (kind < 0.55) {
            for (let i = 0; i < power; i++) {
                const a = Math.random() * TAU;
                const s = rand(1.2, 6.8) * speedMul;
                this.particles.push(new Particle(
                    x, y, base,
                    Math.cos(a) * s, Math.sin(a) * s,
                    rand(55, 95), rand(1.2, 2.8),
                    rand(0.975, 0.988), rand(0.04, 0.075),
                    Math.random() < 0.35 ? 1 : 0
                ));
            }
            // Glitter
            if (Math.random() < 0.55) {
                for (let i = 0; i < power * 0.25; i++) {
                    const a = Math.random() * TAU;
                    const s = rand(0.8, 4.0) * speedMul;
                    this.particles.push(new Particle(
                        x, y, 'rgba(255,255,255,0.85)',
                        Math.cos(a) * s, Math.sin(a) * s,
                        rand(28, 55), rand(0.8, 1.8),
                        rand(0.97, 0.985), rand(0.03, 0.06),
                        1
                    ));
                }
            }
            return;
        }

        // 2) Ring
        if (kind < 0.82) {
            const ringN = Math.floor(power * 0.9);
            const ringR = rand(1.5, 4.0) * speedMul;
            const tilt = rand(-0.35, 0.35);
            for (let i = 0; i < ringN; i++) {
                const t = i / ringN;
                const a = t * TAU;
                const s = ringR * rand(0.85, 1.15);
                const vx = Math.cos(a) * s;
                const vy = (Math.sin(a) * s) * (1 + tilt);
                this.particles.push(new Particle(
                    x, y, base, vx, vy,
                    rand(55, 90), rand(1.0, 2.5),
                    rand(0.978, 0.989), rand(0.035, 0.07),
                    Math.random() < 0.25 ? 1 : 0
                ));
            }
            return;
        }

        // 3) Chrysanthemum
        const shells = 3;
        for (let s = 0; s < shells; s++) {
            const col = (Math.random() < 0.35) ? 'rgba(255,255,255,0.92)' : this.pickColor();
            const p = Math.floor(power * rand(0.35, 0.55));
            const mul = speedMul * (0.85 + 0.2 * s);
            for (let i = 0; i < p; i++) {
                const a = Math.random() * TAU;
                const sp = rand(1.0, 5.5) * mul;
                this.particles.push(new Particle(
                    x, y, col,
                    Math.cos(a) * sp, Math.sin(a) * sp,
                    rand(45, 85) + s * 8, rand(1.0, 2.6),
                    rand(0.975, 0.988), rand(0.04, 0.075),
                    Math.random() < 0.45 ? 1 : 0
                ));
            }
        }
    }

    spawnSparkles(x, y, amount) {
        const col = this.pickColor();
        const TAU = Math.PI * 2;
        const rand = (a, b) => Math.random() * (b - a) + a;

        for (let i = 0; i < amount; i++) {
            const a = Math.random() * TAU;
            const sp = rand(0.6, 3.2);
            this.particles.push(new Particle(
                x, y, col,
                Math.cos(a) * sp, Math.sin(a) * sp,
                rand(20, 45), rand(0.8, 2.2),
                rand(0.965, 0.985), rand(0.02, 0.05),
                1
            ));
        }
    }
}
