// Village props: tall things that characters walk in front of and behind, so they are
// y-sorted objects rather than tiles. Each is painted with fills (light from the top-left),
// then outlined in ink in one pass. Their collision boxes live in the manifest ("solid").
import { PixelCanvas, outline, type Grid } from '../draw.ts';
import type { C } from '../placeholders/terrain.ts';

/** Fills a row span; used for slanted roofs and tree tiers. */
function span(t: PixelCanvas, x0: number, x1: number, y: number, hex: string): void {
  for (let x = Math.round(x0); x <= Math.round(x1); x++) t.set(x, y, hex);
}

/** Draws a glyph grid ('x' = pixel) in one colour. */
function glyphs(t: PixelCanvas, grids: Grid[], x: number, y: number, hex: string, gap = 1): void {
  let cx = x;
  for (const g of grids) {
    g.forEach((row, gy) => [...row].forEach((ch, gx) => ch === 'x' && t.set(cx + gx, y + gy, hex)));
    cx += g[0]!.length + gap;
  }
}

const FONT: Record<string, Grid> = {
  W: ['x...x', 'x...x', 'x.x.x', 'x.x.x', '.x.x.'],
  E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'],
  L: ['x..', 'x..', 'x..', 'x..', 'xxx'],
  C: ['.xx', 'x..', 'x..', 'x..', '.xx'],
  O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'],
  M: ['x...x', 'xx.xx', 'x.x.x', 'x...x', 'x...x'],
  '<': ['..x', '.x.', 'x..', '.x.', '..x'],
  '/': ['..x', '..x', '.x.', 'x..', 'x..'],
  '>': ['x..', '.x.', '..x', '.x.', 'x..'],
};
const text = (s: string) => [...s].map((ch) => FONT[ch]!);
const textWidth = (s: string, gap = 1) => text(s).reduce((w, g) => w + g[0]!.length + gap, -gap);

/** Horizontal planks: a seam every 4 px, staggered vertical joints, lit at the top of each plank. */
function planks(t: PixelCanvas, c: C, x0: number, y0: number, x1: number, y1: number): void {
  for (let y = y0; y <= y1; y++) {
    const row = Math.floor((y - y0) / 4);
    const inPlank = (y - y0) % 4;
    for (let x = x0; x <= x1; x++) {
      const joint = (x - x0 + (row % 2) * 9) % 18 === 17;
      t.set(x, y, inPlank === 3 || joint ? c('bark') : inPlank === 0 ? c('sand') : c('wood'));
    }
  }
}

/** 14 × 11 window: dark frame, cross mullion, sky reflection with a diagonal glint, warm sill. */
function window(t: PixelCanvas, c: C, x: number, y: number): void {
  t.rect(x, y, 14, 11, c('bark-dark'));
  t.rect(x + 1, y + 1, 12, 9, c('sea-light'));
  t.rect(x + 1, y + 6, 12, 4, c('sea'));
  for (let i = 0; i < 4; i++) t.set(x + 2 + i, y + 5 - i, c('foam'));
  t.rect(x + 7, y + 1, 1, 9, c('bark-dark'));
  t.rect(x + 1, y + 5, 12, 1, c('bark-dark'));
  t.rect(x - 1, y + 11, 16, 1, c('bark-dark'));
  // Flower box with blooms.
  t.rect(x, y + 12, 14, 3, c('bark'));
  t.rect(x, y + 12, 14, 1, c('wood'));
  for (let i = 0; i < 6; i++) {
    t.set(x + 1 + i * 2, y + 11, i % 2 ? c('gold-light') : c('rose'));
    t.set(x + 2 + i * 2, y + 11, c('moss'));
  }
}

/**
 * 80 × 80 workshop: shingle roof with a stone chimney, plank walls, two windows with flower
 * boxes, a round-topped door and a "</>" plaque above it, the one hint that an engineer lives here.
 */
