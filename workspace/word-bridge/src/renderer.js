import { LEVELS } from './levels.js';

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.W = canvas.width;
    this.H = canvas.height;
    this.parallaxX = [0, 0]; // two layers
    this.titleTimer = 0;
    this.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 300,
      r: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  updateParallax(dt) {
    this.parallaxX[0] -= 30 * dt;
    this.parallaxX[1] -= 60 * dt;
    this.titleTimer += dt;
  }

  drawBackground(level) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    grad.addColorStop(0, level.bgColor);
    grad.addColorStop(1, this.lighten(level.bgColor, 40));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Clouds (parallax layer 1)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const cloudPositions = [50, 200, 380, 560, 720];
    cloudPositions.forEach((cx, i) => {
      const x = ((cx + this.parallaxX[0] * 0.3) % (W + 200) + W + 200) % (W + 200) - 100;
      const y = 40 + i * 18;
      this.drawCloud(x, y, 60 + i * 10);
    });

    // Distant hills (parallax layer 2)
    ctx.fillStyle = this.darken(level.bgColor, 20);
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62);
    for (let x = 0; x <= W; x += 40) {
      const ox = ((x + this.parallaxX[1] * 0.15) % (W + 80) + W + 80) % (W + 80) - 40;
      const hy = H * 0.62 - Math.sin(ox * 0.02 + 1) * 40 - Math.sin(ox * 0.035) * 25;
      ctx.lineTo(x, hy);
    }
    ctx.lineTo(W, H * 0.62);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
  }

  drawGround(level) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const groundY = H - 90;
    const chasmX = level.chasmX;
    const chasmW = level.chasmWidth;
    const rightX = chasmX + chasmW;

    // ── Left platform ──
    ctx.fillStyle = level.groundColor;
    ctx.fillRect(0, groundY, chasmX, H - groundY);

    // Grass strip
    ctx.fillStyle = '#4cb832';
    ctx.fillRect(0, groundY, chasmX, 10);

    // Grass highlight
    ctx.fillStyle = '#6ad640';
    ctx.fillRect(0, groundY, chasmX, 4);

    // Dirt horizontal layers
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let y = groundY + 22; y < H; y += 18) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(chasmX, y); ctx.stroke();
    }

    // Grass tufts at chasm edge
    for (let gx = chasmX - 50; gx <= chasmX - 6; gx += 10) {
      ctx.fillStyle = '#3aaa28';
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 3, groundY - 8);
      ctx.lineTo(gx + 3, groundY - 8);
      ctx.closePath();
      ctx.fill();
    }

    // ── Right platform ──
    ctx.fillStyle = level.groundColor;
    ctx.fillRect(rightX, groundY, W - rightX, H - groundY);
    ctx.fillStyle = '#4cb832';
    ctx.fillRect(rightX, groundY, W - rightX, 10);
    ctx.fillStyle = '#6ad640';
    ctx.fillRect(rightX, groundY, W - rightX, 4);
    for (let y = groundY + 22; y < H; y += 18) {
      ctx.beginPath(); ctx.moveTo(rightX, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Grass tufts at right chasm edge
    for (let gx = rightX + 6; gx <= rightX + 50; gx += 10) {
      ctx.fillStyle = '#3aaa28';
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 3, groundY - 8);
      ctx.lineTo(gx + 3, groundY - 8);
      ctx.closePath();
      ctx.fill();
    }

    // ── Chasm void ──
    const voidGrad = ctx.createLinearGradient(chasmX, groundY, chasmX, H);
    voidGrad.addColorStop(0, '#1a0033');
    voidGrad.addColorStop(0.4, '#0a0018');
    voidGrad.addColorStop(1, '#000000');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(chasmX, groundY, chasmW, H - groundY);

    // Chasm inner glow lines
    ctx.strokeStyle = 'rgba(160, 60, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let cy = groundY + 15; cy < H; cy += 25) {
      ctx.beginPath();
      ctx.moveTo(chasmX + 4, cy);
      ctx.lineTo(rightX - 4, cy);
      ctx.stroke();
    }

    // Chasm edge purple glow
    const glowL = ctx.createLinearGradient(chasmX, 0, chasmX + 12, 0);
    glowL.addColorStop(0, 'rgba(180, 80, 255, 0.5)');
    glowL.addColorStop(1, 'rgba(180, 80, 255, 0)');
    ctx.fillStyle = glowL;
    ctx.fillRect(chasmX, groundY, 12, H - groundY);

    const glowR = ctx.createLinearGradient(rightX - 12, 0, rightX, 0);
    glowR.addColorStop(0, 'rgba(180, 80, 255, 0)');
    glowR.addColorStop(1, 'rgba(180, 80, 255, 0.5)');
    ctx.fillStyle = glowR;
    ctx.fillRect(rightX - 12, groundY, 12, H - groundY);

    // Floating dust motes in chasm
    const t = Date.now() / 2000;
    ctx.fillStyle = 'rgba(200, 150, 255, 0.4)';
    for (let m = 0; m < 4; m++) {
      const mx = chasmX + ((m * 57 + t * 30) % chasmW);
      const my = groundY + 20 + ((m * 43 + t * 25) % (H - groundY - 30));
      ctx.beginPath();
      ctx.arc(mx, my, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chasm width label
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`need ${level.minWordLength}+ letters`, chasmX + chasmW / 2, groundY + 18);
  }

  drawCloud(x, y, size) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x - size * 0.35, y + size * 0.05, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTitleScreen() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    // titleTimer is updated by updateParallax — don't add here again

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0a2e');
    grad.addColorStop(1, '#0a051a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Twinkling stars
    this.stars.forEach(s => {
      s.twinkle += 0.05;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Title
    ctx.save();
    const scale = 1 + Math.sin(this.titleTimer * 1.5) * 0.02;
    ctx.translate(W / 2, 130);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ff6b35';
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth = 6;
    ctx.font = 'bold 58px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('WORD BRIDGE', 0, 0);
    ctx.fillText('WORD BRIDGE', 0, 0);
    ctx.fillStyle = '#ffdd44';
    ctx.strokeStyle = '#ff8800';
    ctx.font = 'bold 42px Arial';
    ctx.strokeText('ESCAPE', 0, 50);
    ctx.fillText('ESCAPE', 0, 50);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Type long words to bridge the gap and escape the undead!', W / 2, 220);

    // Animated zombies walking
    for (let i = 0; i < 5; i++) {
      const zx = ((i * 160 + this.titleTimer * 40) % (W + 100)) - 50;
      this.drawZombieSimple(zx, H - 60, 1);
    }

    // Ground
    ctx.fillStyle = '#2a4a1a';
    ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = '#3a6a2a';
    ctx.fillRect(0, H - 70, W, 8);

    // Start prompt
    const pulse = Math.abs(Math.sin(this.titleTimer * 3));
    ctx.fillStyle = `rgba(255, 220, 68, ${0.5 + pulse * 0.5})`;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press ENTER or SPACE to start!', W / 2, H - 90);

    // Mode buttons hint
    ctx.fillStyle = 'rgba(200,150,255,0.7)';
    ctx.font = '14px Arial';
    ctx.fillText('🗂️  Dictionary Mode available after clearing Level 1', W / 2, H - 55);
  }

  drawZombieSimple(x, y, scale) {
    const ctx = this.ctx;
    const t = Date.now() / 400;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // Body
    ctx.fillStyle = '#4a7a3a';
    ctx.fillRect(-10, -30, 20, 25);
    // Head
    ctx.fillStyle = '#6aaa4a';
    ctx.fillRect(-8, -50, 16, 18);
    // Eyes
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(-5, -45, 4, 4);
    ctx.fillRect(1, -45, 4, 4);
    // Arms outstretched
    const armSwing = Math.sin(t) * 8;
    ctx.fillStyle = '#4a7a3a';
    ctx.save();
    ctx.translate(-10, -25);
    ctx.rotate((-0.3 + armSwing * 0.05) * Math.PI);
    ctx.fillRect(-20, -3, 20, 6);
    ctx.restore();
    // Legs
    const legSwing = Math.sin(t) * 10;
    ctx.fillStyle = '#3a5a2a';
    ctx.save();
    ctx.translate(-4, -5);
    ctx.rotate(legSwing * 0.05);
    ctx.fillRect(-4, 0, 8, 20);
    ctx.restore();
    ctx.save();
    ctx.translate(4, -5);
    ctx.rotate(-legSwing * 0.05);
    ctx.fillRect(-4, 0, 8, 20);
    ctx.restore();
    ctx.restore();
  }

  // Color helpers
  lighten(hex, amount) {
    return this.adjustColor(hex, amount);
  }
  darken(hex, amount) {
    return this.adjustColor(hex, -amount);
  }
  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `rgb(${r},${g},${b})`;
  }
}
