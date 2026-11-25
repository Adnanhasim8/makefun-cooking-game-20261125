// Ember & Thyme: deterministic screenshot states. `?shot=start|play|serve|end`
// puts the real game into a real state (title, mid-shift, plate ready to
// serve, game over) so screenshots are renders of the game itself, not mocks.

/** Apply the ?shot= state to a fresh game state, if one was requested. */
export function applyShot(s, params) {
  const shot = params.get('shot');
  if (!shot) return;
  if (shot === 'start') {
    s.screen = 'title';
  } else if (shot === 'play') {
    s.screen = 'playing';
    s.score = 250;
    s.combo = 2;
    s.bestCombo = 2;
    s.served = 2;
    s.lives = 3;
    s.boardState.orders = [
      { recipeId: 'soup', timeLeft: 38, total: 50 },
      { recipeId: 'roast', timeLeft: 26, total: 46 },
    ];
    s.boardState.spawnT = 8;
    s.pots[0].item = { ing: 'tomato', t: 2.0 }; // still cooking (stays mid-cook in the shot)
    s.pots[1].item = { ing: 'mushroom', t: 5.4 }; // done, ready to take
    s.plate = ['tomato']; // dish mid-assembly: one of two parts plated
    s.plateReady = null;
    s.board = { ing: 'chicken', chopsLeft: 1 }; // chopping in progress
    s.toast = 'Keep the orders moving!';
    s.toastT = 30;
  } else if (shot === 'serve') {
    s.screen = 'playing';
    s.score = 400;
    s.combo = 3;
    s.bestCombo = 3;
    s.served = 3;
    s.lives = 3;
    s.boardState.orders = [
      { recipeId: 'soup', timeLeft: 30, total: 50 },
      { recipeId: 'tart', timeLeft: 41, total: 48 },
    ];
    s.boardState.spawnT = 9;
    s.pots[0].item = null;
    s.pots[1].item = { ing: 'berry', t: 2.0 };
    s.plate = ['tomato', 'mushroom']; // Garden Soup fully plated
    s.plateReady = 'soup';
    s.board = null;
    s.toast = 'Garden Soup is ready — serve it!';
    s.toastT = 30;
  } else if (shot === 'end') {
    s.screen = 'gameover';
    s.score = 1250;
    s.served = 8;
    s.failed = 3;
    s.bestCombo = 4;
    s.lives = 0;
    s.boardState.orders = [];
  }
}
