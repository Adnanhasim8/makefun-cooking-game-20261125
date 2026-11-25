// Ember & Thyme: every pixel — the kitchen, the order board, the counter,
// the dish mid-assembly, the timers, and the title / game-over screens.
// All art is drawn with canvas shapes (original, no image files).

import {
  W, H, HUD, HAND_CHIP, PAUSE_BTN, MUTE_BTN,
  BOARD, ticketRect, MENU, menuCardRect,
  CHOP, STOVE, potRect, PLATE, TRASH,
  COUNTER, binRect, START_BTN, RESTART_BTN, hit,
} from './layout.js';
import {
  INGREDIENTS, RECIPES, ingredientById, recipeById,
  COOK_TIME, BURN_TIME, levelFor,
} from './data.js';
import { isMuted } from './audio.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/** Draw one ingredient as a little vector picture. Stage changes the look:
 *  raw = whole, chopped = cut pieces, cooked = golden and steaming, burnt = charred. */
export function drawIngredient(ctx, id, x, y, r, stage = 'raw') {
  const ing = ingredientById(id);
  if (!ing) return;
  if (stage === 'chopped') {
    drawIngredient(ctx, id, x - r * 0.45, y - r * 0.2, r * 0.55, 'raw');
    drawIngredient(ctx, id, x + r * 0.45, y - r * 0.25, r * 0.55, 'raw');
    drawIngredient(ctx, id, x, y + r * 0.4, r * 0.55, 'raw');
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    ellipse(ctx, 0, 0, r, r * 0.92);
    ctx.fill();
    ctx.fillStyle = '#3f8f3f';
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i - 1) * 0.7);
      ellipse(ctx, 0, -r * 0.95, r * 0.28, r * 0.5);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ellipse(ctx, -r * 0.35, -r * 0.35, r * 0.22, r * 0.14);
    ctx.fill();
  } else if (id === 'mushroom') {
    ctx.fillStyle = '#f3e9d2';
    rr(ctx, -r * 0.28, -r * 0.1, r * 0.56, r * 0.9, r * 0.2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ellipse(ctx, -r * 0.4, -r * 0.55, r * 0.16, r * 0.1);
    ctx.fill();
    ellipse(ctx, r * 0.35, -r * 0.7, r * 0.14, r * 0.09);
    ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = ing.color;
    ellipse(ctx, -r * 0.1, 0, r * 0.85, r * 0.7);
    ctx.fill();
    ctx.strokeStyle = '#fff8ea';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(r * 0.6, r * 0.25);
    ctx.lineTo(r * 1.05, r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#fff8ea';
    ellipse(ctx, r * 1.05, r * 0.45, r * 0.22, r * 0.22);
    ctx.fill();
    ellipse(ctx, r * 1.15, r * 0.75, r * 0.22, r * 0.22);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ellipse(ctx, -r * 0.4, -r * 0.3, r * 0.25, r * 0.15);
    ctx.fill();
  } else if (id === 'herb') {
    ctx.fillStyle = ing.color;
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.rotate(i * 0.55);
      ellipse(ctx, 0, -r * 0.55, r * 0.34, r * 0.75);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.2);
    ctx.lineTo(0, r * 0.9);
    ctx.stroke();
  } else if (id === 'bread') {
    ctx.fillStyle = ing.color;
    rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.12;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.55 - r * 0.2, -r * 0.4);
      ctx.lineTo(i * r * 0.55 + r * 0.2, r * 0.4);
      ctx.stroke();
    }
  } else if (id === 'berry') {
    ctx.fillStyle = ing.color;
    ellipse(ctx, -r * 0.45, r * 0.2, r * 0.5, r * 0.5);
    ctx.fill();
    ellipse(ctx, r * 0.45, r * 0.2, r * 0.5, r * 0.5);
    ctx.fill();
    ellipse(ctx, 0, -r * 0.45, r * 0.55, r * 0.55);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ellipse(ctx, -r * 0.15, -r * 0.65, r * 0.16, r * 0.1);
    ctx.fill();
    ctx.fillStyle = '#3f8f3f';
    ellipse(ctx, r * 0.5, -r * 0.85, r * 0.3, r * 0.16);
    ctx.fill();
  }
  if (stage === 'cooked') {
    ctx.strokeStyle = '#ffd54a';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = r * 0.1;
    for (const dx of [-r * 0.4, r * 0.3]) {
      ctx.beginPath();
      ctx.moveTo(dx, -r * 1.5);
      ctx.quadraticCurveTo(dx + r * 0.25, -r * 1.8, dx, -r * 2.05);
      ctx.stroke();
    }
  }
  if (stage === 'burnt') {
    ctx.fillStyle = 'rgba(25,20,18,0.62)';
    ellipse(ctx, 0, 0, r * 1.05, r);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,120,120,0.8)';
    ellipse(ctx, -r * 0.2, -r * 1.3, r * 0.18, r * 0.3);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 20, s / 20);
  ctx.fillStyle = filled ? '#e5484d' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.fill();
  ctx.restore();
}

