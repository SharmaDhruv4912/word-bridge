import { TILE_WIDTH, TILE_HEIGHT } from './levels.js';
import { Physics } from './physics.js';

const TILE_COLORS = {
  en: { face: '#e8d5a0', top: '#f5e8c0', side: '#b8a070', border: '#8a7040' },
  de: { face: '#d0c8f0', top: '#e8e0ff', side: '#9080c0', border: '#604890' },
  tr: { face: '#f0d0c0', top: '#ffe0d0', side: '#c08060', border: '#904030' },
  el: { face: '#c0e8d0', top: '#d8f8e8', side: '#60a870', border: '#308040' },
  special: { face: '#ff8888', top: '#ffaaaa', side: '#cc4444', border: '#882222' },
};

export class Bridge {
  constructor(canvas) {
    this.canvas = canvas;
    this.H = canvas.height;
    this.groundY = this.H - 90;
    this.physics = new Physics();
    this.tiles = [];
    this.word = '';
    this.chasmX = 0;
    this.chasmWidth = 0;
    this.sufficient = false;
    this.collapsing = false;
    this.buildTimer = 0;
    this.builtCount = 0;
    this.language = 'en';
  }

  reset() {
    this.tiles = [];
    this.word = '';
    this.collapsing = false;
    this.buildTimer = 0;
    this.builtCount = 0;
  }

  build(word, chasmX, chasmWidth, sufficient, language) {
    this.reset();
    this.word = word;
    this.chasmX = chasmX;
    this.chasmWidth = chasmWidth;
    this.sufficient = sufficient;
    this.language = language || 'en';
    this.buildTimer = 0;
    this.builtCount = 0;

    const colors = TILE_COLORS[this.language] || TILE_COLORS.en;

    // Special rainbow for long words (>40 letters)
    const isRainbow = word.length > 40;

    for (let i = 0; i < word.length; i++) {
      const tx = chasmX + i * TILE_WIDTH;
      const ty = this.groundY - TILE_HEIGHT; // final resting Y
      const tileColor = isRainbow
        ? this.rainbowColor(i, word.length)
        : colors;

      this.tiles.push({
        letter: word[i].toUpperCase(),
        x: tx,
        y: ty - 200,      // start high, fall down
        targetY: ty,
        vx: 0,
        vy: 0,
        angle: (Math.random() - 0.5) * 0.3,
        targetAngle: 0,
        angularVel: 0,
        landed: false,
        landDelay: i * 130, // ms stagger
        spawned: false,
        collapsing: false,
        collapsed: false,
        cracking: false,
        crackProgress: 0,
        collapseDelay: 0,
        color: tileColor,
        isRainbow,
        index: i,
      });
    }
  }

  rainbowColor(i, total) {
    const hue = (i / total) * 360;
    return {
      face: `hsl(${hue}, 80%, 70%)`,
      top: `hsl(${hue}, 80%, 85%)`,
      side: `hsl(${hue}, 70%, 45%)`,
      border: `hsl(${hue}, 70%, 30%)`,
    };
  }

  collapse() {
    this.collapsing = true;
    const total = this.tiles.filter(t => t.landed).length;
    this.tiles.forEach((tile, i) => {
      if (tile.landed) {
        this.physics.launchTile(tile, i, total);
      }
    });
  }

