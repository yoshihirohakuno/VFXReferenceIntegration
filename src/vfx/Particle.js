export class Particle {
    constructor(x, y, color, velocityX, velocityY, life, size, drag = 0.985, gravity = 0.06, twinkle = 0) {
        this.x = x;
        this.y = y;
        this.vx = velocityX;
        this.vy = velocityY;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.drag = drag;
        this.gravity = gravity;
        this.twinkle = twinkle;
        this.seed = Math.random() * 1000;
    }

    update() {
        this.life--;
        this.vx *= this.drag;
        this.vy = this.vy * this.drag + this.gravity;
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const t = 1 - this.life / this.maxLife;
        // easing fade (brighter early)
        const alpha = Math.pow(1 - t, 0.55);
        const tw = this.twinkle ? (0.65 + 0.35 * Math.sin(this.seed + t * 18)) : 1;

        // Size interpolates slightly larger at start then shrinks? 
        // Reference: lerp(1.05, 0.55, t). 
        const s = this.size * (1.05 + (0.55 - 1.05) * t);

        ctx.save();
        ctx.globalAlpha = alpha * tw;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