export function house(c: C): PixelCanvas {
  const t = new PixelCanvas(80, 80);
  // Roof: a trapezoid seen from the front-top, shingles in staggered rows.
  const roofTop = 9;
  const roofBottom = 44;
  for (let y = roofTop; y <= roofBottom; y++) {
    const k = (y - roofTop) / (roofBottom - roofTop);
    const x0 = 12 - k * 10;
    const x1 = 67 + k * 10;
    const row = Math.floor((y - roofTop) / 4);
    for (let x = Math.round(x0); x <= Math.round(x1); x++) {
      const inRow = (y - roofTop) % 4;
      const joint = (x + (row % 2) * 3) % 6 === 0;
      let hex = c('brick');
      if (inRow === 3) hex = c('plum');
      else if (joint && inRow > 0) hex = c('plum');
      else if (inRow === 0 && x < 40) hex = c('rose');
      t.set(x, y, hex);
    }
  }
  span(t, 12, 67, roofTop, c('blush')); // ridge catches the light
  // Chimney sits on the roof, behind the ridge line.
  t.rect(54, 1, 8, 16, c('stone'));
  t.rect(54, 1, 2, 16, c('stone-light'));
  t.rect(60, 1, 2, 16, c('stone-dark'));
  for (const y of [5, 10]) t.rect(54, y, 8, 1, c('stone-dark'));
  t.rect(53, 1, 10, 2, c('stone-dark'));
  // Eave trim and the shadow it casts on the wall.
  t.rect(2, 43, 76, 2, c('bark-dark'));
  // Walls.
  planks(t, c, 6, 45, 73, 79);
  t.rect(6, 45, 68, 2, c('bark'));
  t.rect(6, 45, 3, 35, c('bark-dark'));
  t.rect(71, 45, 3, 35, c('bark-dark'));
  t.rect(6, 45, 1, 35, c('bark'));
  // Windows either side of the door.
  window(t, c, 13, 54);
  window(t, c, 53, 54);
  // Door: round-topped, vertical planks, brass knob, stone step.
  t.rect(32, 56, 16, 24, c('bark-dark'));
  t.rect(34, 54, 12, 2, c('bark-dark'));
  t.rect(33, 58, 14, 22, c('bark'));
  t.rect(35, 56, 10, 2, c('bark'));
  for (const x of [36, 40, 44]) t.rect(x, 58, 1, 22, c('bark-dark'));
  t.rect(33, 58, 1, 22, c('wood'));
  t.rect(44, 68, 2, 2, c('gold'));
  t.set(44, 68, c('gold-light'));
  t.rect(31, 78, 18, 2, c('stone-light'));
  t.rect(31, 79, 18, 1, c('stone'));
  // Plaque above the door.
  t.rect(33, 46, 14, 7, c('bark-dark'));
  t.rect(34, 47, 12, 5, c('cream'));
  glyphs(t, text('</>'), 34 + Math.floor((12 - textWidth('</>')) / 2), 47, c('ink'));
  outline(t, c('ink'));
  return t;
}

/** One tier of a pine: a triangle, lit on the left, with a ragged lower edge. */
function pineTier(t: PixelCanvas, c: C, cx: number, top: number, bottom: number, halfWidth: number): void {
  for (let y = top; y <= bottom; y++) {
    const hw = ((y - top) / (bottom - top)) * halfWidth;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
      if (y === bottom && (x + top) % 3 === 0) continue;
      const lit = x < cx - hw * 0.35;
      const edge = y >= bottom - 1;
      t.set(x, y, lit ? (edge ? c('moss') : c('grass')) : edge ? c('ink') : (x > cx + hw * 0.45 ? c('moss-dark') : c('moss')));
    }
  }
}

/** 32 × 56 Baltic pine: three stacked tiers on a short red-brown trunk. */
export function pine(c: C): PixelCanvas {
  const t = new PixelCanvas(32, 56);
  t.rect(14, 44, 4, 12, c('bark'));
  t.rect(16, 44, 2, 12, c('bark-dark'));
  t.rect(13, 54, 6, 2, c('bark-dark'));
  pineTier(t, c, 15.5, 2, 20, 8);
  pineTier(t, c, 15.5, 12, 33, 11);
  pineTier(t, c, 15.5, 23, 46, 14);
  outline(t, c('ink'));
  return t;
}

