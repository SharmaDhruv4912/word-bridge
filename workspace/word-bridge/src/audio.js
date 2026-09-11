// Web Audio API synthesized sounds — no external files needed
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.initialized = false;

    // Unlock audio on first user interaction
    const unlock = () => {
      if (!this.initialized) {
        this.init();
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('click', unlock);
      }
    };
    document.addEventListener('keydown', unlock);
    document.addEventListener('click', unlock);
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.enabled = true;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not available');
    }
  }

  play(sound) {
    if (!this.enabled || !this.ctx) return;
    try {
      switch (sound) {
        case 'start': this.playStart(); break;
        case 'build': this.playBuild(); break;
        case 'collapse': this.playCollapse(); break;
        case 'invalid': this.playInvalid(); break;
        case 'levelComplete': this.playLevelComplete(); break;
        case 'gameOver': this.playGameOver(); break;
        case 'victory': this.playVictory(); break;
        case 'thud': this.playThud(); break;
        case 'crack': this.playCrack(); break;
      }
    } catch (e) {
      // Silently ignore audio errors
    }
  }

  // Letter thud when landing
  playThud() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Bridge building whoosh
  playBuild() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Collapse crumble
  playCollapse() {
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    source.start();
    source.stop(this.ctx.currentTime + 0.8);
  }

  // Invalid word — wah wah
  playInvalid() {
    const times = [0, 0.15, 0.3];
    const freqs = [440, 380, 300];
    times.forEach((t, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freqs[i];
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + 0.12);
      osc.start(this.ctx.currentTime + t);
      osc.stop(this.ctx.currentTime + t + 0.12);
    });
  }

  // Game start jingle
  playStart() {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  // Level complete fanfare
  playLevelComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Game over
  playGameOver() {
    const notes = [300, 250, 200, 150];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Victory
  playVictory() {
    const melody = [523, 523, 659, 523, 784, 740];
    const times = [0, 0.15, 0.3, 0.55, 0.7, 0.9];
    melody.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + times[i];
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Crack sound
  playCrack() {
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-20 * i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    source.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0.4;
    source.start();
    source.stop(this.ctx.currentTime + 0.15);
  }
}