  update(dt) {
    this.buildTimer += dt * 1000; // to ms

    // Spawn tiles progressively
    this.tiles.forEach((tile) => {
      if (!tile.spawned && this.buildTimer >= tile.landDelay) {
        tile.spawned = true;
        tile.vy = 200; // initial downward speed
      }

      if (tile.spawned && !tile.landed) {
        // Drop animation
        tile.y += tile.vy * dt;
        tile.vy += 600 * dt;
        tile.angle += tile.angularVel * dt;
        tile.angularVel *= 0.9;

        if (tile.y >= tile.targetY) {
          tile.y = tile.targetY;
          tile.vy = -tile.vy * 0.2; // small bounce
          tile.angle = tile.angle * 0.5;
          tile.angularVel = (Math.random() - 0.5) * 0.5;
          if (Math.abs(tile.vy) < 20) {
            tile.landed = true;
            tile.vy = 0;
            tile.angle = 0;
            tile.angularVel = 0;
          }
        }
      }

      // Collapse physics
      if (tile.cracking && !tile.collapsing) {
        tile.crackProgress = Math.min(1, tile.crackProgress + dt * 1.5);
        if (tile.crackProgress >= 1) {
          tile.cracking = false;
          tile.collapsing = true;
        }
      }

      if (tile.collapsing && !tile.collapsed) {
        if (tile.collapseDelay > 0) {
          tile.collapseDelay -= dt * 1000;
        } else {
          this.physics.applyGravity(tile, dt);
          if (tile.y > this.H + 100) {
            tile.collapsed = true;
          }
        }
      }
    });

    // Remove fully collapsed tiles
    this.tiles = this.tiles.filter(t => !t.collapsed);
  }

  isFullyBuilt() {
    return this.tiles.length > 0 && this.tiles.every(t => t.landed);
  }

  render(ctx) {
    if (this.tiles.length === 0) return;

    // Reach indicator
    if (!this.collapsing && this.tiles.length > 0) {
      const bridgeEnd = this.chasmX + this.tiles.length * TILE_WIDTH;
      const targetEnd = this.chasmX + this.chasmWidth;
      ctx.strokeStyle = bridgeEnd >= targetEnd ? '#44ff88' : '#ff6644';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.chasmX, this.groundY - TILE_HEIGHT - 14);
      ctx.lineTo(targetEnd, this.groundY - TILE_HEIGHT - 14);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Render tiles back-to-front (painter's algo)
    this.tiles.forEach(tile => {
      if (!tile.spawned) return;
      this.drawTile(ctx, tile);
    });
  }

  drawTile(ctx, tile) {
    ctx.save();
    ctx.translate(tile.x + TILE_WIDTH / 2, tile.y + TILE_HEIGHT / 2);
    ctx.rotate(tile.angle);

    const w = TILE_WIDTH - 2;
    const h = TILE_HEIGHT - 2;
    const hw = w / 2;
    const hh = h / 2;
    const depth = 6;

    const c = tile.color;

    // 3D effect — top face
    ctx.fillStyle = c.top;
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    ctx.lineTo(hw, -hh);
    ctx.lineTo(hw - depth, -hh - depth);
    ctx.lineTo(-hw - depth, -hh - depth);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = c.side;
    ctx.beginPath();
    ctx.moveTo(hw, -hh);
    ctx.lineTo(hw, hh);
    ctx.lineTo(hw - depth, hh - depth);
    ctx.lineTo(hw - depth, -hh - depth);
    ctx.closePath();
    ctx.fill();

    // Front face
    ctx.fillStyle = c.face;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 2;
    ctx.fillRect(-hw, -hh, w, h);
    ctx.strokeRect(-hw, -hh, w, h);

    // Letter
    ctx.fillStyle = c.border;
    ctx.font = `bold ${Math.floor(h * 0.6)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.letter, 0, 0);
    ctx.textBaseline = 'alphabetic'; // reset to default

    // Crack overlay
    if (tile.cracking || tile.collapsing) {
      const cp = tile.crackProgress || 1;
      ctx.strokeStyle = `rgba(0,0,0,${cp * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hw + 4, -hh + h * 0.2);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw - 4, hh - h * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-hw + 8, hh - 4);
      ctx.lineTo(-4, 0);
      ctx.stroke();
      // Dust particles
      if (cp > 0.5) {
        for (let p = 0; p < 3; p++) {
          ctx.fillStyle = `rgba(200,180,140,${(cp - 0.5) * 0.6})`;
          ctx.beginPath();
          ctx.arc(
            (Math.random() - 0.5) * w,
            (Math.random() - 0.5) * h,
            2, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }
}
