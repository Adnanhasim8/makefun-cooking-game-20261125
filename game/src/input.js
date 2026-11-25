// Ember & Thyme: mouse and keyboard input — both drive the same station
// actions, so the game plays either way. Focus (Tab / arrow keys) mirrors
// the mouse hover, and Enter / Space activates the focused station.

import {
  W, H, PAUSE_BTN, MUTE_BTN, START_BTN, RESTART_BTN,
  CHOP, STOVE, potRect, PLATE, TRASH, binRect, ticketRect, hit,
} from './layout.js';
import { INGREDIENTS } from './data.js';
import * as K from './kitchen.js';
import { sfx, setMuted, isMuted } from './audio.js';

/** The stations Tab / arrow keys can focus, in route order. */
export function focusables(s) {
  const list = INGREDIENTS.map((ing, i) => ({ kind: 'bin', i, rect: binRect(i) }));
  list.push({ kind: 'chop', rect: CHOP });
  list.push({ kind: 'pot', i: 0, rect: potRect(0) });
  list.push({ kind: 'pot', i: 1, rect: potRect(1) });
  list.push({ kind: 'plate', rect: PLATE });
  list.push({ kind: 'trash', rect: TRASH });
  s.boardState.orders.forEach((o, i) => list.push({ kind: 'ticket', i, rect: ticketRect(i) }));
  return list;
}

/** Which station, if any, sits under point p. */
export function hoverAt(s, p) {
  if (s.screen !== 'playing' || s.paused) return null;
  const list = focusables(s);
  for (let i = list.length - 1; i >= 0; i--) {
    if (hit(list[i].rect, p.x, p.y)) return list[i];
  }
  return null;
}

/** Run one station's action. */
export function activate(s, f) {
  if (!f) return;
  if (f.kind === 'bin') K.pickIngredient(s, INGREDIENTS[f.i].id);
  else if (f.kind === 'chop') K.useChop(s);
  else if (f.kind === 'pot') K.usePot(s, f.i);
  else if (f.kind === 'plate') K.usePlate(s);
  else if (f.kind === 'trash') K.useTrash(s);
  else if (f.kind === 'ticket') K.serveOrder(s, f.i);
}

export function activateFocus(s) {
  const list = focusables(s);
  if (list.length === 0) return;
  s.focus = ((s.focus % list.length) + list.length) % list.length;
  activate(s, list[s.focus]);
}

function startGame(s) {
  K.resetRun(s);
  sfx.start();
}

function clickAt(s, p) {
  if (s.screen === 'title') {
    if (hit(START_BTN, p.x, p.y)) startGame(s);
    return;
  }
  if (s.screen === 'gameover') {
    if (hit(RESTART_BTN, p.x, p.y)) startGame(s);
    return;
  }
  if (hit(PAUSE_BTN, p.x, p.y)) {
    s.paused = !s.paused;
    sfx.click();
    return;
  }
  if (hit(MUTE_BTN, p.x, p.y)) {
    setMuted(!isMuted());
    sfx.click();
    return;
  }
  if (s.paused) return;
  activate(s, hoverAt(s, p));
}

function keyDown(s, e) {
  if (e.key === 'm' || e.key === 'M') {
    setMuted(!isMuted());
    return;
  }
  if (s.screen === 'title') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startGame(s);
    }
    return;
  }
  if (s.screen === 'gameover') {
    if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') startGame(s);
    return;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    s.paused = !s.paused;
    return;
  }
  if (s.paused) return;
  if (e.key >= '1' && e.key <= '6') {
    K.pickIngredient(s, INGREDIENTS[Number(e.key) - 1].id);
    return;
  }
  if (e.key === 'Tab' || e.key === 'ArrowRight') {
    e.preventDefault();
    s.focus = (s.focus + 1) % focusables(s).length;
    sfx.click();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const n = focusables(s).length;
    s.focus = (s.focus - 1 + n) % n;
    sfx.click();
    return;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    activateFocus(s);
    return;
  }
  if (e.key === 's' || e.key === 'S') {
    const idx = s.boardState.orders.findIndex((o) => o.recipeId === s.plateReady);
    if (idx >= 0) K.serveOrder(s, idx);
  }
}

/** Wire mouse and keyboard to the canvas and the game state. */
export function attachInput(canvas, s) {
  const toGame = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    };
  };
  canvas.addEventListener('mousemove', (e) => {
    const p = toGame(e);
    s.mouse = p;
    s.hover = hoverAt(s, p);
  });
  canvas.addEventListener('click', (e) => {
    clickAt(s, toGame(e));
  });
  window.addEventListener('keydown', (e) => keyDown(s, e));
}
