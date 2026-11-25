// Ember & Thyme: the order board — incoming tickets, their countdowns,
// and the spawn rhythm that makes the shift busier over time.

import { RECIPES, orderDuration, spawnInterval } from './data.js';

/** A fresh, empty board. */
export function createBoard() {
  return { orders: [], spawnT: 2.5 };
}

/** Clear the board back to its opening state. */
export function resetBoard(b) {
  b.orders.length = 0;
  b.spawnT = 2.5;
}

function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

/**
 * Tick the board: spawn a new ticket when the timer lapses (at most three
 * open at once) and count every open ticket down, calling onExpire for each
 * one whose time runs out.
 */
export function updateBoard(b, dt, level, onExpire) {
  b.spawnT -= dt;
  if (b.spawnT <= 0 && b.orders.length < 3) {
    const r = randomRecipe();
    const total = orderDuration(level);
    b.orders.push({ recipeId: r.id, timeLeft: total, total });
    b.spawnT = spawnInterval(level);
  }
  for (let i = b.orders.length - 1; i >= 0; i--) {
    const o = b.orders[i];
    o.timeLeft -= dt;
    if (o.timeLeft <= 0) {
      b.orders.splice(i, 1);
      onExpire(o);
    }
  }
}
