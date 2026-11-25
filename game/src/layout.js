// Ember & Thyme: every rectangle the game draws and clicks, in one place.
// The canvas is a fixed 1280x720 stage; the page scales it to fit the window.

export const W = 1280;
export const H = 720;

export const HUD = { x: 0, y: 0, w: 1280, h: 56 };
export const HAND_CHIP = { x: 760, y: 10, w: 300, h: 36 };
export const PAUSE_BTN = { x: 1150, y: 10, w: 52, h: 36 };
export const MUTE_BTN = { x: 1210, y: 10, w: 52, h: 36 };

export const BOARD = { x: 24, y: 72, w: 396, h: 138 };
export function ticketRect(i) {
  return { x: BOARD.x + 10 + i * 128, y: BOARD.y + 30, w: 118, h: 96 };
}

export const MENU = { x: 880, y: 72, w: 376, h: 138 };
export function menuCardRect(i) {
  return { x: MENU.x + 10 + i * 122, y: MENU.y + 30, w: 112, h: 96 };
}

export const CHOP = { x: 40, y: 250, w: 260, h: 180 };
export const STOVE = { x: 340, y: 250, w: 360, h: 180 };
export function potRect(i) {
  return { x: STOVE.x + 30 + i * 180, y: STOVE.y + 55, w: 130, h: 105 };
}
export const PLATE = { x: 740, y: 250, w: 280, h: 180 };
export const TRASH = { x: 1060, y: 250, w: 180, h: 180 };

export const COUNTER = { x: 24, y: 500, w: 1232, h: 200 };
export function binRect(i) {
  return { x: COUNTER.x + 8 + i * 204, y: COUNTER.y + 34, w: 188, h: 150 };
}

export const START_BTN = { x: 490, y: 520, w: 300, h: 64 };
export const RESTART_BTN = { x: 490, y: 540, w: 300, h: 64 };

/** True when point (x, y) lies inside rect r. */
export function hit(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