function drawTickets(ctx, s) {
  ctx.fillStyle = '#8a5a33';
  rr(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
  ctx.fill();
  ctx.fillStyle = '#6d4423';
  rr(ctx, BOARD.x + 4, BOARD.y + 4, BOARD.w - 8, BOARD.h - 8, 9);
  ctx.fill();
  text(ctx, 'ORDER BOARD', BOARD.x + 14, BOARD.y + 18, 15, '#ffd9a0');
  text(ctx, 'click a ticket to serve', BOARD.x + BOARD.w - 14, BOARD.y + 18, 11, '#e8c9a0', 'right');
  for (let i = 0; i < 3; i++) {
    const r = ticketRect(i);
    const o = s.boardState.orders[i];
    ctx.fillStyle = '#fff8e6';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    if (!o) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      rr(ctx, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 6);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'waiting for', r.x + r.w / 2, r.y + 40, 12, '#b9a98e', 'center');
      text(ctx, 'orders…', r.x + r.w / 2, r.y + 58, 12, '#b9a98e', 'center');
      continue;
    }
    const rec = recipeById(o.recipeId);
    const urgent = o.timeLeft < 10;
    ctx.fillStyle = rec.color;
    rr(ctx, r.x, r.y, r.w, 26, 8);
    ctx.fill();
    ctx.fillRect(r.x, r.y + 14, r.w, 12);
    text(ctx, rec.name.toUpperCase(), r.x + r.w / 2, r.y + 13, 12, '#fff', 'center');
    rec.needs.forEach((id, k) => {
      drawIngredient(ctx, id, r.x + 28 + k * 62, r.y + 48, 13, 'raw');
    });
    const frac = Math.max(0, o.timeLeft / o.total);
    const barColor = frac > 0.5 ? '#57a85a' : frac > 0.25 ? '#e8a13c' : '#e5484d';
    ctx.fillStyle = '#e5d9c0';
    rr(ctx, r.x + 10, r.y + 70, r.w - 20, 10, 5);
    ctx.fill();
    ctx.fillStyle = barColor;
    if (frac > 0) {
      rr(ctx, r.x + 10, r.y + 70, (r.w - 20) * frac, 10, 5);
      ctx.fill();
    }
    const secs = Math.ceil(o.timeLeft);
    text(ctx, urgent ? `!! ${secs}s !!` : `${secs}s`, r.x + r.w / 2, r.y + 90, urgent ? 14 : 12, urgent ? '#e5484d' : '#6d5a44', 'center');
    if (s.hover && s.hover.kind === 'ticket' && s.hover.i === i) {
      ctx.strokeStyle = s.plateReady === o.recipeId ? '#ffd54a' : '#fff';
      ctx.lineWidth = 3;
      rr(ctx, r.x - 2, r.y - 2, r.w + 4, r.h + 4, 10);
      ctx.stroke();
    }
  }
}

