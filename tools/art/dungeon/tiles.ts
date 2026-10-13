// Dungeon tileset: the Projects vaults. Cosy rather than grim: pale worn flagstones, warm
// torchlight (props), a red runner rug and a banner per project.
// Walls follow the top-down three-quarter view: where a wall has floor to its south we see its
// face, two tiles of brick (upper and lower); everywhere else we see its dark top, rimmed with a
// light edge on each side that meets floor. The map generator picks the right tile.
import { PixelCanvas, seededRandom } from '../draw.ts';
import type { C } from '../placeholders/terrain.ts';

export const TILE = 16;
export const COLUMNS = 8;

/** Rim bits on a wall top: which sides face open floor. */
export const RIM = { n: 1, e: 2, s: 4, w: 8 } as const;

export const BANNERS = ['brick', 'denim', 'moss', 'gold', 'heather'] as const;
export type BannerColor = (typeof BANNERS)[number];

export const DUNGEON_TILES = [
  ...Array.from({ length: 16 }, (_, mask) => ({ name: `wall-top-${mask}`, collides: true })),
  { name: 'wall-face-upper', collides: true },
  { name: 'wall-face-lower', collides: true },
  { name: 'floor', collides: false },
  { name: 'floor-2', collides: false },
  { name: 'floor-cracked', collides: false },
  { name: 'floor-moss', collides: false },
  { name: 'rug-left', collides: false },
  { name: 'rug-right', collides: false },
  { name: 'rubble', collides: false },
  { name: 'cobweb-nw', collides: false },
  { name: 'cobweb-ne', collides: false },
  ...BANNERS.map((b) => ({ name: `banner-${b}`, collides: true })),
] as const;

function wallTop(t: PixelCanvas, c: C, mask: number): void {
  t.rect(0, 0, TILE, TILE, c('plum'));
  const rnd = seededRandom(41);
  for (let i = 0; i < 6; i++) t.set(1 + Math.floor(rnd() * 14), 1 + Math.floor(rnd() * 14), c('stone-dark'));
  // Each side that meets floor: an ink edge with a lit stone line just inside it.
  if (mask & RIM.n) { t.rect(0, 0, TILE, 1, c('ink')); t.rect(0, 1, TILE, 1, c('stone')); }
  if (mask & RIM.s) { t.rect(0, 15, TILE, 1, c('ink')); t.rect(0, 14, TILE, 1, c('stone-dark')); }
  if (mask & RIM.w) { t.rect(0, 0, 1, TILE, c('ink')); t.rect(1, mask & RIM.n ? 2 : 0, 1, TILE, c('stone')); }
  if (mask & RIM.e) { t.rect(15, 0, 1, TILE, c('ink')); t.rect(14, mask & RIM.n ? 2 : 0, 1, TILE, c('stone-dark')); }
}

/** Brick courses 4 px tall, bricks 8 px wide and staggered, lit along their top-left. */
function bricks(t: PixelCanvas, c: C): void {
  t.rect(0, 0, TILE, TILE, c('stone-dark'));
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    const offset = row % 2 ? 4 : 0;
    for (let k = -1; k < 3; k++) {
      const x = k * 8 + offset;
      for (let yy = y; yy < y + 3; yy++) for (let xx = x; xx < x + 7; xx++) {
        if (xx < 0 || xx >= TILE) continue;
        t.set(xx, yy, yy === y ? c('stone-light') : xx === x + 6 || yy === y + 2 ? c('stone-dark') : c('stone'));
      }
    }
  }
}

function faceUpper(t: PixelCanvas, c: C): void {
  bricks(t, c);
  // The top course meets the wall top: a hard ink edge, then a lit lip.
  t.rect(0, 0, TILE, 1, c('ink'));
  t.rect(0, 1, TILE, 1, c('cream'));
}

function faceLower(t: PixelCanvas, c: C): void {
  bricks(t, c);
  // Skirting where the wall meets the floor, so walls sit on the ground.
  t.rect(0, 13, TILE, 2, c('plum'));
  t.rect(0, 15, TILE, 1, c('ink'));
}

/** Large worn flagstones; the four layouts keep big floors from looking tiled. */
function floor(t: PixelCanvas, c: C, variant: 0 | 1 | 2 | 3): void {
  t.rect(0, 0, TILE, TILE, c('stone-light'));
  const stones = variant === 1 ? [[0, 0, 10, 6], [10, 0, 6, 9], [0, 6, 6, 10], [6, 6, 4, 10], [10, 9, 6, 7]] : [[0, 0, 7, 8], [7, 0, 9, 5], [7, 5, 9, 11], [0, 8, 7, 8]];
  // Only the shaded joints (bottom and right of each stone) are drawn, plus a worn highlight in
  // one corner: enough to read as flagstones without turning big floors into a busy grid.
  for (const [x, y, w, h] of stones as Array<[number, number, number, number]>) {
    t.rect(x + w - 1, y, 1, h, c('stone'));
    t.rect(x, y + h - 1, w, 1, c('stone'));
    t.rect(x + 1, y + 1, 2, 1, c('cream'));
  }
  if (variant === 2) for (const [x, y] of [[3, 2], [4, 3], [4, 4], [5, 5], [6, 5], [7, 6], [8, 8], [8, 9]] as const) t.set(x, y, c('stone-dark'));
  if (variant === 3) {
    for (const [x, y, w] of [[1, 12, 4], [2, 11, 2], [11, 3, 3], [12, 2, 2], [13, 13, 2]] as const) t.rect(x, y, w, 1, c('moss'));
    t.set(2, 12, c('grass'));
    t.set(12, 3, c('grass'));
  }
}

