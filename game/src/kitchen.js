// Ember & Thyme: the cooking loop itself — the hand, the chopping board,
// the stove pots, the plate, the bin, and serving a finished dish.
// Every station action lives here; rendering and input only call these.

import {
  INGREDIENTS,
  RECIPES,
  ingredientById,
  recipeById,
  sameSet,
  COOK_TIME,
  BURN_TIME,
  MAX_LIVES,
  levelFor,
} from './data.js';
import { createBoard, resetBoard, updateBoard } from './orders.js';
import { CHOP } from './layout.js';
import { sfx } from './audio.js';

/** A fresh game state (title screen, nothing started yet). */
export function createState() {
  return {
    screen: 'title', // 'title' | 'playing' | 'gameover'
    paused: false,
    time: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    lives: MAX_LIVES,
    hand: null, // { ing, stage: 'raw' | 'chopped' | 'cooked' | 'burnt' }
    board: null, // { ing, chopsLeft } — the item being chopped
    pots: [{ item: null }, { item: null }], // item: { ing, t }
    plate: [], // cooked ingredient ids, in plating order
    plateReady: null, // recipe id when the plate holds a whole dish
    toast: '',
    toastT: 0,
    floaters: [], // { x, y, text, color, t }
    particles: [], // { x, y, vx, vy, t, color }
    boardState: createBoard(),
    focus: 0,
    hover: null,
    mouse: { x: 640, y: 360 },
    flash: 0,
  };
}

/** Start (or restart) a shift: scores and stations back to zero, orders flowing. */
export function resetRun(s) {
  s.screen = 'playing';
  s.paused = false;
  s.time = 0;
  s.score = 0;
  s.combo = 0;
  s.bestCombo = 0;
  s.served = 0;
  s.failed = 0;
  s.lives = MAX_LIVES;
  s.hand = null;
  s.board = null;
  s.pots = [{ item: null }, { item: null }];
  s.plate = [];
  s.plateReady = null;
  s.toast = 'First orders are coming — grab an ingredient!';
  s.toastT = 3;
  s.floaters = [];
  s.particles = [];
  s.flash = 0;
  resetBoard(s.boardState);
}

/** Show a short hint line above the counter. */
export function setToast(s, msg) {
  s.toast = msg;
  s.toastT = 2.4;
}

/** A score popup that rises and fades. */
export function addFloater(s, x, y, text, color) {
  s.floaters.push({ x, y, text, color, t: 1.6 });
}

function chopBurst(s, color) {
  const cx = CHOP.x + CHOP.w / 2;
  const cy = CHOP.y + CHOP.h / 2 - 10;
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 60 + Math.random() * 140;
    s.particles.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, t: 0.5, color });
  }
}

/** Which recipe, if any, the plate currently holds in full. */
export function plateReadyRecipe(s) {
  for (const r of RECIPES) {
    if (sameSet(s.plate, r.needs)) return r.id;
  }
  return null;
}

/** Grab a raw ingredient from the counter into the hand. */
export function pickIngredient(s, id) {
  const ing = ingredientById(id);
  if (!ing) return;
  if (s.hand) {
    setToast(s, 'Hands full — use it or toss it first');
    sfx.click();
    return;
  }
  s.hand = { ing: id, stage: 'raw' };
  sfx.pick();
}

/** Use the chopping board: place a raw item, or chop the one already there. */
export function useChop(s) {
  const b = s.board;
  if (b) {
    b.chopsLeft -= 1;
    chopBurst(s, ingredientById(b.ing).color);
    sfx.chop();
    if (b.chopsLeft <= 0) {
      const name = ingredientById(b.ing).name;
      s.hand = { ing: b.ing, stage: 'chopped' };
      s.board = null;
      setToast(s, `${name} chopped! To the stove it goes.`);
    }
    return;
  }
  if (s.hand && s.hand.stage === 'raw') {
    const ing = ingredientById(s.hand.ing);
    s.board = { ing: s.hand.ing, chopsLeft: ing.chop };
    s.hand = null;
    sfx.place();
    setToast(s, `Chop! Click the board ${ing.chop} times.`);
    return;
  }
  if (s.hand) {
    setToast(s, 'The board is for raw food — chop before cooking');
    sfx.click();
    return;
  }
  setToast(s, 'Pick an ingredient from the counter first');
}