function drawMenu(ctx) {
  ctx.fillStyle = '#5a3d24';
  rr(ctx, MENU.x, MENU.y, MENU.w, MENU.h, 12);
  ctx.fill();
  text(ctx, "TODAY'S MENU", MENU.x + 14, MENU.y + 18, 15, '#ffd9a0');
  text(ctx, 'chop · cook · plate · serve', MENU.x + MENU.w - 14, MENU.y + 18, 11, '#e8c9a0', 'right');
  RECIPES.forEach((rec, i) => {
    const r = menuCardRect(i);
    ctx.fillStyle = '#fff8e6';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.fillStyle = rec.color;
    rr(ctx, r.x, r.y, r.w, 22, 8);
    ctx.fill();
    ctx.fillRect(r.x, r.y + 12, r.w, 10);
    text(ctx, rec.name.toUpperCase(), r.x + r.w / 2, r.y + 11, 11, '#fff', 'center');
    rec.needs.forEach((id, k) => {
      drawIngredient(ctx, id, r.x + 28 + k * 56, r.y + 42, 12, 'raw');
    });
    text(ctx, `${rec.cook}s cook`, r.x + r.w / 2, r.y + 66, 11, '#6d5a44', 'center');
    text(ctx, `${rec.pay} pts`, r.x + r.w / 2, r.y + 84, 12, '#b5762e', 'center');
  });
}

function stationLabel(ctx, r, label, sub) {
  text(ctx, label, r.x + r.w / 2, r.y - 14, 13, '#5a3d24', 'center');
  if (sub) text(ctx, sub, r.x + r.w / 2, r.y + r.h + 14, 11, '#8a7a64', 'center');
}

function drawChopBoard(ctx, s) {
  stationLabel(ctx, CHOP, 'CHOPPING BOARD', s.board ? 'click to chop!' : 'raw food goes here');
  ctx.fillStyle = '#a8763e';
  rr(ctx, CHOP.x - 6, CHOP.y - 6, CHOP.w + 12, CHOP.h + 12, 12);
  ctx.fill();
  ctx.fillStyle = '#c89b6a';
  rr(ctx, CHOP.x, CHOP.y, CHOP.w, CHOP.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,61,36,0.35)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(CHOP.x + 14, CHOP.y + (CHOP.h / 4) * i);
    ctx.lineTo(CHOP.x + CHOP.w - 14, CHOP.y + (CHOP.h / 4) * i);
    ctx.stroke();
  }
  if (s.board) {
    const ing = ingredientById(s.board.ing);
    drawIngredient(ctx, s.board.ing, CHOP.x + CHOP.w / 2, CHOP.y + CHOP.h / 2 - 8, 44, 'raw');
    for (let i = 0; i < ing.chop; i++) {
      ctx.fillStyle = i < ing.chop - s.board.chopsLeft ? '#e5484d' : '#fff8e6';
      ellipse(ctx, CHOP.x + CHOP.w / 2 - (ing.chop - 1) * 14 + i * 28, CHOP.y + CHOP.h - 24, 9, 9);
      ctx.fill();
      ctx.strokeStyle = '#5a3d24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    text(ctx, `${s.board.chopsLeft} chops left`, CHOP.x + CHOP.w / 2, CHOP.y + CHOP.h - 46, 13, '#5a3d24', 'center');
  } else {
    text(ctx, 'place raw food here', CHOP.x + CHOP.w / 2, CHOP.y + CHOP.h / 2 - 8, 14, 'rgba(90,61,36,0.55)', 'center');
    text(ctx, 'then click to chop', CHOP.x + CHOP.w / 2, CHOP.y + CHOP.h / 2 + 14, 12, 'rgba(90,61,36,0.45)', 'center');
  }
}

