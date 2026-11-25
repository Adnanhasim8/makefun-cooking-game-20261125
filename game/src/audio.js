// Ember & Thyme: tiny synthesized sound effects (WebAudio, no audio files).
// The context is created lazily on first use so the page never needs a gesture
// to load, and every call is guarded so a headless run without audio still plays.

let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function audioContext() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'sine', gain = 0.1, delay = 0) {
  if (muted) return;
  const c = audioContext();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.02);
  } catch {
    // Audio is decoration; a failure must never break the game.
  }
}

export const sfx = {
  click() {
    tone(660, 0.06, 'triangle', 0.07);
  },
  pick() {
    tone(520, 0.07, 'sine', 0.09);
    tone(780, 0.06, 'sine', 0.07, 0.05);
  },
  chop() {
    tone(180, 0.08, 'square', 0.11);
    tone(120, 0.06, 'square', 0.09, 0.02);
  },
  place() {
    tone(300, 0.08, 'triangle', 0.09);
  },
  done() {
    tone(880, 0.12, 'sine', 0.11);
    tone(1174, 0.14, 'sine', 0.09, 0.08);
  },
  serve() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'triangle', 0.11, i * 0.07));
  },
  fail() {
    tone(160, 0.3, 'sawtooth', 0.11);
    tone(110, 0.35, 'sawtooth', 0.09, 0.1);
  },
  burn() {
    tone(90, 0.4, 'sawtooth', 0.09);
  },
  start() {
    [392, 523, 659].forEach((f, i) => tone(f, 0.1, 'triangle', 0.09, i * 0.06));
  },
};
