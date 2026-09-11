import { GameState } from './gameState.js';
import { Gatekeeper } from './characters.js';
import { Scoring } from './scoring.js';
import { LEVELS } from './levels.js';

export class UI {
  constructor(canvas, ctx, game) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.game = game;
    this.W = canvas.width;
    this.H = canvas.height;
    this.gatekeeper = new Gatekeeper(canvas);
    this.scoring = new Scoring();
    this.particles = [];
    this.bannerTimer = 0;
    this.bannerText = '';
    this.bannerColor = '#ffdd44';
  }

  showBanner(text, color = '#ffdd44') {
    this.bannerText = text;
    this.bannerColor = color;
    this.bannerTimer = 3;
  }

  spawnConfetti(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 300,
        vy: -Math.random() * 400 - 100,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`,
        size: Math.random() * 8 + 4,
        life: 1,
        decay: Math.random() * 0.5 + 0.5,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        angle: Math.random() * Math.PI * 2,
        angularVel: (Math.random() - 0.5) * 8,
      });
    }
  }

  update(dt, state) {
    this.bannerTimer = Math.max(0, this.bannerTimer - dt);

    // Update particles
    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.angle += p.angularVel * dt;
      p.life -= p.decay * dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    if (state === GameState.GATEKEEPER_CHALLENGE) {
      this.gatekeeper.update(dt);
    }
  }

  render(state, level, score, timeRemaining, levelIndex) {
    const ctx = this.ctx;

    if (state === GameState.RUNNING ||
        state === GameState.GATEKEEPER_CHALLENGE ||
        state === GameState.BRIDGE_BUILDING ||
        state === GameState.BRIDGE_COLLAPSE ||
        state === GameState.BRIDGE_CROSSING ||
        state === GameState.LEVEL_COMPLETE) {

      this.drawHUD(score, timeRemaining, levelIndex, level);
    }

    if (state === GameState.GATEKEEPER_CHALLENGE ||
        state === GameState.BRIDGE_BUILDING ||
        state === GameState.BRIDGE_COLLAPSE) {
      this.gatekeeper.render(ctx, level.chasmX, level.chasmWidth);
    }

    if (state === GameState.LEVEL_COMPLETE) {
      this.drawLevelComplete(levelIndex, score);
    }

    if (state === GameState.GAME_OVER) {
      this.drawGameOver(score);
    }

    if (state === GameState.VICTORY) {
      this.drawVictory(score);
      this.spawnConfettiLoop();
    }

    // Particles
    this.renderParticles();

    // Banner
    if (this.bannerTimer > 0) {
      this.drawBanner();
    }
  }

  drawHUD(score, timeRemaining, levelIndex, level) {
    const ctx = this.ctx;
    const W = this.W;

    // Timer bar background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.roundRect(ctx, 10, 10, 200, 24, 6);
    ctx.fill();

    // Timer bar fill
    const pct = Math.max(0, timeRemaining / level.timeLimit);
    const barColor = pct > 0.5 ? '#44ff88' : pct > 0.25 ? '#ffdd44' : '#ff3344';
    ctx.fillStyle = barColor;
    this.roundRect(ctx, 12, 12, Math.max(0, 196 * pct), 20, 4);
    ctx.fill();

    // Timer text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱ ${Math.ceil(timeRemaining)}s`, 18, 26);

    // Score
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.roundRect(ctx, W - 160, 10, 150, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`★ ${score.toLocaleString()}`, W - 14, 26);

    // Level indicator
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.roundRect(ctx, W / 2 - 70, 10, 140, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${levelIndex + 1}: ${level.name}`, W / 2, 26);

    // Zombie warning when close
    if (timeRemaining < 5) {
      const pulse = Math.abs(Math.sin(Date.now() / 200));
      ctx.fillStyle = `rgba(255, 50, 50, ${pulse * 0.3})`;
      ctx.fillRect(0, 0, W, this.H);
      ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ ZOMBIES INCOMING! ⚠', W / 2, 70);
    }
  }

  drawLevelComplete(levelIndex, score) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const t = Date.now() / 500;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    // Banner
    ctx.save();
    const scale = 1 + Math.sin(t) * 0.03;
    ctx.translate(W / 2, H / 2 - 40);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffdd44';
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 5;
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('LEVEL COMPLETE!', 0, 0);
    ctx.fillText('LEVEL COMPLETE!', 0, 0);
    ctx.restore();

    // Stars
    for (let i = 0; i < 3; i++) {
      const sx = W / 2 + (i - 1) * 80;
      const sy = H / 2 + 20;
      ctx.fillStyle = '#ffdd44';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('★', sx, sy);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score.toLocaleString()}`, W / 2, H / 2 + 70);
  }

  drawGameOver(score) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // Red overlay
    ctx.fillStyle = 'rgba(120, 0, 0, 0.8)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#ff3344';
    ctx.strokeStyle = '#880011';
    ctx.lineWidth = 6;
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('CONSUMED BY', W / 2, H / 2 - 80);
    ctx.fillText('CONSUMED BY', W / 2, H / 2 - 80);
    ctx.strokeText('UNDEAD PEDANTS', W / 2, H / 2 - 30);
    ctx.fillText('UNDEAD PEDANTS', W / 2, H / 2 - 30);

    // Emoji
    ctx.font = '48px Arial';
    ctx.fillText('🧟‍♂️🧟‍♀️🧟', W / 2, H / 2 + 30);

    // Score
    const grade = this.scoring.getGrade(score);
    ctx.fillStyle = grade.color;
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`Grade: ${grade.grade} — ${grade.label}`, W / 2, H / 2 + 80);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Final Score: ${score.toLocaleString()}`, W / 2, H / 2 + 110);

    // Buttons
    this.drawButton(ctx, W / 2 - 110, H / 2 + 140, 100, 36, 'TRY AGAIN', '#ff6b35');
    this.drawButton(ctx, W / 2 + 10, H / 2 + 140, 160, 36, '📖 DICT MODE', '#9b59b6');

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Press ENTER to restart', W / 2, H / 2 + 210);
  }

  drawVictory(score) {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const t = Date.now() / 600;

    ctx.fillStyle = 'rgba(0,40,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.save();
    ctx.translate(W / 2, H / 2 - 100);
    ctx.scale(1 + Math.sin(t) * 0.02, 1 + Math.cos(t) * 0.02);
    ctx.fillStyle = '#44ff88';
    ctx.strokeStyle = '#005522';
    ctx.lineWidth = 6;
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('YOU BRIDGED', 0, 0);
    ctx.fillText('YOU BRIDGED', 0, 0);
    ctx.strokeText('THE UNBRIDGEABLE!', 0, 48);
    ctx.fillText('THE UNBRIDGEABLE!', 0, 48);
    ctx.restore();

    // Emoji celebration
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉🏆🎊', W / 2, H / 2 + 10);

    // Score
    const grade = this.scoring.getGrade(score);
    ctx.fillStyle = grade.color;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Grade: ${grade.grade} — ${grade.label}`, W / 2, H / 2 + 70);
    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Final Score: ${score.toLocaleString()}`, W / 2, H / 2 + 100);

    // Share button
    this.drawButton(ctx, W / 2 - 80, H / 2 + 120, 160, 38, '📋 COPY SCORE', '#44aa66');
    this.drawButton(ctx, W / 2 - 90, H / 2 + 168, 180, 36, '📖 DICT MODE', '#9b59b6');

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Press ENTER to play again', W / 2, H / 2 + 230);

    // Click handler for copy
    this.victoryScore = score;
    this.victoryGrade = grade;
  }

  drawButton(ctx, x, y, w, h, label, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 5);
  }

  spawnConfettiLoop() {
    if (Math.random() < 0.3) {
      this.spawnConfetti(
        Math.random() * this.W,
        -10,
        5
      );
    }
  }

  renderParticles() {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawBanner() {
    const ctx = this.ctx;
    const W = this.W;
    const alpha = Math.min(1, this.bannerTimer * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.bannerColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(this.bannerText, W / 2, 120);
    ctx.fillText(this.bannerText, W / 2, 120);
    ctx.restore();
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