function drawStove(ctx, s) {
  stationLabel(ctx, STOVE, 'STOVE — TWO POTS', '5s to cook · burns after 9s');
  ctx.fillStyle = '#3f3f46';
  rr(ctx, STOVE.x, STOVE.y, STOVE.w, STOVE.h, 12);
  ctx.fill();
  ctx.fillStyle = '#52525b';
  rr(ctx, STOVE.x + 8, STOVE.y + 8, STOVE.w - 16, STOVE.h - 16, 9);
  ctx.fill();
  s.pots.forEach((pot, i) => {
    const r = potRect(i);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2 + 6;
    ctx.fillStyle = '#27272a';
    ellipse(ctx, cx, cy + 34, 58, 12);
    ctx.fill();
    ctx.fillStyle = '#71717a';
    rr(ctx, r.x + 8, r.y + 18, r.w - 16, 72, 10);
    ctx.fill();
    ctx.fillStyle = '#3f3f46';
    ellipse(ctx, cx, r.y + 22, 52, 14);
    ctx.fill();
    if (pot.item) {
      const it = pot.item;
      const done = it.t >= COOK_TIME;
      const burnt = it.t >= BURN_TIME;
      ctx.fillStyle = burnt ? '#1f1a18' : done ? '#f0a832' : '#8a5a33';
      ellipse(ctx, cx, r.y + 22, 44, 11);
      ctx.fill();
      drawIngredient(ctx, it.ing, cx, r.y + 6, 17, burnt ? 'burnt' : done ? 'cooked' : 'chopped');
      const frac = Math.min(1, it.t / COOK_TIME);
      ctx.fillStyle = '#e5d9c0';
      rr(ctx, r.x + 6, r.y, r.w - 12, 9, 4);
      ctx.fill();
      ctx.fillStyle = burnt ? '#e5484d' : done ? '#57a85a' : '#e8a13c';
      const bw = burnt ? r.w - 12 : (r.w - 12) * frac;
      if (bw > 0) {
        rr(ctx, r.x + 6, r.y, bw, 9, 4);
        ctx.fill();
      }
      if (burnt) text(ctx, 'BURNT!', cx, r.y + 108, 13, '#ff8a80', 'center');
      else if (done) text(ctx, 'READY — take it!', cx, r.y + 108, 12, '#b6f09a', 'center');
      else text(ctx, `${Math.ceil(COOK_TIME - it.t)}s…`, cx, r.y + 108, 12, '#d4d4d8', 'center');
    } else {
      text(ctx, 'empty pot', cx, r.y + 60, 12, '#a1a1aa', 'center');
    }
  });
}

function drawPlateStation(ctx, s) {
  stationLabel(ctx, PLATE, 'PLATING COUNTER', s.plateReady ? 'ready — click its ticket!' : 'build the dish here');
  ctx.fillStyle = '#a8763e';
  rr(ctx, PLATE.x - 6, PLATE.y - 6, PLATE.w + 12, PLATE.h + 12, 12);
  ctx.fill();
  ctx.fillStyle = '#c89b6a';
  rr(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, 10);
  ctx.fill();
  const cx = PLATE.x + PLATE.w / 2;
  const cy = PLATE.y + PLATE.h / 2 + 4;
  if (s.plateReady) {
    ctx.save();
    ctx.shadowColor = '#ffd54a';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#fffdf5';
    ellipse(ctx, cx, cy, 104, 62);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#fffdf5';
    ellipse(ctx, cx, cy, 104, 62);
    ctx.fill();
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 2;
    ellipse(ctx, cx, cy, 86, 48);
    ctx.stroke();
  }
  if (s.plate.length === 0) {
    text(ctx, 'empty plate', cx, cy, 13, '#b9a98e', 'center');
  } else {
    s.plate.forEach((id, k) => {
      const x = cx + (k - (s.plate.length - 1) / 2) * 62;
      drawIngredient(ctx, id, x, cy - 4, 24, 'cooked');
    });
    text(ctx, `${s.plate.length} / 2 on the plate`, cx, cy + 52, 12, '#5a3d24', 'center');
  }
  if (s.plateReady) {
    const rec = recipeById(s.plateReady);
    ctx.fillStyle = rec.color;
    rr(ctx, cx - 92, PLATE.y + 8, 184, 26, 13);
    ctx.fill();
    text(ctx, `${rec.name.toUpperCase()} READY!`, cx, PLATE.y + 21, 13, '#fff', 'center');
  } else if (s.plate.length === 2) {
    // Two parts that match no dish on the menu: say so, before the player wastes a serve.
    ctx.fillStyle = '#e5484d';
    rr(ctx, cx - 92, PLATE.y + 8, 184, 26, 13);
    ctx.fill();
    text(ctx, 'NO DISH — BIN IT!', cx, PLATE.y + 21, 13, '#fff', 'center');
  }
}

