import { COMMON_WORDS } from '../assets/words.js';

// Special curated long words that should always validate
const SPECIAL_WORDS = new Set([
  'rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz',
  'muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesinesine',
  'lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon',
  'pneumonoultramicroscopicsilicovolcanoconiosis',
]);

export class WordValidator {
  constructor() {
    this.cache = new Map();
    this.apiAvailable = true;
    // Pre-populate cache with special long words
    SPECIAL_WORDS.forEach(word => {
      const lang = word.includes('ü') || word.includes('Rind') ? 'de'
        : word.includes('ş') ? 'tr'
        : word.includes('ίο') ? 'el'
        : 'en';
      this.cache.set(word, { valid: true, language: lang });
    });
  }

  async validate(word) {
    const lower = word.toLowerCase();

    // Check cache first
    if (this.cache.has(lower)) {
      return this.cache.get(lower);
    }

    // Special curated words
    if (SPECIAL_WORDS.has(lower)) {
      const result = { valid: true, language: lower.includes('ü') ? 'de' : lower.includes('ş') ? 'tr' : 'en' };
      this.cache.set(lower, result);
      return result;
    }

    // Local dictionary check
    if (COMMON_WORDS.has(lower)) {
      const result = { valid: true, language: 'en' };
      this.cache.set(lower, result);
      return result;
    }

    // Titin special case — accept any word starting with "methionyl" and length >= 50
    if (lower.startsWith('methionyl') && lower.length >= 50) {
      const result = { valid: true, language: 'special' };
      this.cache.set(lower, result);
      return result;
    }

    // API fallback
    if (this.apiAvailable) {
      try {
        const result = await this.fetchFromAPI(lower);
        this.cache.set(lower, result);
        return result;
      } catch (e) {
        console.warn('Dictionary API unavailable, falling back to length-only mode');
        this.apiAvailable = false;
      }
    }

    // Fallback: length-only mode
    if (word.length >= 3) {
      const result = { valid: true, language: 'unknown', fallback: true };
      this.cache.set(lower, result);
      return result;
    }

    return { valid: false };
  }

  async fetchFromAPI(word) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (response.status === 404) {
        return { valid: false };
      }

      if (response.ok) {
        const data = await response.json();
        const lang = data[0]?.phonetics?.[0] ? 'en' : 'en';
        return { valid: true, language: lang };
      }

      return { valid: false };
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }
}
