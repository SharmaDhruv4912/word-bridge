import { Renderer } from './renderer.js';
import { ZombieHorde } from './zombie.js';
import { Characters } from './characters.js';
import { Bridge } from './bridge.js';
import { WordValidator } from './wordValidator.js';
import { UI } from './ui.js';
import { Scoring } from './scoring.js';
import { DictionaryMode } from './dictionaryMode.js';
import { AudioManager } from './audio.js';
import { LEVELS } from './levels.js';
import { Physics } from './physics.js';
import { GameState } from './gameState.js';

export { GameState };

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = GameState.TITLE;
    this.levelIndex = 0;
    this.score = 0;
    this.bestWord = '';
    this.lastTime = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeDuration = 0;
    this.levelTransitioning = false;

    this.renderer = new Renderer(this.canvas, this.ctx);
    this.characters = new Characters(this.canvas);
    this.zombies = new ZombieHorde(this.canvas);
    this.bridge = new Bridge(this.canvas);
    this.physics = new Physics();
    this.validator = new WordValidator();
    this.ui = new UI(this.canvas, this.ctx, this);
    this.scoring = new Scoring();
    this.dictMode = new DictionaryMode(this.canvas, this.ctx, this);
    this.audio = new AudioManager();

    this.setupInput();
    this.setupWordInput();
    requestAnimationFrame(this.loop.bind(this));
  }

  setupInput() {
    document.addEventListener('keydown', (e) => {
      if (this.state === GameState.TITLE && (e.key === 'Enter' || e.key === ' ')) {
        this.startGame();
      }
      if (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) {
        if (e.key === 'Enter' || e.key === ' ') this.resetGame();
      }
    });
  }

  setupWordInput() {
    const input = document.getElementById('word-input');
    const submitBtn = document.getElementById('submit-btn');
    const lengthBar = document.getElementById('length-bar');
    const validMsg = document.getElementById('validation-msg');

    input.addEventListener('input', () => {
      const word = input.value.trim();
      const level = LEVELS[this.levelIndex];
      const pct = Math.min(100, (word.length / level.minWordLength) * 100);
      lengthBar.style.width = pct + '%';
      lengthBar.className = pct >= 100 ? 'sufficient' : '';
      input.className = '';
      validMsg.textContent = word.length > 0 ? `${word.length} letters — need ${level.minWordLength}` : '';
    });

    submitBtn.addEventListener('click', () => this.handleWordSubmit());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleWordSubmit();
    });
  }

  async handleWordSubmit() {
    const input = document.getElementById('word-input');
    const validMsg = document.getElementById('validation-msg');
    const word = input.value.trim().toLowerCase();

    if (!word || word.length < 2) {
      this.shakeInput();
      validMsg.textContent = 'Type a real word!';
      return;
    }

    input.className = 'loading';
    validMsg.textContent = 'Checking...';

    const result = await this.validator.validate(word);

    if (!result.valid) {
      input.className = 'invalid';
      validMsg.textContent = "That's not a real word! Try again.";
      this.shakeInput();
      this.audio.play('invalid');
      return;
    }

    input.className = 'valid';
    const level = LEVELS[this.levelIndex];
    const sufficient = word.length >= level.minWordLength;

    if (this.bestWord.length < word.length) this.bestWord = word;

    this.hideWordInput();
    this.audio.play('build');

    if (sufficient) {
      this.bridge.build(word, level.chasmX, level.chasmWidth, true, result.language);
      this.setState(GameState.BRIDGE_BUILDING);
      setTimeout(() => this.setState(GameState.BRIDGE_CROSSING), word.length * 120 + 800);
    } else {
      this.bridge.build(word, level.chasmX, level.chasmWidth, false, result.language);
      this.setState(GameState.BRIDGE_BUILDING);
      setTimeout(() => {
        this.bridge.collapse();
        this.triggerShake(400, 8);
        this.audio.play('collapse');
        this.setState(GameState.BRIDGE_COLLAPSE);
        setTimeout(() => {
          this.characters.stumbleBack();
          this.setState(GameState.GATEKEEPER_CHALLENGE);
          this.showWordInput();
        }, 2000);
      }, word.length * 120 + 800);
    }
  }

  shakeInput() {
    const input = document.getElementById('word-input');
    input.style.animation = 'none';
    input.offsetHeight; // reflow
    input.style.animation = 'shake 0.4s';
  }

  triggerShake(duration, intensity) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  startGame() {
    this.levelIndex = 0;
    this.score = 0;
    this.bestWord = '';
    this.levelTransitioning = false;
    const lv = LEVELS[0];
    this.characters.reset();
    this.zombies.reset(lv.zombieSpeed, lv.zombieStartX, lv.timeLimit);
    this.setState(GameState.RUNNING);
    this.audio.play('start');
  }

  resetGame() {
    this.startGame();
  }

  startLevel() {
    this.levelTransitioning = false;
    const level = LEVELS[this.levelIndex];
    this.characters.reset();
    this.zombies.reset(level.zombieSpeed, level.zombieStartX, level.timeLimit);
    this.bridge.reset();
    this.setState(GameState.RUNNING);
  }

  setState(newState) {
    this.state = newState;

    if (newState === GameState.GATEKEEPER_CHALLENGE) {
      this.showWordInput();
      this.characters.stopRunning();
      this.zombies.pause(false);
    }
    if (newState === GameState.RUNNING) {
      this.hideWordInput();
      this.zombies.pause(false);
    }
    if (newState === GameState.BRIDGE_CROSSING) {
      this.zombies.pause(true);
      this.characters.startCrossing(this.bridge);
    }
    if (newState === GameState.LEVEL_COMPLETE) {
      this.zombies.pause(true);
      const level = LEVELS[this.levelIndex];
      const timeBonus = Math.max(0, this.zombies.getTimeRemaining());
      this.score += this.scoring.calculate(this.bestWord, timeBonus, 'en');
      this.audio.play('levelComplete');
    }
    if (newState === GameState.GAME_OVER) {
      this.hideWordInput();
      this.audio.play('gameOver');
    }
    if (newState === GameState.VICTORY) {
      this.audio.play('victory');
    }
  }

  showWordInput() {
    const c = document.getElementById('word-input-container');
    c.style.display = 'flex';
    document.getElementById('word-input').value = '';
    document.getElementById('word-input').className = '';
    document.getElementById('length-bar').style.width = '0%';
    document.getElementById('validation-msg').textContent = '';
    setTimeout(() => document.getElementById('word-input').focus(), 100);
  }

  hideWordInput() {
    document.getElementById('word-input-container').style.display = 'none';
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // Screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt * 1000;
      const i = this.shakeIntensity || 6;
      this.shakeX = (Math.random() - 0.5) * i;
      this.shakeY = (Math.random() - 0.5) * i;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    const level = LEVELS[this.levelIndex] || LEVELS[LEVELS.length - 1];

    if (this.state === GameState.RUNNING) {
      this.characters.update(dt, level);
      this.zombies.update(dt);
      this.renderer.updateParallax(dt);

      // Characters reached the chasm
      if (this.characters.reachedChasm(level)) {
        this.setState(GameState.GATEKEEPER_CHALLENGE);
      }

      // Zombies caught up
      if (this.zombies.caughtPlayers(this.characters.getX())) {
        this.setState(GameState.GAME_OVER);
      }
    }

    if (this.state === GameState.GATEKEEPER_CHALLENGE) {
      this.zombies.update(dt);
      this.renderer.updateParallax(dt);
      if (this.zombies.caughtPlayers(this.characters.getX())) {
        this.hideWordInput();
        this.setState(GameState.GAME_OVER);
      }
    }

    if (this.state === GameState.BRIDGE_BUILDING || this.state === GameState.BRIDGE_COLLAPSE) {
      this.bridge.update(dt);
      this.zombies.update(dt);
    }

    if (this.state === GameState.BRIDGE_CROSSING) {
      this.characters.updateCrossing(dt, this.bridge, level);
      this.bridge.update(dt);
      if (this.characters.crossingComplete(level) && !this.levelTransitioning) {
        this.levelTransitioning = true;
        this.setState(GameState.LEVEL_COMPLETE);
        setTimeout(() => {
          this.levelIndex++;
          if (this.levelIndex >= LEVELS.length) {
            this.setState(GameState.VICTORY);
          } else {
            this.startLevel();
          }
        }, 3000);
      }
    }

    if (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) {
      this.zombies.update(dt);
      this.characters.update(dt, level);
    }

    this.ui.update(dt, this.state);
    this.dictMode.update(dt);
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    const level = LEVELS[this.levelIndex] || LEVELS[LEVELS.length - 1];

    if (this.state === GameState.TITLE) {
      this.renderer.titleTimer += dt;
      this.renderer.drawTitleScreen();
    } else if (this.state === GameState.DICTIONARY_MODE || this.state === GameState.SANDBOX) {
      this.dictMode.render();
    } else {
      this.renderer.drawBackground(level);
      this.renderer.drawGround(level);
      this.bridge.render(ctx);
      this.characters.render(ctx);
      this.zombies.render(ctx);
      this.ui.render(this.state, level, this.score, this.zombies.getTimeRemaining(), this.levelIndex);
    }

    ctx.restore();
  }
}

// Start
window.addEventListener('load', () => {
  new Game();
});

// Add shake keyframe
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(-50%) translateX(0); }
  20% { transform: translateX(-50%) translateX(-8px); }
  40% { transform: translateX(-50%) translateX(8px); }
  60% { transform: translateX(-50%) translateX(-6px); }
  80% { transform: translateX(-50%) translateX(6px); }
}`;
document.head.appendChild(style);
