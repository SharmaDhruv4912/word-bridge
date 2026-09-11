export class ZombieHorde {
  constructor(canvas) {
    this.canvas = canvas;
    this.W = canvas.width;
    this.H = canvas.height;
    this.groundY = this.H - 90;
    this.reset(55);
  }

  reset(speed) {
    this.speed = speed;
    this.x = -200;
    this.paused = false;
    this.timeRemaining = 30;
    this.zombies = Array.from({ length: 8 }, (_, i) => ({
      offsetX: i * 35 - i * 5,
      offsetY: (i % 3) * 4,
      frameOffset: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 0.4,
      variant: i % 3, // 0=basic, 1=fat, 2=tall
    }));
  }

  pause(p) { this.paused = p; }

  update(dt) {
    if (this.paused) return;
    this.x += this.speed * dt;
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
  }

  caughtPlayers(playerX) {
    return this.x + 160 >= playerX;
  }

  getTimeRemaining() { return this.timeRemaining; }

  render(ctx) {
    const t = Date.now() / 300;
    this.zombies.forEach((z, i) => {
      const zx = this.x + z.offsetX;
      const zy = this.groundY + z.offsetY;
      this.drawZombie(ctx, zx, zy, z.size, t + z.frameOffset, z.variant);
    });

    // Dust cloud behind horde
    ctx.fillStyle = 'rgba(180, 150, 100, 0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x + 120, this.groundY - 10, 130, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawZombie(ctx, x, y, scale, t, variant) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const legSwing = Math.sin(t) * 15;
    const armSwing = Math.cos(t) * 10;
    const headWobble = Math.sin(t * 0.5) * 5;

    // Color variants
    const skinColors = ['#4a8a3a', '#5a7a2a', '#3a6a4a'];
    const bodyColors = ['#8B4513', '#6a3410', '#4a2a10'];
    const skin = skinColors[variant];
    const body = bodyColors[variant];

    // Legs
    ctx.fillStyle = '#2a3a1a';
    ctx.save(); ctx.translate(-6, -18); ctx.rotate(legSwing * 0.06);
    ctx.fillRect(-4, 0, 8, 18); ctx.restore();
    ctx.save(); ctx.translate(6, -18); ctx.rotate(-legSwing * 0.06);
    ctx.fillRect(-4, 0, 8, 18); ctx.restore();

    // Body
    ctx.fillStyle = body;
    if (variant === 1) { // fat
      ctx.fillRect(-14, -44, 28, 28);
    } else if (variant === 2) { // tall
      ctx.fillRect(-10, -50, 20, 34);
    } else {
      ctx.fillRect(-11, -44, 22, 26);
    }

    // Tattered shirt detail
    ctx.fillStyle = this.lighterColor(body);
    ctx.fillRect(-8, -42, 4, 12);

    // Outstretched arms
    ctx.fillStyle = skin;
    ctx.save(); ctx.translate(-11, -38); ctx.rotate((-0.4 + armSwing * 0.04) * Math.PI);
    ctx.fillRect(-22, -3, 22, 7); ctx.restore();

    // Head
    ctx.fillStyle = skin;
    ctx.strokeStyle = this.darkerColor(skin);
    ctx.lineWidth = 1;
    if (variant === 1) {
      ctx.beginPath();
      ctx.ellipse(headWobble, -58, 13, 12, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      ctx.fillRect(-9 + headWobble, -62, 18, 18);
      ctx.strokeRect(-9 + headWobble, -62, 18, 18);
    }

    // Eyes — glowing red
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 6;
    ctx.fillRect(-6 + headWobble, -58, 4, 4);
    ctx.fillRect(2 + headWobble, -58, 4, 4);
    ctx.shadowBlur = 0;

    // Mouth — open grin
    ctx.fillStyle = '#000';
    ctx.fillRect(-5 + headWobble, -50, 10, 4);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-4 + headWobble + i * 3, -50, 2, 3);
    }

    ctx.restore();
  }

  lighterColor(hex) {
    try {
      const num = parseInt(hex.replace('#',''), 16);
      const r = Math.min(255, (num >> 16) + 30);
      const g = Math.min(255, ((num >> 8) & 0xff) + 30);
      const b = Math.min(255, (num & 0xff) + 30);
      return `rgb(${r},${g},${b})`;
    } catch { return hex; }
  }

  darkerColor(hex) {
    try {
      const num = parseInt(hex.replace('#',''), 16);
      const r = Math.max(0, (num >> 16) - 30);
      const g = Math.max(0, ((num >> 8) & 0xff) - 30);
      const b = Math.max(0, (num & 0xff) - 30);
      return `rgb(${r},${g},${b})`;
    } catch { return hex; }
  }
}
