// Simple Euler physics for falling letter tiles
export class Physics {
  constructor() {
    this.gravity = 980; // px/s²
  }

  applyGravity(tile, dt) {
    tile.vy += this.gravity * dt;
    tile.y += tile.vy * dt;
    tile.x += tile.vx * dt;
    tile.angle += tile.angularVel * dt;
  }

  // Initialise collapse physics on a tile
  launchTile(tile, index, total) {
    // Cascade from tip: tiles at the end fall first
    const delay = (total - 1 - index) * 60; // ms
    tile.collapseDelay = delay;
    tile.collapsing = false;
    tile.collapsed = false;
    tile.cracking = true;
    tile.crackProgress = 0;
    tile.vy = 0;
    tile.vx = (Math.random() - 0.5) * 80;
    tile.angularVel = (Math.random() - 0.5) * 4;
  }
}
