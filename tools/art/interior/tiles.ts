// Interior tileset for the Skill Tower and the Guild Hall: warm plank floors, a heather rug with
// a gold border (3 × 3 pieces, any size from 3 × 3 up), a star mosaic for the rug's centre, and
// small floor clutter. Walls and banners come from the dungeon tileset, so every stone building
// shares one masonry.
import { PixelCanvas } from '../draw.ts';
import type { C } from '../placeholders/terrain.ts';

export const TILE = 16;
export const COLUMNS = 8;

const RUG_PARTS = ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'] as const;
type RugPart = (typeof RUG_PARTS)[number];

export const INTERIOR_TILES = [
  { name: 'planks', collides: false },
  { name: 'planks-2', collides: false },
  { name: 'planks-worn', collides: false },
  ...RUG_PARTS.map((p) => ({ name: `rug-${p}`, collides: false })),
  { name: 'rug-star', collides: false },
  { name: 'books', collides: false },
  { name: 'scrolls', collides: false },
] as const;

/** Floorboards 4 px wide running north–south, staggered joints, lit on their left edge. */
function planks(t: PixelCanvas, c: C, offset: number, worn: boolean): void {
  t.rect(0, 0, TILE, TILE, c('wood'));
  for (let x = 0; x < TILE; x += 4) {
    t.rect(x + 3, 0, 1, TILE, c('bark'));
    t.rect(x, 0, 1, TILE, c('sand'));
    const joint = (x * 5 + offset) % 16;
    t.rect(x, joint, 3, 1, c('bark'));
  }
  if (worn) {
    t.rect(5, 6, 2, 3, c('sand'));
    t.set(10, 11, c('bark-dark'));
    t.set(13, 3, c('bark-dark'));
  }
}

/** A heather rug with a 2 px gold border; edges and corners line up into any rectangle. */
function rug(t: PixelCanvas, c: C, part: RugPart | 'star'): void {
  t.rect(0, 0, TILE, TILE, c('heather'));
  // A faint diamond lattice in the field.
  for (let i = 0; i < TILE; i += 4) {
    t.set(i, (i + 2) % TILE, c('plum'));
    t.set((i + 2) % TILE, i, c('plum'));
  }
  const n = part === 'nw' || part === 'n' || part === 'ne';
  const s = part === 'sw' || part === 's' || part === 'se';
  const w = part === 'nw' || part === 'w' || part === 'sw';
  const e = part === 'ne' || part === 'e' || part === 'se';
  if (n) { t.rect(0, 0, TILE, 1, c('ink')); t.rect(0, 2, TILE, 2, c('gold')); t.rect(0, 1, TILE, 1, c('heather')); }
  if (s) { t.rect(0, 15, TILE, 1, c('ink')); t.rect(0, 12, TILE, 2, c('gold')); t.rect(0, 14, TILE, 1, c('heather')); }
  if (w) { t.rect(0, 0, 1, TILE, c('ink')); t.rect(2, n ? 2 : 0, 2, s ? 12 : TILE - (n ? 2 : 0), c('gold')); }
  if (e) { t.rect(15, 0, 1, TILE, c('ink')); t.rect(12, n ? 2 : 0, 2, s ? 12 : TILE - (n ? 2 : 0), c('gold')); }
  if (part === 'star') {
    // An eight-point gold star with a light centre: the tower's emblem.
    for (let i = 2; i <= 13; i++) {
      t.set(i, 7, c('gold'));
      t.set(i, 8, c('gold'));
      t.set(7, i, c('gold'));
      t.set(8, i, c('gold'));
    }
    for (let i = 4; i <= 11; i++) {
      t.set(i, i, c('gold'));
      t.set(15 - i, i, c('gold'));
    }
    t.rect(6, 6, 4, 4, c('gold-light'));
    t.rect(7, 7, 2, 2, c('paper'));
  }
}

function books(t: PixelCanvas, c: C): void {
  const stack: Array<[number, number, string]> = [[3, 12, 'brick'], [4, 10, 'denim'], [3, 8, 'moss'], [10, 12, 'heather'], [11, 10, 'gold']];
  for (const [x, y, hex] of stack) {
    t.rect(x, y, 6, 2, c(hex));
    t.rect(x, y, 6, 1, c('paper'));
    t.rect(x + 5, y, 1, 2, c('ink'));
    t.rect(x, y + 2, 6, 1, c('ink'));
  }
}

function scrolls(t: PixelCanvas, c: C): void {
  for (const [x, y] of [[3, 5], [8, 10], [6, 3]] as const) {
    t.rect(x, y, 7, 2, c('cream'));
    t.rect(x, y, 7, 1, c('paper'));
    t.rect(x, y, 1, 2, c('sand'));
    t.rect(x + 6, y, 1, 2, c('sand'));
    t.rect(x, y + 2, 7, 1, c('bark'));
    t.set(x + 3, y + 1, c('brick'));
  }
}

export function interiorTileset(c: C): PixelCanvas {
  const rows = Math.ceil(INTERIOR_TILES.length / COLUMNS);
  const sheet = new PixelCanvas(COLUMNS * TILE, rows * TILE);
  INTERIOR_TILES.forEach((tile, i) => {
    const t = new PixelCanvas(TILE, TILE);
    const name: string = tile.name;
    if (name === 'planks') planks(t, c, 0, false);
    else if (name === 'planks-2') planks(t, c, 7, false);
    else if (name === 'planks-worn') planks(t, c, 3, true);
    else if (name === 'rug-star') rug(t, c, 'star');
    else if (name.startsWith('rug-')) rug(t, c, name.slice(4) as RugPart);
    else if (name === 'books') books(t, c);
    else if (name === 'scrolls') scrolls(t, c);
    else throw new Error(`No painter for interior tile "${name}"`);
    sheet.blit(t, (i % COLUMNS) * TILE, Math.floor(i / COLUMNS) * TILE);
  });
  return sheet;
}
