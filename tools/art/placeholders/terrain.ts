// Placeholder terrain tileset: 16 × 16 tiles in a 5 × 2 sheet. Ground tiles are opaque and
// tile seamlessly (all detail stays 1 px away from the edges); decoration tiles have a
// transparent background and sit on a second map layer above the ground.
import { PixelCanvas, seededRandom, shadedEllipse } from '../draw.ts';

export const TILE = 16;
export const COLUMNS = 5;

/** Tile index (0-based, as in Tiled's tileset) → name and whether the player collides with it. */
export const TERRAIN_TILES = [
  { name: 'grass', collides: false },
  { name: 'grass-tufts', collides: false },
  { name: 'path', collides: false },
  { name: 'water', collides: true },
  { name: 'shore', collides: true },
  { name: 'bush', collides: true },
  { name: 'rock', collides: true },
  { name: 'fence', collides: true },
  { name: 'flowers', collides: false },
  { name: 'stump', collides: true },
] as const;

export type TerrainTileName = (typeof TERRAIN_TILES)[number]['name'];

type C = (name: string) => string;

function grass(t: PixelCanvas, c: C, seed: number, tufts: number): void {
  t.rect(0, 0, TILE, TILE, c('grass'));
  const rnd = seededRandom(seed);
  for (let i = 0; i < tufts; i++) {
    const x = 1 + Math.floor(rnd() * 13);
    const y = 2 + Math.floor(rnd() * 12);
    // A tiny "v" tuft: dark base, light tip.
    t.set(x, y, c('moss'));
    t.set(x + 1, y, c('moss'));
    t.set(x, y - 1, c('grass-light'));
    t.set(x + 2, y - 1, c('grass-light'));
  }
  if (tufts > 4) t.set(4 + Math.floor(rnd() * 8), 3 + Math.floor(rnd() * 8), c('leaf-light'));
}

function path(t: PixelCanvas, c: C): void {
  t.rect(0, 0, TILE, TILE, c('sand'));
  const rnd = seededRandom(31);
  for (let i = 0; i < 7; i++) {
    const x = 1 + Math.floor(rnd() * 13);
    const y = 1 + Math.floor(rnd() * 13);
    t.set(x, y, c('wood'));
    if (i % 3 === 0) {
      // A pebble: light top-left, dark bottom-right.
      t.set(x + 1, y, c('cream'));
      t.set(x + 1, y + 1, c('stone'));
    }
  }
}

function water(t: PixelCanvas, c: C): void {
  t.rect(0, 0, TILE, TILE, c('sea'));
  t.rect(0, 13, TILE, 3, c('sea-deep'));
  const waves: Array<[number, number]> = [[2, 3], [9, 6], [4, 10]];
  for (const [x, y] of waves) {
    t.rect(x, y, 3, 1, c('sea-light'));
    t.set(x + 3, y - 1, c('sea-light'));
  }
  t.set(12, 2, c('foam'));
}

function shore(t: PixelCanvas, c: C): void {
  water(t, c);
  t.rect(0, 0, TILE, 4, c('grass'));
  t.rect(0, 4, TILE, 2, c('sand'));
  t.rect(0, 6, TILE, 1, c('foam'));
  for (const x of [1, 6, 11]) t.set(x, 2, c('moss'));
}

function bush(t: PixelCanvas, c: C): void {
  shadedEllipse(t, 7.5, 8.5, 7, 6.5, { outline: c('ink'), base: c('moss'), shade: c('moss-dark'), highlight: c('grass-light') });
  for (const [x, y] of [[5, 7], [10, 9], [8, 11]] as const) t.set(x, y, c('rose'));
}

function rock(t: PixelCanvas, c: C): void {
  shadedEllipse(t, 7.5, 10, 6.5, 5, { outline: c('ink'), base: c('stone'), shade: c('stone-dark'), highlight: c('stone-light') });
  t.set(6, 9, c('cream'));
}

function fence(t: PixelCanvas, c: C): void {
  // Two rails run edge to edge so fences join up horizontally; one post in the middle.
  for (const y of [5, 10]) {
    t.rect(0, y - 1, TILE, 1, c('ink'));
    t.rect(0, y, TILE, 2, c('wood'));
    t.rect(0, y + 1, TILE, 1, c('bark'));
    t.rect(0, y + 2, TILE, 1, c('ink'));
  }
  t.rect(6, 1, 4, 15, c('ink'));
  t.rect(7, 2, 2, 13, c('wood'));
  t.rect(8, 3, 1, 12, c('bark'));
  t.rect(7, 2, 1, 1, c('sand'));
}

function flowers(t: PixelCanvas, c: C): void {
  const spots: Array<[number, number, string]> = [[3, 4, 'rose'], [11, 6, 'gold-light'], [6, 11, 'paper'], [12, 12, 'rose']];
  for (const [x, y, petal] of spots) {
    t.set(x, y + 2, c('moss-dark'));
    t.set(x - 1, y, c(petal));
    t.set(x + 1, y, c(petal));
    t.set(x, y - 1, c(petal));
    t.set(x, y + 1, c(petal));
    t.set(x, y, c('gold'));
  }
}

function stump(t: PixelCanvas, c: C): void {
  t.rect(3, 7, 10, 7, c('ink'));
  t.rect(4, 7, 8, 6, c('bark'));
  t.rect(10, 7, 2, 6, c('bark-dark'));
  shadedEllipse(t, 7.5, 6.5, 5, 3, { outline: c('ink'), base: c('sand'), shade: c('wood'), highlight: c('cream') });
  t.rect(6, 6, 3, 1, c('wood'));
}

export function terrainTileset(c: C): PixelCanvas {
  const rows = Math.ceil(TERRAIN_TILES.length / COLUMNS);
  const sheet = new PixelCanvas(COLUMNS * TILE, rows * TILE);
  const painters: Record<TerrainTileName, (t: PixelCanvas) => void> = {
    grass: (t) => grass(t, c, 7, 3),
    'grass-tufts': (t) => grass(t, c, 19, 6),
    path: (t) => path(t, c),
    water: (t) => water(t, c),
    shore: (t) => shore(t, c),
    bush: (t) => bush(t, c),
    rock: (t) => rock(t, c),
    fence: (t) => fence(t, c),
    flowers: (t) => flowers(t, c),
    stump: (t) => stump(t, c),
  };
  TERRAIN_TILES.forEach((tile, i) => {
    const t = new PixelCanvas(TILE, TILE);
    painters[tile.name](t);
    sheet.blit(t, (i % COLUMNS) * TILE, Math.floor(i / COLUMNS) * TILE);
  });
  return sheet;
}
