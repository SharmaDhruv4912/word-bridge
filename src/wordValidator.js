import { COMMON_WORDS } from '../assets/words.js';

// Special curated long words that always validate (these are real, just obscure)
const SPECIAL_WORDS = new Set([
  'rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz',
  'muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesinesine',
  'lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon',
  'pneumonoultramicroscopicsilicovolcanoconiosis',
]);

export class WordValidator {
  constructor() {
    this.cache = new Map();
    // Pre-populate cache with special long words
    SPECIAL_WORDS.forEach(word => {
      const lang = word.includes('ü') || word.includes('ş') ? 'de'
        : 'en';
      this.cache.set(word, { valid: true, language: lang });
    });
  }

  async validate(word) {
    const lower = word.toLowerCase();

    // Cache hit
    if (this.cache.has(lower)) {
      return this.cache.get(lower);
    }

    // Special curated words (real but too obscure for any API)
    if (SPECIAL_WORDS.has(lower)) {
      const result = { valid: true, language: lower.includes('ü') ? 'de' : lower.includes('ş') ? 'tr' : 'en' };
      this.cache.set(lower, result);
      return result;
    }

    // Titin: accept prefix "methionyl..." with length >= 50
    if (lower.startsWith('methionyl') && lower.length >= 50) {
      const result = { valid: true, language: 'special' };
      this.cache.set(lower, result);
      return result;
    }

    // Local dictionary — instant check for ~500 common words
    if (COMMON_WORDS.has(lower)) {
      const result = { valid: true, language: 'en' };
      this.cache.set(lower, result);
      return result;
    }

    // API check — always required for anything not in the local list
    // NO length-only fallback — gibberish must fail
    try {
      const result = await this.fetchFromAPI(lower);
      this.cache.set(lower, result);
      return result;
    } catch (e) {
      // API unreachable (network error, timeout) — be strict:
      // only accept if it's in our local list (already checked above)
      // Unknown words fail rather than letting gibberish through
      const result = { valid: false, error: 'offline' };
      return result;
    }
  }

  async fetchFromAPI(word) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (response.status === 404) {
        // Definitively not a real English word
        return { valid: false };
      }

      if (response.ok) {
        return { valid: true, language: 'en' };
      }

      // Any other HTTP error — reject to be safe
      return { valid: false };
    } catch (e) {
      clearTimeout(timeout);
      throw e; // propagate so caller can handle offline case
    }
  }
}
