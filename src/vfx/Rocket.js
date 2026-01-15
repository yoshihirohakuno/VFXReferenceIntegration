export class Rocket {
    constructor(x, y, targetY, color = 'rgba(255,255,255,.9)') {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        // Initial velocity (upward)
        this.vy = -13.5 + Math.random() * 3; // -10.5 to -13.5
        this.color = color;

        this.trail = [];
        this.trailMax = 18;
        this.dead = false;
    }

    update() {
        if (this.dead) return;

        // Record trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailMax) this.trail.shift();

        this.y += this.vy;
        this.vy += 0.06; // slight slow up

        // Detonate if reached target or started falling
        if (this.y <= this.targetY || this.vy >= 0) {
            this.dead = true;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        // Draw trail
        ctx.save();
        // Glow is handled globally by composite operation usually, but we can enforce logic here if needed.
        // Reference: ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over';
        // We will assume global composite is set by Main loop, OR set it here specific for trails.
        // Let's rely on main loop settings for consistency, but reference sets strokeStyle.
        ctx.strokeStyle = 'rgba(255,255,255,.20)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // Draw head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
