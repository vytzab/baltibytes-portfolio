// Dungeon props, plus the cellar entrance that leads down from the village.
import { PixelCanvas, outline } from '../draw.ts';
import type { C } from '../placeholders/terrain.ts';

/** 16 × 24 wall torch, 4 frames: an iron sconce and a flickering flame (frame 0 is the still frame). */
export function torch(c: C): PixelCanvas {
  const sheet = new PixelCanvas(64, 24);
  const flames: Array<Array<[number, number, number, string]>> = [
    [[6, 4, 4, 'gold'], [7, 3, 2, 'gold-light'], [7, 2, 1, 'paper'], [6, 7, 4, 'brick']],
    [[6, 4, 4, 'gold'], [7, 2, 2, 'gold-light'], [8, 1, 1, 'gold-light'], [6, 7, 4, 'brick']],
    [[6, 3, 4, 'gold'], [6, 4, 3, 'gold-light'], [7, 2, 1, 'paper'], [6, 7, 4, 'brick']],
    [[6, 4, 4, 'gold'], [8, 3, 2, 'gold-light'], [8, 2, 1, 'paper'], [6, 7, 4, 'brick']],
  ];
  flames.forEach((flame, f) => {
    const t = new PixelCanvas(16, 24);
    // Flame body: rows 2..8, widest at the bottom.
    for (const [x, y, w, hex] of flame) for (let yy = y; yy < 9; yy++) t.rect(x, yy, w, 1, c(hex));
    t.rect(6, 6, 4, 2, c('gold'));
    // Cup and bracket.
    t.rect(5, 9, 6, 3, c('stone-dark'));
    t.rect(5, 9, 6, 1, c('stone'));
    t.rect(7, 12, 2, 6, c('stone-dark'));
    t.rect(5, 17, 6, 2, c('stone-dark'));
    t.rect(5, 17, 6, 1, c('stone'));
    outline(t, c('ink'));
    sheet.blit(t, f * 16, 0);
  });
  return sheet;
}

/**
 * 24 × 48 quest chest: row 0 closed, row 1 open (lid up, a glowing scroll inside). Each vault's
 * chest holds a project's case study; it stays open once a visitor has read it.
 */
export function chest(c: C): PixelCanvas {
  const sheet = new PixelCanvas(24, 48);
  const body = (t: PixelCanvas) => {
    t.rect(2, 12, 20, 11, c('wood'));
    t.rect(2, 12, 20, 1, c('sand'));
    t.rect(19, 12, 3, 11, c('bark'));
    for (const x of [5, 17]) t.rect(x, 12, 2, 11, c('gold'));
    t.rect(5, 12, 1, 11, c('gold-light'));
    t.rect(17, 12, 1, 11, c('gold-light'));
    t.rect(2, 21, 20, 2, c('bark'));
  };
  const closed = new PixelCanvas(24, 24);
  body(closed);
  // Domed lid.
  closed.rect(3, 5, 18, 7, c('wood'));
  closed.rect(4, 4, 16, 1, c('wood'));
  closed.rect(3, 5, 18, 1, c('sand'));
  closed.rect(18, 5, 3, 7, c('bark'));
  closed.rect(2, 11, 20, 1, c('bark-dark'));
  for (const x of [5, 17]) closed.rect(x, 4, 2, 8, c('gold'));
  // Lock.
  closed.rect(10, 10, 4, 5, c('gold'));
  closed.rect(10, 10, 4, 1, c('gold-light'));
  closed.set(11, 12, c('ink'));
  closed.set(11, 13, c('ink'));
  outline(closed, c('ink'));

  const open = new PixelCanvas(24, 24);
  // Lid tipped back: we see its underside above the box.
  open.rect(3, 2, 18, 6, c('bark'));
  open.rect(3, 2, 18, 1, c('wood'));
  for (const x of [5, 17]) open.rect(x, 2, 2, 6, c('gold'));
  body(open);
  // Inside: warm glow and a rolled scroll.
  open.rect(4, 8, 16, 4, c('gold-light'));
  open.rect(7, 9, 10, 3, c('paper'));
  open.rect(7, 9, 10, 1, c('cream'));
  open.rect(7, 9, 1, 3, c('sand'));
  open.rect(16, 9, 1, 3, c('sand'));
  open.rect(10, 10, 4, 1, c('brick'));
  outline(open, c('ink'));

  sheet.blit(closed, 0, 0);
  sheet.blit(open, 0, 24);
  return sheet;
}

/** 32 × 32 stairs up out of the dungeon, brightening towards the daylight at the bottom. */
export function stairsUp(c: C): PixelCanvas {
  const t = new PixelCanvas(32, 32);
  const steps = ['stone-dark', 'stone', 'stone-light', 'cream', 'paper'];
  steps.forEach((hex, i) => {
    const y = 4 + i * 5;
    t.rect(4, y, 24, 5, c(hex));
    t.rect(4, y, 24, 1, c(i === 0 ? 'stone' : steps[Math.max(0, i - 1)]!));
    t.rect(4, y + 4, 24, 1, c('ink'));
  });
  // Side walls of the stairwell.
  for (const x of [0, 28]) {
    t.rect(x, 0, 4, 32, c('stone'));
    t.rect(x, 0, 4, 1, c('stone-light'));
    t.rect(x === 0 ? 3 : 28, 0, 1, 32, c('stone-dark'));
  }
  t.rect(0, 0, 32, 4, c('plum'));
  t.rect(0, 0, 32, 1, c('ink'));
  return t;
}

/**
 * 48 × 48 cellar entrance in the village: a stone arch half sunk into the hillside, dark steps
 * going down, moss and a small lantern. Characters walk in between the pillars.
 */
export function cellar(c: C): PixelCanvas {
  const t = new PixelCanvas(48, 48);
  // Grassy mound behind the arch.
  for (let y = 4; y < 34; y++) {
    const half = Math.min(23, 8 + y);
    t.rect(24 - half, y, half * 2, 1, y < 8 ? c('grass-light') : c('grass'));
  }
  for (const [x, y] of [[10, 12], [30, 9], [38, 18], [6, 22]] as const) t.rect(x, y, 3, 2, c('moss'));
  // Dark opening with steps going down.
  t.rect(14, 18, 20, 30, c('ink'));
  for (let i = 0; i < 4; i++) t.rect(15, 40 - i * 5, 18, 2, i === 0 ? c('stone') : c('plum'));
  // Pillars and an arched lintel.
  for (const x of [8, 34]) {
    t.rect(x, 22, 6, 26, c('stone'));
    t.rect(x, 22, 2, 26, c('stone-light'));
    t.rect(x + 5, 22, 1, 26, c('stone-dark'));
    for (const y of [28, 35, 42]) t.rect(x, y, 6, 1, c('stone-dark'));
  }
  for (let x = 8; x < 40; x++) {
    const dy = Math.round(Math.abs(x - 23.5) / 3);
    t.rect(x, 14 + dy, 1, 6, c('stone'));
    t.set(x, 14 + dy, c('stone-light'));
    t.set(x, 19 + dy, c('stone-dark'));
  }
  // Keystone and a small lantern on the left pillar.
  t.rect(22, 12, 4, 6, c('stone-light'));
  t.rect(4, 26, 4, 5, c('bark-dark'));
  t.rect(5, 27, 2, 3, c('gold-light'));
  outline(t, c('ink'));
  return t;
}