function drawTrash(ctx) {
  stationLabel(ctx, TRASH, 'BIN', 'toss burnt food');
  ctx.fillStyle = '#52525b';
  rr(ctx, TRASH.x + 30, TRASH.y + 30, TRASH.w - 60, TRASH.h - 70, 8);
  ctx.fill();
  ctx.fillStyle = '#3f3f46';
  rr(ctx, TRASH.x + 22, TRASH.y + 20, TRASH.w - 44, 16, 8);
  ctx.fill();
  text(ctx, 'BIN', TRASH.x + TRASH.w / 2, TRASH.y + 84, 20, '#d4d4d8', 'center');
  text(ctx, 'toss it', TRASH.x + TRASH.w / 2, TRASH.y + 110, 12, '#a1a1aa', 'center');
}

function drawCounter(ctx, s) {
  ctx.fillStyle = '#8a5a33';
  rr(ctx, COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.h, 14);
  ctx.fill();
  ctx.fillStyle = '#a8763e';
  rr(ctx, COUNTER.x + 6, COUNTER.y + 6, COUNTER.w - 12, COUNTER.h - 12, 10);
  ctx.fill();
  text(ctx, 'INGREDIENTS — click or press 1–6 to grab', COUNTER.x + 16, COUNTER.y + 20, 13, '#ffe9c4');
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const isHover = s.hover && s.hover.kind === 'bin' && s.hover.i === i;
    const isFocus = s.focus === i;
    ctx.fillStyle = '#fff8e6';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    if (isHover || isFocus) {
      ctx.strokeStyle = isFocus ? '#ffd54a' : '#fff';
      ctx.lineWidth = isFocus ? 4 : 2.5;
      rr(ctx, r.x - 2, r.y - 2, r.w + 4, r.h + 4, 12);
      ctx.stroke();
    }
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 48, 34, 'raw');
    text(ctx, ing.name, r.x + r.w / 2, r.y + 104, 15, '#5a3d24', 'center');
    text(ctx, `${ing.chop} chops`, r.x + r.w / 2, r.y + 126, 11, '#8a7a64', 'center');
    ctx.fillStyle = '#5a3d24';
    rr(ctx, r.x + 8, r.y + 8, 26, 26, 6);
    ctx.fill();
    text(ctx, ing.key, r.x + 21, r.y + 22, 14, '#ffd54a', 'center');
  });
}

