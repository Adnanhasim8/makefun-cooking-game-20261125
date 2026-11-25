// Ember & Thyme: boot and game loop. Builds the state, wires input,
// applies a ?shot= state for screenshots, then runs update + draw forever.

import { createState, updateKitchen } from './kitchen.js';
import { draw } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createState();

// Exposed for headless playtesting (driving and asserting on the live game).
window.__game = state;

attachInput(canvas, state);
applyShot(state, new URLSearchParams(location.search));

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.screen === 'playing' && !state.paused) {
    updateKitchen(state, dt);
  }
  draw(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
