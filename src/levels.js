// Level configurations — each level has a wider chasm requiring a longer word
// zombieStartX: negative = how far offscreen they begin (more negative = more breathing room)
// zombieSpeed:  px/sec movement speed
// timeLimit:    seconds displayed on the timer bar (visual only, zombie arrival is physics-based)
export const LEVELS = [
  {
    id: 1,
    name: 'The First Chasm',
    chasmX: 520,
    chasmWidth: 200,
    minWordLength: 6,
    zombieStartX: -520,  // ~9s before they arrive at player start position
    zombieSpeed: 38,
    timeLimit: 45,
    bgColor: '#87CEEB',
    groundColor: '#5a8a3a',
    dirtColor: '#7a5c3a',
  },
  {
    id: 2,
    name: 'The Grand Gorge',
    chasmX: 480,
    chasmWidth: 260,
    minWordLength: 10,
    zombieStartX: -480,
    zombieSpeed: 48,
    timeLimit: 35,
    bgColor: '#e8a87c',
    groundColor: '#8B4513',
    dirtColor: '#5c3010',
  },
  {
    id: 3,
    name: 'The Abyss of Doom',
    chasmX: 440,
    chasmWidth: 340,
    minWordLength: 16,
    zombieStartX: -440,
    zombieSpeed: 58,
    timeLimit: 28,
    bgColor: '#4a0080',
    groundColor: '#2d1a4a',
    dirtColor: '#1a0a2e',
  },
  {
    id: 4,
    name: 'The Infinite Void',
    chasmX: 400,
    chasmWidth: 420,
    minWordLength: 30,
    zombieStartX: -400,
    zombieSpeed: 68,
    timeLimit: 22,
    bgColor: '#0a1a2e',
    groundColor: '#0a3a1a',
    dirtColor: '#051008',
  },
];

// Tile width per letter for bridge rendering
export const TILE_WIDTH = 28;
export const TILE_HEIGHT = 36;