/** 32 × 48 birch: white trunk with dark marks, a rounded light-green crown. */
export function birch(c: C): PixelCanvas {
  const t = new PixelCanvas(32, 48);
  t.rect(14, 22, 4, 26, c('paper'));
  t.rect(17, 22, 1, 26, c('stone-light'));
  for (const [x, y, w] of [[14, 27, 2], [16, 32, 2], [14, 37, 3], [15, 42, 2]] as const) t.rect(x, y, w, 1, c('ink'));
  t.rect(12, 24, 2, 1, c('paper')); // a little branch
  const blobs: Array<[number, number, number, number]> = [[16, 13, 13, 10], [9, 17, 7, 6], [23, 17, 7, 6], [16, 7, 9, 6], [11, 22, 5, 3], [21, 23, 5, 3]];
  for (const [cx, cy, rx, ry] of blobs) {
    for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1) continue;
      const d = (x - cx) / rx + (y - cy) / ry;
      t.set(x, y, d < -0.7 ? c('leaf-light') : d < 0.2 ? c('grass-light') : d < 0.9 ? c('grass') : c('moss'));
    }
  }
  // Leaf clusters break up the silhouette's smooth curve.
  for (const [x, y] of [[5, 13], [27, 12], [11, 3], [21, 4], [4, 20], [28, 21]] as const) t.rect(x, y, 2, 2, c('grass'));
  outline(t, c('ink'));
  return t;
}

/**
 * 64 × 48 welcome arch: the village's focal point at its entrance. Two posts on stone feet, a
 * beam with a little shingle roof, a hanging "WELCOME" board, lanterns on the beam ends and
 * flowers climbing the posts.
 */
export function arch(c: C): PixelCanvas {
  const t = new PixelCanvas(64, 48);
  for (const x of [7, 51]) {
    t.rect(x, 12, 6, 30, c('wood'));
    t.rect(x, 12, 1, 30, c('sand'));
    t.rect(x + 4, 12, 2, 30, c('bark'));
    t.rect(x - 1, 41, 8, 6, c('stone'));
    t.rect(x - 1, 41, 8, 1, c('stone-light'));
    t.rect(x - 1, 46, 8, 1, c('stone-dark'));
  }
  // Beam and its little roof.
  t.rect(1, 8, 62, 5, c('wood'));
  t.rect(1, 8, 62, 1, c('sand'));
  t.rect(1, 12, 62, 1, c('bark'));
  for (let y = 2; y <= 7; y++) span(t, 7 - y, 56 + y, y, (y - 2) % 3 === 2 ? c('plum') : y === 2 ? c('rose') : c('brick'));
  // Board on two chains.
  for (const x of [17, 46]) t.rect(x, 13, 1, 4, c('stone-dark'));
  t.rect(14, 17, 36, 11, c('bark-dark'));
  t.rect(15, 18, 34, 9, c('cream'));
  t.rect(15, 18, 34, 1, c('paper'));
  t.rect(15, 26, 34, 1, c('sand'));
  glyphs(t, text('WELCOME'), 15 + Math.floor((34 - textWidth('WELCOME')) / 2), 20, c('bark-dark'));
  // Lanterns hanging off the beam ends.
  for (const x of [1, 59]) {
    t.rect(x + 1, 13, 1, 2, c('stone-dark'));
    t.rect(x, 15, 4, 6, c('bark-dark'));
    t.rect(x + 1, 16, 2, 4, c('gold-light'));
    t.set(x + 1, 19, c('gold'));
  }
  // Climbing flowers on the posts.
  for (const [x, y] of [[6, 20], [8, 26], [6, 32], [12, 37], [50, 18], [56, 24], [52, 31], [56, 36]] as const) {
    t.rect(x, y, 2, 2, c('moss'));
    t.set(x, y, c('grass-light'));
  }
  for (const [x, y] of [[7, 23], [11, 34], [55, 21], [51, 34]] as const) t.set(x, y, c('rose'));
  outline(t, c('ink'));
  return t;
}

