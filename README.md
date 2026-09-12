# Word Bridge Escape 🧟‍♂️📖🌉

A 2D side-scrolling browser platformer where you type long words to build bridges and escape a zombie horde.

## How to Play

1. Your characters run toward a chasm while zombies chase from behind
2. A gatekeeper blocks the far side and demands a word "long enough" to bridge the gap
3. Type a word — the letters spawn as 3D bridge tiles
4. If the word is long enough, you cross to the next level
5. If too short, the bridge collapses and you try again (before the zombies catch you!)

## Controls

- **ENTER / SPACE** — Start game / confirm on end screen
- **Type** — Enter a word in the input box
- **ENTER / Click BRIDGE IT!** — Submit your word

## Word Tips by Level

| Level | Min Letters | Example |
|-------|-------------|---------|
| 1     | 6           | "bridge" |
| 2     | 10          | "earthquake" |
| 3     | 16          | "accomplishment" |
| 4     | 30          | "pneumonoultramicroscopicsilicovolcanoconiosis" |

## Dictionary Mode

Unlock after clearing Level 1! Includes:
- 🇩🇪 **German** — Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz (63 letters)
- 🇹🇷 **Turkish** — Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesinesine (70 letters)
- 🇬🇷 **Ancient Greek** — Aristophanes' famous dish word (183 letters)
- 🔬 **Chemical/Titin** — The protein name (189,819 letters — first 50 accepted!)

## Scoring

```
Score = (word length × 100) + (time remaining × 10) + language bonus
```

Language bonuses: German +500, Turkish +750, Greek +600, Special +9999

## Running Locally

Just open `index.html` in a browser — no build step needed!

```bash
# Or use a simple HTTP server:
npx serve .
# Then open http://localhost:3000
```

## Deployment

This project auto-deploys via Netlify/Vercel on push to `main`.

Connect your GitHub repo to Netlify or Vercel and it works immediately — the `netlify.toml` and `vercel.json` configs are already in place.

## Tech Stack

- Vanilla HTML5 Canvas + JavaScript (no frameworks)
- Web Audio API for synthesized sounds (no audio files)
- [Free Dictionary API](https://dictionaryapi.dev/) for word validation fallback
- Local word list (~500+ words) for instant common-word validation
