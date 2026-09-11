export class Characters {
  constructor(canvas) {
    this.canvas = canvas;
    this.W = canvas.width;
    this.H = canvas.height;
    this.groundY = this.H - 90;
    this.reset();
  }

  reset() {
    this.x = 60;
    this.y = this.groundY;
    this.running = true;
    this.crossingBridge = false;
    this.crossingDone = false;
    this.stumbling = false;
    this.stumbleTimer = 0;
    this.frameTimer = 0;
    this.frame = 0;
    this.celebrateTimer = 0;
    this.celebrating = false;
    this.facingLeft = false;
  }

  stopRunning() {
    this.running = false;
  }

  stumbleBack() {
    this.stumbling = true;
    this.stumbleTimer = 0.5;
    this.facingLeft = true;
    setTimeout(() => { this.stumbling = false; this.facingLeft = false; }, 700);
  }

  startCrossing(bridge) {
    this.crossingBridge = true;
    this.crossingDone = false;
    this.running = true;
  }

  update(dt, level) {
    this.frameTimer += dt;
    if (this.frameTimer > 0.1) {
      this.frame = (this.frame + 1) % 4;
      this.frameTimer = 0;
    }

    if (this.stumbling) {
      this.x -= 60 * dt;
      this.stumbleTimer -= dt;
      if (this.stumbleTimer <= 0) this.stumbling = false;
      return;
    }

    if (this.celebrating) {
      this.celebrateTimer += dt;
      return;
    }

    if (this.running && !this.crossingBridge) {
      this.x += 120 * dt;
      const stopX = level.chasmX - 55;
      if (this.x >= stopX) {
        this.x = stopX;
        this.running = false;
      }
    }
  }

  updateCrossing(dt, bridge, level) {
    this.frameTimer += dt;
    if (this.frameTimer > 0.1) {
      this.frame = (this.frame + 1) % 4;
      this.frameTimer = 0;
    }

    if (!this.crossingDone) {
      this.x += 100 * dt;
      const farSide = level.chasmX + level.chasmWidth + 30;
      if (this.x >= farSide) {
        this.x = farSide;
        this.crossingDone = true;
        this.running = false;
        this.celebrating = true;
        this.celebrateTimer = 0;
      }
    }
  }

  crossingComplete(level) {
    return this.crossingDone;
  }

  reachedChasm(level) {
    return !this.running && this.x >= level.chasmX - 60;
  }

  getX() { return this.x; }

  render(ctx) {
    const groundY = this.groundY;
    // Character 1: Green Square
    this.drawGreenSquare(ctx, this.x, groundY);
    // Character 2: Purple Shirt (slightly behind)
    this.drawPurpleShirt(ctx, this.x - 28, groundY);
    // Gatekeeper on far side (rendered separately via level)
  }

  drawGreenSquare(ctx, x, y) {
    const f = this.frame;
    const bob = Math.sin(f * Math.PI / 2) * 3;
    const legSwing = Math.sin(f * Math.PI / 2) * 12;
    const dir = this.facingLeft ? -1 : 1;

    ctx.save();
    ctx.translate(x, y - bob);

    if (this.celebrating) {
      const jump = Math.abs(Math.sin(this.celebrateTimer * 8)) * 20;
      ctx.translate(0, -jump);
    }

    ctx.scale(dir, 1);

    // Body — green square
    ctx.fillStyle = '#44cc44';
    ctx.strokeStyle = '#228822';
    ctx.lineWidth = 2;
    ctx.fillRect(-14, -38, 28, 28);
    ctx.strokeRect(-14, -38, 28, 28);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -33, 7, 7);
    ctx.fillRect(1, -33, 7, 7);
    ctx.fillStyle = '#000';
    ctx.fillRect(-6, -31, 4, 4);
    ctx.fillRect(3, -31, 4, 4);

    // Mouth (happy or scared)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (this.stumbling) {
      ctx.arc(0, -23, 5, 0, Math.PI); // frown
    } else {
      ctx.arc(0, -27, 4, 0, Math.PI, true); // smile
    }
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#226622';
    ctx.save(); ctx.translate(-6, -10); ctx.rotate(legSwing * 0.04);
    ctx.fillRect(-4, 0, 8, 16); ctx.restore();
    ctx.save(); ctx.translate(6, -10); ctx.rotate(-legSwing * 0.04);
    ctx.fillRect(-4, 0, 8, 16); ctx.restore();

    // Arms
    ctx.fillStyle = '#44cc44';
    ctx.save(); ctx.translate(-14, -30); ctx.rotate(-legSwing * 0.04);
    ctx.fillRect(-10, -3, 10, 6); ctx.restore();
    ctx.save(); ctx.translate(14, -30); ctx.rotate(legSwing * 0.04);
    ctx.fillRect(0, -3, 10, 6); ctx.restore();

    // Celebrate stars
    if (this.celebrating) {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + this.celebrateTimer * 4;
        const sx = Math.cos(angle) * 25;
        const sy = Math.sin(angle) * 25 - 20;
        ctx.fillStyle = `hsl(${i * 60 + this.celebrateTimer * 200}, 100%, 60%)`;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', sx, sy - 30);
      }
    }

    ctx.restore();
  }

  drawPurpleShirt(ctx, x, y) {
    const f = this.frame;
    const bob = Math.sin((f + 2) * Math.PI / 2) * 3;
    const legSwing = Math.sin((f + 2) * Math.PI / 2) * 12;
    const dir = this.facingLeft ? -1 : 1;

    ctx.save();
    ctx.translate(x, y - bob);

    if (this.celebrating) {
      const jump = Math.abs(Math.sin(this.celebrateTimer * 8 + 1)) * 18;
      ctx.translate(0, -jump);
    }

    ctx.scale(dir, 1);

    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.strokeStyle = '#cc8844';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -46, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Hair
    ctx.fillStyle = '#553311';
    ctx.fillRect(-10, -58, 20, 10);
    ctx.beginPath();
    ctx.ellipse(0, -57, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -49, 3, 3);
    ctx.fillRect(2, -49, 3, 3);

    // Mouth
    ctx.strokeStyle = '#aa5533';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (this.stumbling) {
      ctx.arc(0, -41, 3, 0, Math.PI);
    } else {
      ctx.arc(0, -44, 3, 0, Math.PI, true);
    }
    ctx.stroke();

    // Purple shirt body
    ctx.fillStyle = '#9b59b6';
    ctx.strokeStyle = '#6c3483';
    ctx.lineWidth = 2;
    ctx.fillRect(-12, -38, 24, 26);
    ctx.strokeRect(-12, -38, 24, 26);

    // Shirt stripe
    ctx.fillStyle = '#7d3c98';
    ctx.fillRect(-12, -32, 24, 4);

    // Legs / jeans
    ctx.fillStyle = '#2c3e50';
    ctx.save(); ctx.translate(-5, -12); ctx.rotate(legSwing * 0.04);
    ctx.fillRect(-4, 0, 8, 16); ctx.restore();
    ctx.save(); ctx.translate(5, -12); ctx.rotate(-legSwing * 0.04);
    ctx.fillRect(-4, 0, 8, 16); ctx.restore();

    // Arms
    ctx.fillStyle = '#9b59b6';
    ctx.save(); ctx.translate(-12, -32); ctx.rotate(-legSwing * 0.04);
    ctx.fillRect(-10, -3, 10, 6); ctx.restore();
    ctx.save(); ctx.translate(12, -32); ctx.rotate(legSwing * 0.04);
    ctx.fillRect(0, -3, 10, 6); ctx.restore();

    ctx.restore();
  }
}

