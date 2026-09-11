// Curated special words for Dictionary Mode
export const CURATED_WORDS = [
  {
    word: 'Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz',
    language: 'de',
    languageName: 'German',
    length: 63,
    hint: 'A German law about beef labelling oversight delegation',
    funFact: 'This was a real German law about the delegation of duties for the supervision of beef labelling. It was repealed in 2013.',
    flag: '🇩🇪',
    bridgeColor: 'de',
  },
  {
    word: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesinesine',
    language: 'tr',
    languageName: 'Turkish',
    length: 70,
    hint: 'Turkish: "As if you are one of those whom we cannot make into an unsuccessful one"',
    funFact: 'Turkish agglutinative morphology allows theoretically infinite word construction.',
    flag: '🇹🇷',
    bridgeColor: 'tr',
  },
  {
    word: 'pneumonoultramicroscopicsilicovolcanoconiosis',
    language: 'en',
    languageName: 'English',
    length: 45,
    hint: 'A lung disease caused by inhaling very fine silica dust',
    funFact: 'At 45 letters, it is the longest word in major English dictionaries.',
    flag: '🇬🇧',
    bridgeColor: 'en',
  },
  {
    word: 'Lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon',
    language: 'el',
    languageName: 'Ancient Greek',
    length: 183,
    hint: 'From Aristophanes — a fictional dish made of all leftovers',
    funFact: 'From the comedy "Assemblywomen" by Aristophanes (391 BC). Often cited as the longest word in literature.',
    flag: '🇬🇷',
    bridgeColor: 'el',
  },
  {
    word: 'methionylthreonylthreonylglutaminylarginyl',
    language: 'special',
    languageName: 'Chemical (Titin)',
    length: 189819,
    hint: 'The chemical name of titin, the largest known protein (189,819 letters)',
    funFact: 'The full name takes over 3 hours to pronounce. We\'ll accept the first 50 characters.',
    flag: '🔬',
    bridgeColor: 'special',
  },
];

export class DictionaryMode {
  constructor(canvas, ctx, game) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.game = game;
    this.W = canvas.width;
    this.H = canvas.height;
    this.selectedChallenge = null;
    this.sandboxLeaderboard = this.loadLeaderboard();
    this.view = 'menu'; // 'menu' | 'challenge' | 'sandbox'
    this.timer = 0;
  }

  loadLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem('wordbridge_leaderboard') || '[]');
    } catch {
      return [];
    }
  }

  saveLeaderboard() {
    try {
      localStorage.setItem('wordbridge_leaderboard', JSON.stringify(this.sandboxLeaderboard));
    } catch {}
  }

  addToLeaderboard(word, score, language) {
    this.sandboxLeaderboard.push({ word: word.substring(0, 30), score, language, date: Date.now() });
    this.sandboxLeaderboard.sort((a, b) => b.score - a.score);
    this.sandboxLeaderboard = this.sandboxLeaderboard.slice(0, 10);
    this.saveLeaderboard();
  }

  update(dt) {
    this.timer += dt;
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // Dark background
    ctx.fillStyle = '#0a051a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#9b59b6';
    ctx.strokeStyle = '#6c3483';
    ctx.lineWidth = 4;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('📖 DICTIONARY MODE', W / 2, 55);
    ctx.fillText('📖 DICTIONARY MODE', W / 2, 55);

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '15px Arial';
    ctx.fillText('Challenge yourself with the world\'s longest words', W / 2, 80);

    // Challenge cards
    const cardW = 160;
    const cardH = 110;
    const cols = 3;
    const startX = (W - cols * (cardW + 12)) / 2;
    const startY = 105;

    CURATED_WORDS.forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + 12);
      const cy = startY + row * (cardH + 10);
      this.drawChallengeCard(ctx, cx, cy, cardW, cardH, entry);
    });

    // Sandbox section
    const sbY = startY + Math.ceil(CURATED_WORDS.length / cols) * (cardH + 10) + 10;
    ctx.fillStyle = '#2c3e50';
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 20, sbY, W - 40, 100, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔓 FREE-FORM SANDBOX', W / 2, sbY + 28);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '13px Arial';
    ctx.fillText('Type any word from any language — no zombies, no pressure', W / 2, sbY + 52);

    // Leaderboard mini
    if (this.sandboxLeaderboard.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Top scores:', 30, sbY + 75);
      this.sandboxLeaderboard.slice(0, 3).forEach((entry, i) => {
        ctx.fillStyle = '#ffdd44';
        ctx.fillText(
          `${i + 1}. ${entry.word.substring(0, 20)}... (${entry.score.toLocaleString()})`,
          130, sbY + 75 + 0
        );
      });
    }

    // Back hint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ESC or click title to go back', W / 2, H - 15);
  }

  drawChallengeCard(ctx, x, y, w, h, entry) {
    const hover = false; // static for now
    ctx.fillStyle = '#1a1030';
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fill(); ctx.stroke();

    // Flag + language
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(entry.flag, x + w / 2, y + 28);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(entry.languageName, x + w / 2, y + 46);

    // Length badge
    ctx.fillStyle = '#ff6b35';
    this.roundRect(ctx, x + w / 2 - 28, y + 52, 56, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const displayLen = entry.length > 1000 ? '189,819' : entry.length;
    ctx.fillText(`${displayLen} letters`, x + w / 2, y + 64);

    // Hint (truncated)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    const hintText = entry.hint.substring(0, 30) + (entry.hint.length > 30 ? '...' : '');
    ctx.fillText(hintText, x + w / 2, y + 82);

    // Play button
    ctx.fillStyle = '#27ae60';
    this.roundRect(ctx, x + 10, y + h - 26, w - 20, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('▶ CHALLENGE', x + w / 2, y + h - 12);
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