function drawHud(ctx, s) {
  ctx.fillStyle = '#5a3d24';
  ctx.fillRect(HUD.x, HUD.y, HUD.w, HUD.h);
  ctx.fillStyle = '#3d2716';
  ctx.fillRect(HUD.x, HUD.y + HUD.h - 4, HUD.w, 4);
  text(ctx, 'EMBER & THYME', 20, 20, 20, '#ffd54a');
  text(ctx, 'Hearthfire Kitchen', 20, 42, 11, '#e8c9a0');
  text(ctx, `SCORE  ${s.score}`, 250, 28, 20, '#fff', 'left');
  text(ctx, `LV ${levelFor(s.served)}`, 480, 28, 16, '#ffd9a0');
  for (let i = 0; i < 3; i++) drawHeart(ctx, 540 + i * 26, 28, 20, i < s.lives);
  if (s.combo > 1) text(ctx, `COMBO x${(1 + Math.min(s.combo, 8) * 0.125).toFixed(2)}`, 745, 28, 14, '#ffd54a', 'right');
  const handLabel = s.hand
    ? `${ingredientById(s.hand.ing).name} · ${s.hand.stage}`
    : 'empty hands';
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  rr(ctx, HAND_CHIP.x, HAND_CHIP.y, HAND_CHIP.w, HAND_CHIP.h, 8);
  ctx.fill();
  text(ctx, `HAND: ${handLabel}`, HAND_CHIP.x + 12, HAND_CHIP.y + 19, 13, '#fff');
  text(ctx, s.paused ? '▶' : 'II', PAUSE_BTN.x + 26, PAUSE_BTN.y + 19, 14, '#fff', 'center');
  text(ctx, isMuted() ? 'MUTE' : 'SOUND', MUTE_BTN.x + 26, MUTE_BTN.y + 19, 10, '#fff', 'center');
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  rr(ctx, PAUSE_BTN.x, PAUSE_BTN.y, PAUSE_BTN.w, PAUSE_BTN.h, 6);
  ctx.stroke();
  rr(ctx, MUTE_BTN.x, MUTE_BTN.y, MUTE_BTN.w, MUTE_BTN.h, 6);
  ctx.stroke();
}

function drawFocusRing(ctx, s) {
  if (s.screen !== 'playing' || s.paused) return;
  const f = s.hover;
  if (!f) return;
  if (f.kind === 'ticket') return; // tickets draw their own ring
  if (f.kind === 'bin') return; // bins draw their own ring
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 3;
  const r = f.rect;
  rr(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12);
  ctx.stroke();
}

function drawToast(ctx, s) {
  if (s.toastT <= 0 || !s.toast) return;
  const alpha = Math.min(1, s.toastT);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 15px system-ui, sans-serif';
  const w = ctx.measureText(s.toast).width + 36;
  ctx.fillStyle = 'rgba(40,26,12,0.88)';
  rr(ctx, W / 2 - w / 2, 462, w, 32, 16);
  ctx.fill();
  text(ctx, s.toast, W / 2, 478, 15, '#ffe9c4', 'center');
  ctx.restore();
}

function drawFloaters(ctx, s) {
  for (const f of s.floaters) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, f.t);
    text(ctx, f.text, f.x, f.y - (1.6 - f.t) * 40, 24, f.color, 'center');
    ctx.restore();
  }
}

function drawParticles(ctx, s) {
  for (const p of s.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.t * 2);
    ctx.fillStyle = p.color;
    ellipse(ctx, p.x, p.y, 4, 4);
    ctx.fill();
    ctx.restore();
  }
}

function drawHandAtCursor(ctx, s) {
  if (!s.hand || s.screen !== 'playing') return;
  const { x, y } = s.mouse;
  ctx.save();
  ctx.globalAlpha = 0.95;
  drawIngredient(ctx, s.hand.ing, x + 26, y - 20, 18, s.hand.stage === 'raw' ? 'raw' : s.hand.stage);
  ctx.restore();
  text(ctx, `${ingredientById(s.hand.ing).name} (${s.hand.stage})`, x + 48, y - 20, 12, '#5a3d24');
}