export class Gatekeeper {
  constructor(canvas) {
    this.canvas = canvas;
    this.W = canvas.width;
    this.H = canvas.height;
    this.groundY = this.H - 90;
    this.speechTimer = 0;
    this.speechLine = 0;
    this.monoclePopped = false;
    this.monoclePop = 0;
    this.hatBounce = 0;
    this.lines = [
      'HALT!',
      'Provide a word...',
      '...long enough to bridge this gap!',
    ];
  }

  startDialogue() {
    this.speechTimer = 0;
    this.speechLine = 0;
  }

  popMonocle() {
    this.monoclePopped = true;
    this.monoclePop = 0;
  }

  update(dt) {
    this.speechTimer += dt;
    if (this.speechTimer > 2.5) {
      this.speechTimer = 0;
      this.speechLine = (this.speechLine + 1) % this.lines.length;
    }
    if (this.monoclePopped) {
      this.monoclePop += dt;
      if (this.monoclePop > 2) this.monoclePopped = false;
    }
    this.hatBounce += dt;
  }

  render(ctx, chasmX, chasmWidth) {
    const x = chasmX + chasmWidth + 30;
    const y = this.groundY;
    const t = Date.now() / 500;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1); // face left toward players

    // Legs
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-8, -28, 7, 28);
    ctx.fillRect(1, -28, 7, 28);

    // Shoes
    ctx.fillStyle = '#000';
    ctx.fillRect(-10, -4, 10, 6);
    ctx.fillRect(1, -4, 12, 6);

    // Body — coat
    ctx.fillStyle = '#2c2c5a';
    ctx.strokeStyle = '#4a4a8a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-14, -58, 28, 32);
    ctx.strokeRect(-14, -58, 28, 32);

    // Lapels
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath();
    ctx.moveTo(-14, -58); ctx.lineTo(0, -45); ctx.lineTo(-14, -38); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -58); ctx.lineTo(0, -45); ctx.lineTo(14, -38); ctx.fill();

    // Bow tie
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(-6, -46); ctx.lineTo(0, -43); ctx.lineTo(-6, -40);
    ctx.moveTo(6, -46); ctx.lineTo(0, -43); ctx.lineTo(6, -40);
    ctx.fill();

    // Cane
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -60); ctx.lineTo(-14, 0);
    ctx.stroke();
    ctx.strokeStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(-18, -62, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#f5d5a0';
    ctx.strokeStyle = '#cc9966';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -68, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Mustache
    ctx.fillStyle = '#555533';
    ctx.beginPath();
    ctx.ellipse(-5, -63, 6, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -63, 6, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-7, -73, 4, 4);
    ctx.fillRect(3, -73, 4, 4);

    // Monocle
    if (!this.monoclePopped) {
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(5, -71, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // monocle flying away
      const mx = -20 + this.monoclePop * 60;
      const my = -20 - this.monoclePop * 80;
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Top hat
    const hatBob = Math.sin(this.hatBounce * 2) * 2;
    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    // Brim
    ctx.fillRect(-18, -84 + hatBob, 36, 6);
    ctx.strokeRect(-18, -84 + hatBob, 36, 6);
    // Crown
    ctx.fillRect(-12, -112 + hatBob, 24, 30);
    ctx.strokeRect(-12, -112 + hatBob, 24, 30);
    // Hat band
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(-12, -92 + hatBob, 24, 5);

    ctx.restore();

    // Speech bubble
    this.drawSpeechBubble(ctx, x - 20, y - 130);
  }

  drawSpeechBubble(ctx, x, y) {
    const line = this.lines[this.speechLine];
    const chars = Math.floor(this.speechTimer / 2.5 * line.length);
    const text = line.substring(0, Math.min(chars + 1, line.length));

    ctx.font = 'bold 14px Arial';
    const tw = ctx.measureText(line).width;
    const bw = tw + 24;
    const bh = 34;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x - bw / 2, y - bh, bw, bh, 8);
    ctx.fill(); ctx.stroke();

    // Tail
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y - 5);
    ctx.lineTo(x + 5, y - bh + 5);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - bh / 2 + 5);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
