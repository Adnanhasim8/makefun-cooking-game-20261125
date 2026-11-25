// Ember & Thyme: the game's data — ingredients, recipes and difficulty curves.
// Nothing here is copied from any other game: the dishes, names and numbers are original.

/** One ingredient a player can grab from the counter. `chop` is how many board chops it needs. */
export const INGREDIENTS = [
  { id: 'tomato', name: 'Tomato', color: '#e5484d', dark: '#a92c31', key: '1', chop: 3 },
  { id: 'mushroom', name: 'Mushroom', color: '#e8dcc0', dark: '#b39a6d', key: '2', chop: 3 },
  { id: 'chicken', name: 'Chicken', color: '#f0c078', dark: '#b57e33', key: '3', chop: 3 },
  { id: 'herb', name: 'Herb', color: '#57a85a', dark: '#2f7033', key: '4', chop: 2 },
  { id: 'bread', name: 'Bread', color: '#d9a05b', dark: '#96682c', key: '5', chop: 2 },
  { id: 'berry', name: 'Berry', color: '#8a5cf6', dark: '#5430ad', key: '6', chop: 2 },
];

/** One dish: two ingredients, chopped, cooked, plated, served. `pay` is its base score. */
export const RECIPES = [
  { id: 'soup', name: 'Garden Soup', needs: ['tomato', 'mushroom'], cook: 5, color: '#d94f2b', pay: 100 },
  { id: 'roast', name: 'Herb Roast', needs: ['chicken', 'herb'], cook: 6, color: '#b5762e', pay: 120 },
  { id: 'tart', name: 'Berry Tart', needs: ['berry', 'bread'], cook: 5, color: '#8a4fd0', pay: 110 },
];

export const ingredientById = (id) => INGREDIENTS.find((i) => i.id === id);
export const recipeById = (id) => RECIPES.find((r) => r.id === id);

/** True when two ingredient lists hold the same items, order aside. */
export function sameSet(a, b) {
  return a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
}

/** Seconds one item cooks before it is done; past BURN_TIME it is burnt. */
export const COOK_TIME = 5;
export const BURN_TIME = 9;
export const MAX_LIVES = 3;

/** An order's countdown, shrinking as the shift heats up. */
export function orderDuration(level) {
  return Math.max(32, 52 - level * 2);
}

/** Seconds between new orders, shrinking as the shift heats up. */
export function spawnInterval(level) {
  return Math.max(9, 15 - level);
}

/** Level rises every three dishes served. */
export function levelFor(served) {
  return 1 + Math.floor(served / 3);
}