/** 32 × 32 notice board under a small roof, with pinned notes: where the "About me" lives. */
export function noticeBoard(c: C): PixelCanvas {
  const t = new PixelCanvas(32, 32);
  for (const x of [5, 25]) {
    t.rect(x, 20, 3, 11, c('bark'));
    t.rect(x + 2, 20, 1, 11, c('bark-dark'));
  }
  t.rect(2, 8, 28, 14, c('bark-dark'));
  t.rect(3, 9, 26, 12, c('wood'));
  t.rect(3, 9, 26, 1, c('sand'));
  for (let y = 2; y <= 7; y++) span(t, 7 - y, 24 + y, y, y === 2 ? c('rose') : y === 7 ? c('plum') : c('brick'));
  // Notes: paper with writing, a gold-pinned card, a red-pinned sketch.
  t.rect(5, 11, 8, 8, c('paper'));
  for (const y of [13, 15, 17]) t.rect(6, y, 6, 1, c('stone'));
  t.set(8, 11, c('brick'));
  t.rect(15, 10, 7, 6, c('cream'));
  for (const y of [12, 14]) t.rect(16, y, 5, 1, c('bark'));
  t.set(18, 10, c('gold'));
  t.rect(21, 14, 6, 6, c('paper'));
  t.rect(22, 16, 4, 3, c('sea-light'));
  t.set(23, 16, c('foam'));
  t.set(24, 14, c('brick'));
  outline(t, c('ink'));
  return t;
}

/** 16 × 32 lamp post, 4 frames: the flame flickers (frame 0 is also the still frame). */
export function lamp(c: C): PixelCanvas {
  const sheet = new PixelCanvas(64, 32);
  const flames: Array<Array<[number, number, string]>> = [
    [[7, 6, 'gold-light'], [8, 6, 'gold-light'], [7, 7, 'gold'], [8, 7, 'gold-light'], [7, 5, 'paper']],
    [[7, 6, 'gold-light'], [8, 6, 'gold'], [7, 7, 'gold'], [8, 7, 'gold-light'], [8, 5, 'gold-light']],
    [[7, 6, 'gold'], [8, 6, 'gold-light'], [7, 7, 'gold-light'], [8, 7, 'gold'], [7, 5, 'gold-light']],
    [[7, 6, 'gold-light'], [8, 6, 'gold-light'], [7, 7, 'gold-light'], [8, 7, 'gold'], [8, 5, 'paper']],
  ];
  flames.forEach((flame, f) => {
    const t = new PixelCanvas(16, 32);
    t.rect(7, 12, 2, 18, c('bark-dark'));
    t.rect(7, 12, 1, 18, c('bark'));
    t.rect(5, 29, 6, 3, c('stone'));
    t.rect(5, 29, 6, 1, c('stone-light'));
    t.rect(4, 2, 8, 2, c('bark-dark'));
    t.rect(5, 1, 6, 1, c('bark-dark'));
    t.rect(5, 4, 6, 6, c('gold'));
    t.rect(5, 4, 1, 6, c('bark-dark'));
    t.rect(10, 4, 1, 6, c('bark-dark'));
    t.rect(4, 10, 8, 2, c('bark-dark'));
    for (const [x, y, hex] of flame) t.set(x, y, c(hex));
    outline(t, c('ink'));
    sheet.blit(t, f * 16, 0);
  });
  return sheet;
}

/** 32 × 24 workshop clutter: two stacked crates and a barrel. */
export function crates(c: C): PixelCanvas {
  const t = new PixelCanvas(32, 24);
  const crate = (x: number, y: number, s: number) => {
    t.rect(x, y, s, s, c('wood'));
    t.rect(x, y, s, 1, c('sand'));
    t.rect(x, y + s - 1, s, 1, c('bark'));
    t.rect(x + s - 1, y, 1, s, c('bark'));
    for (let i = 1; i < s - 1; i++) {
      t.set(x + i, y + i, c('bark'));
      t.set(x + s - 1 - i, y + i, c('bark'));
    }
    t.rect(x, y, 1, s, c('bark-dark'));
    t.rect(x, y, s, 1, c('bark-dark'));
  };
  crate(2, 11, 12);
  crate(5, 1, 10);
  // Barrel: staves with two iron hoops, lit on the left.
  t.rect(18, 6, 11, 17, c('bark'));
  t.rect(19, 6, 2, 17, c('wood'));
  t.rect(26, 6, 3, 17, c('bark-dark'));
  for (const y of [9, 18]) t.rect(18, y, 11, 1, c('stone-dark'));
  t.rect(18, 5, 11, 2, c('wood'));
  t.rect(19, 5, 9, 1, c('sand'));
  outline(t, c('ink'));
  return t;
}
