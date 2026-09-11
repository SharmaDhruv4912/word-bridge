// Level configurations — each level has a wider chasm requiring a longer word
export const LEVELS = [
  {
    id: 1,
    name: 'The First Chasm',
    chasmX: 520,       // x position of chasm start on canvas
    chasmWidth: 200,   // pixels wide
    minWordLength: 6,  // minimum letters needed to bridge it
    zombieSpeed: 55,   // px/sec
    timeLimit: 30,     // seconds before zombies catch up
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
    zombieSpeed: 70,
    timeLimit: 25,
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
    zombieSpeed: 90,
    timeLimit: 20,
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
    zombieSpeed: 110,
    timeLimit: 18,
    bgColor: '#0a1a2e',
    groundColor: '#0a3a1a',
    dirtColor: '#051008',
  },
];

// Tile width per letter for bridge rendering
export const TILE_WIDTH = 28;
export const TILE_HEIGHT = 36;