/** A red runner with a gold border; left and right halves make a 2-tile-wide rug of any length. */
function rug(t: PixelCanvas, c: C, side: 'left' | 'right'): void {
  t.rect(0, 0, TILE, TILE, c('brick'));
  const edge = side === 'left' ? 1 : 13;
  t.rect(edge, 0, 2, TILE, c('gold'));
  t.rect(side === 'left' ? 0 : 15, 0, 1, TILE, c('plum'));
  // Half a diamond each side of the seam, so the two halves join into one pattern.
  const seam = side === 'left' ? 15 : 0;
  for (let i = 0; i < 4; i++) {
    const d = side === 'left' ? -i : i;
    t.set(seam + d, 4 + i, c('rose'));
    t.set(seam + d, 11 - i, c('rose'));
  }
  t.rect(side === 'left' ? 5 : 9, 7, 2, 2, c('gold-light'));
}

function rubble(t: PixelCanvas, c: C): void {
  for (const [x, y, w] of [[3, 10, 4], [8, 12, 3], [11, 9, 2], [5, 4, 2]] as const) {
    t.rect(x, y, w, 2, c('stone'));
    t.set(x, y, c('stone-light'));
    t.rect(x, y + 2, w, 1, c('stone-dark'));
  }
}

function cobweb(t: PixelCanvas, c: C, corner: 'nw' | 'ne'): void {
  const fx = (x: number) => (corner === 'nw' ? x : 15 - x);
  for (let i = 0; i < 9; i++) {
    t.set(fx(i), 0, c('paper'));
    t.set(fx(0), i, c('paper'));
    t.set(fx(i), i, c('stone-light'));
  }
  for (const r of [3, 6]) for (let i = 0; i <= r; i++) t.set(fx(i), r - i, c('stone-light'));
}

/** A hanging banner on a rod, swallow-tailed, with a pale emblem: one colour per project. */
function banner(t: PixelCanvas, c: C, color: BannerColor): void {
  const shade: Record<BannerColor, string> = { brick: 'plum', denim: 'sea-deep', moss: 'moss-dark', gold: 'wood', heather: 'plum' };
  t.rect(1, 1, 14, 2, c('ink'));
  t.rect(2, 1, 12, 1, c('bark'));
  t.rect(3, 3, 10, 12, c('ink'));
  t.rect(4, 3, 8, 11, c(color));
  t.rect(10, 3, 2, 11, c(shade[color]));
  // Swallow tail.
  t.set(7, 13, c('ink'));
  t.set(8, 13, c('ink'));
  t.set(7, 12, c(shade[color]));
  t.set(8, 12, c(shade[color]));
  t.rect(3, 15, 3, 1, c('ink'));
  t.rect(10, 15, 3, 1, c('ink'));
  // Emblem: a small diamond.
  t.set(7, 5, c('paper'));
  t.rect(6, 6, 3, 1, c('paper'));
  t.set(7, 7, c('paper'));
}

export function dungeonTileset(c: C): PixelCanvas {
  const rows = Math.ceil(DUNGEON_TILES.length / COLUMNS);
  const sheet = new PixelCanvas(COLUMNS * TILE, rows * TILE);
  DUNGEON_TILES.forEach((tile, i) => {
    const t = new PixelCanvas(TILE, TILE);
    const name: string = tile.name;
    if (name.startsWith('wall-top-')) wallTop(t, c, Number(name.slice('wall-top-'.length)));
    else if (name === 'wall-face-upper') faceUpper(t, c);
    else if (name === 'wall-face-lower') faceLower(t, c);
    else if (name === 'floor') floor(t, c, 0);
    else if (name === 'floor-2') floor(t, c, 1);
    else if (name === 'floor-cracked') floor(t, c, 2);
    else if (name === 'floor-moss') floor(t, c, 3);
    else if (name === 'rug-left') rug(t, c, 'left');
    else if (name === 'rug-right') rug(t, c, 'right');
    else if (name === 'rubble') rubble(t, c);
    else if (name === 'cobweb-nw') cobweb(t, c, 'nw');
    else if (name === 'cobweb-ne') cobweb(t, c, 'ne');
    else if (name.startsWith('banner-')) banner(t, c, name.slice('banner-'.length) as BannerColor);
    else throw new Error(`No painter for dungeon tile "${name}"`);
    sheet.blit(t, (i % COLUMNS) * TILE, Math.floor(i / COLUMNS) * TILE);
  });
  return sheet;
}