/** Use a stove pot: start cooking a chopped item, or take it out when done. */
export function usePot(s, i) {
  const pot = s.pots[i];
  if (!pot.item) {
    if (s.hand && s.hand.stage === 'chopped') {
      pot.item = { ing: s.hand.ing, t: 0 };
      s.hand = null;
      sfx.place();
    } else if (s.hand && s.hand.stage === 'raw') {
      setToast(s, 'Chop it on the board first');
      sfx.click();
    } else if (s.hand) {
      setToast(s, 'That is already cooked — plate it');
      sfx.click();
    } else {
      setToast(s, 'Bring a chopped ingredient to the pot');
    }
    return;
  }
  const it = pot.item;
  if (it.t >= BURN_TIME) {
    if (!s.hand) {
      s.hand = { ing: it.ing, stage: 'burnt' };
      pot.item = null;
      setToast(s, 'Burnt! Toss it in the bin.');
      sfx.burn();
    } else {
      setToast(s, 'Hands full — toss something first');
    }
    return;
  }
  if (it.t >= COOK_TIME) {
    if (!s.hand) {
      s.hand = { ing: it.ing, stage: 'cooked' };
      pot.item = null;
      sfx.pick();
    } else {
      setToast(s, 'Hands full — plate or toss first');
    }
    return;
  }
  setToast(s, 'Still cooking… watch the pot!');
}

/** Use the plate: add a cooked item, or read what is on it. */
export function usePlate(s) {
  if (s.hand && s.hand.stage === 'cooked') {
    s.plate.push(s.hand.ing);
    s.hand = null;
    sfx.place();
    s.plateReady = plateReadyRecipe(s);
    if (s.plateReady) {
      setToast(s, `${recipeById(s.plateReady).name} is ready — serve it!`);
      sfx.done();
    } else if (s.plate.length === 2) {
      setToast(s, 'That mix matches no dish — toss the plate and start over');
    }
    return;
  }
  if (s.hand && s.hand.stage === 'burnt') {
    setToast(s, 'Burnt food goes in the bin, not on the plate');
    sfx.click();
    return;
  }
  if (s.hand) {
    setToast(s, 'Cook it on the stove first');
    sfx.click();
    return;
  }
  if (s.plate.length > 0) {
    setToast(s, `Plate: ${s.plate.map((id) => ingredientById(id).name).join(' + ')}`);
  } else {
    setToast(s, 'The plate is empty — cook something first');
  }
}

/** Use the bin: toss the hand item, or clear the plate. */
export function useTrash(s) {
  if (s.hand) {
    s.hand = null;
    sfx.click();
    setToast(s, 'Tossed.');
    return;
  }
  if (s.plate.length > 0) {
    s.plate.length = 0;
    s.plateReady = null;
    setToast(s, 'Plate cleared.');
    return;
  }
  setToast(s, 'Nothing to toss');
}

/** Serve the plated dish to the ticket at index idx, if it matches. */
export function serveOrder(s, idx) {
  const orders = s.boardState.orders;
  const o = orders[idx];
  if (!o) return;
  if (!s.plateReady) {
    setToast(s, 'Plate a finished dish first');
    sfx.click();
    return;
  }
  if (o.recipeId !== s.plateReady) {
    setToast(s, `That ticket wants ${recipeById(o.recipeId).name} — not this dish`);
    sfx.click();
    return;
  }
  const r = recipeById(o.recipeId);
  const bonus = Math.round(50 * (o.timeLeft / o.total));
  const mult = 1 + Math.min(s.combo, 8) * 0.125;
  const pts = Math.round((r.pay + bonus) * mult);
  const levelBefore = levelFor(s.served);
  s.score += pts;
  s.combo += 1;
  s.bestCombo = Math.max(s.bestCombo, s.combo);
  s.served += 1;
  if (levelFor(s.served) > levelBefore) {
    addFloater(s, 640, 240, `RUSH HOUR! Level ${levelFor(s.served)} — faster orders!`, '#ff9a3c');
  }
  orders.splice(idx, 1);
  addFloater(s, 640, 300, `+${pts}  ${r.name}!`, '#ffd54a');
  s.plate.length = 0;
  s.plateReady = null;
  sfx.serve();
}

/** Advance pots, floaters, particles and the order board by dt seconds. */
export function updateKitchen(s, dt) {
  s.time += dt;
  if (s.toastT > 0) s.toastT -= dt;
  for (const f of s.floaters) f.t -= dt;
  s.floaters = s.floaters.filter((f) => f.t > 0);
  for (const p of s.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 320 * dt;
    p.t -= dt;
  }
  s.particles = s.particles.filter((p) => p.t > 0);
  for (const pot of s.pots) {
    if (pot.item && pot.item.t < BURN_TIME) {
      const was = pot.item.t;
      pot.item.t += dt;
      if (was < COOK_TIME && pot.item.t >= COOK_TIME) sfx.done();
      if (was < BURN_TIME && pot.item.t >= BURN_TIME) {
        setToast(s, 'Something burnt on the stove!');
        sfx.burn();
      }
    }
  }
  const level = levelFor(s.served);
  updateBoard(s.boardState, dt, level, (o) => {
    s.lives -= 1;
    s.failed += 1;
    s.combo = 0;
    s.flash = 1;
    setToast(s, `${recipeById(o.recipeId).name} order expired!  -1 heart`);
    sfx.fail();
    if (s.lives <= 0) {
      s.screen = 'gameover';
      sfx.fail();
    }
  });
  if (s.flash > 0) s.flash -= dt * 2;
}