function drawTitle(ctx, s) {
  ctx.fillStyle = 'rgba(24,12,4,0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2c1c0e';
  rr(ctx, 190, 60, 900, 600, 20);
  ctx.fill();
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 3;
  rr(ctx, 190, 60, 900, 600, 20);
  ctx.stroke();
  text(ctx, 'EMBER & THYME', W / 2, 140, 64, '#ffd54a', 'center');
  text(ctx, '— Hearthfire Kitchen —', W / 2, 190, 22, '#ffe9c4', 'center');
  text(ctx, 'You run a little hearth kitchen. Tickets come in on the order board —', W / 2, 250, 17, '#fff8e6', 'center');
  text(ctx, 'chop it, cook it, plate it, serve it before the timer runs out.', W / 2, 278, 17, '#fff8e6', 'center');
  text(ctx, '1  Grab an ingredient from the counter', W / 2, 330, 16, '#ffd9a0', 'center');
  text(ctx, '2  Chop it on the board, then cook it in a pot (5s — do not burn it!)', W / 2, 358, 16, '#ffd9a0', 'center');
  text(ctx, '3  Plate both parts of the dish, then click its ticket to serve', W / 2, 386, 16, '#ffd9a0', 'center');
  text(ctx, '3 missed orders ends the shift. Combos multiply your score.', W / 2, 414, 15, '#e8c9a0', 'center');
  ctx.fillStyle = '#e8a13c';
  rr(ctx, START_BTN.x, START_BTN.y, START_BTN.w, START_BTN.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 3;
  rr(ctx, START_BTN.x, START_BTN.y, START_BTN.w, START_BTN.h, 12);
  ctx.stroke();
  text(ctx, 'START COOKING', W / 2, START_BTN.y + 33, 24, '#fff', 'center');
  text(ctx, 'or press Enter  ·  mouse and keyboard both work', W / 2, 610, 13, '#b9a98e', 'center');
}

function drawGameOver(ctx, s) {
  ctx.fillStyle = 'rgba(24,12,4,0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2c1c0e';
  rr(ctx, 290, 110, 700, 500, 20);
  ctx.fill();
  ctx.strokeStyle = '#e5484d';
  ctx.lineWidth = 3;
  rr(ctx, 290, 110, 700, 500, 20);
  ctx.stroke();
  text(ctx, 'SERVICE OVER', W / 2, 180, 52, '#ff8a80', 'center');
  text(ctx, 'Three orders went cold. The hearth is banked for the night.', W / 2, 228, 16, '#ffe9c4', 'center');
  text(ctx, `FINAL SCORE  ${s.score}`, W / 2, 300, 30, '#ffd54a', 'center');
  text(ctx, `Dishes served: ${s.served}    ·    Orders missed: ${s.failed}`, W / 2, 350, 17, '#fff8e6', 'center');
  text(ctx, `Best combo: x${s.bestCombo}    ·    Level reached: ${levelFor(s.served)}`, W / 2, 382, 17, '#fff8e6', 'center');
  ctx.fillStyle = '#e8a13c';
  rr(ctx, RESTART_BTN.x, RESTART_BTN.y, RESTART_BTN.w, RESTART_BTN.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 3;
  rr(ctx, RESTART_BTN.x, RESTART_BTN.y, RESTART_BTN.w, RESTART_BTN.h, 12);
  ctx.stroke();
  text(ctx, 'COOK AGAIN', W / 2, RESTART_BTN.y + 33, 24, '#fff', 'center');
  text(ctx, 'or press R', W / 2, 628, 13, '#b9a98e', 'center');
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(24,12,4,0.6)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'PAUSED', W / 2, H / 2 - 10, 48, '#ffd54a', 'center');
  text(ctx, 'press P to keep cooking', W / 2, H / 2 + 34, 16, '#ffe9c4', 'center');
}

/** Draw the whole game for the current state. */
export function draw(ctx, s) {
  // Wall and floor.
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#efe0bd';
  for (let y = 210; y < 500; y += 46) {
    ctx.fillRect(0, y, W, 2);
  }
  ctx.fillStyle = '#b98a5a';
  ctx.fillRect(0, 470, W, 30);
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(0, 470, W, 4);

  drawTickets(ctx, s);
  drawMenu(ctx);
  drawChopBoard(ctx, s);
  drawStove(ctx, s);
  drawPlateStation(ctx, s);
  drawTrash(ctx);
  drawCounter(ctx, s);
  drawHud(ctx, s);
  drawFocusRing(ctx, s);
  drawParticles(ctx, s);
  drawToast(ctx, s);
  drawFloaters(ctx, s);
  drawHandAtCursor(ctx, s);

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(229,72,77,${s.flash * 0.22})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (s.screen === 'title') drawTitle(ctx, s);
  else if (s.screen === 'gameover') drawGameOver(ctx, s);
  else if (s.paused) drawPause(ctx);
}
