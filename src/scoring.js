export class Scoring {
  calculate(word, timeRemaining, language) {
    if (!word) return 0;
    const lengthScore = word.length * 100;
    const timeBonus = Math.floor(Math.max(0, timeRemaining) * 10);
    const langBonus = this.languageBonus(language, word);
    return lengthScore + timeBonus + langBonus;
  }

  languageBonus(language, word) {
    if (!word) return 0;
    if (language === 'special') return 9999;        // titin
    if (language === 'de') return 500;              // German
    if (language === 'tr') return 750;              // Turkish
    if (language === 'el') return 600;              // Greek
    if (word.length > 40) return 1000;              // long English
    if (word.length > 20) return 300;
    return 0;
  }

  formatScore(score) {
    return score.toLocaleString();
  }

  getGrade(score) {
    if (score >= 10000) return { grade: 'S+', label: 'LEGENDARY LINGUIST', color: '#ff00ff' };
    if (score >= 5000) return { grade: 'S', label: 'WORD WIZARD', color: '#ffdd00' };
    if (score >= 3000) return { grade: 'A', label: 'VOCABULARY VIRTUOSO', color: '#44ffaa' };
    if (score >= 1500) return { grade: 'B', label: 'DECENT DICTIONARIAN', color: '#44aaff' };
    if (score >= 500) return { grade: 'C', label: 'ADEQUATE SPELLER', color: '#aaaaff' };
    return { grade: 'D', label: 'BARELY LITERATE', color: '#ff8888' };
  }
}
