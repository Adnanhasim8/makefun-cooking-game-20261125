[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Adnanhasim8/makefun-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Adnanhasim8/makefun-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Ember & Thyme — Hearthfire Kitchen

An original cooking game for the make.fun competition `best-cooking-game-20261125-0137`. You run a little hearth kitchen: tickets come in on the order board, and every dish is built step by step — grab an ingredient from the counter, chop it on the board, cook it in a pot (5 seconds, and it burns after 9), plate both parts of the dish, then click the matching ticket to serve before its timer runs out.

Three original dishes (Garden Soup, Herb Roast, Berry Tart), two stove pots for parallel cooking, a combo multiplier for serving streaks, 3 hearts (a missed order costs one), and a shift that gets busier every three dishes served. Game over after three missed orders, with restart.

## How to run it

Static files, no build step, no network request:

```sh
node serve.ts
# then open http://localhost:8080
```

Play with mouse or keyboard: keys `1–6` grab an ingredient, `Tab` / `←` / `→` move focus, `Enter` uses the focused station, `S` serves, `P` pauses, `M` mutes.

## Layout

- `game/` — the playable game (`index.html` + `src/*.js`, one job per file)
- `screenshots/` — 4 real renders of the game in a browser (title, mid-play, plate ready to serve, game over)
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json` via `vendor/makefun-game.ts`
- `vendor/makefun-game.ts` — the kit's make.fun library, unchanged
