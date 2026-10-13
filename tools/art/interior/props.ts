// Props for the Skill Tower and the Guild Hall.
import { PixelCanvas, outline } from '../draw.ts';
import type { C } from '../placeholders/terrain.ts';

const SPINES = ['brick', 'denim', 'moss', 'gold', 'heather', 'sea', 'rose', 'bark'];

/** 32 × 32 bookshelf: three shelves of mixed spines, a few leaning, one gap with a candle. */
export function bookshelf(c: C, seed = 0): PixelCanvas {
  const t = new PixelCanvas(32, 32);
  t.rect(1, 1, 30, 31, c('bark'));
  t.rect(1, 1, 30, 2, c('wood'));
  t.rect(29, 1, 2, 31, c('bark-dark'));
  for (const y of [4, 13, 22]) {
    t.rect(3, y, 26, 8, c('plum'));
    let x = 3;
    let k = seed + y;
    while (x < 27) {
      const w = 2 + (k % 2);
      const h = 6 + (k % 3 === 0 ? 0 : 1);
      if (k % 7 === 3) {
        x += 3; // a gap
      } else {
        const hex = c(SPINES[k % SPINES.length]!);
        t.rect(x, y + 8 - h, w, h, hex);
        t.rect(x, y + 8 - h, 1, h, c('paper'));
        t.set(x + w - 1, y + 8 - h + 1, c('ink'));
        x += w;
      }
      k += 5;
    }
    t.rect(1, y + 8, 30, 1, c('wood'));
  }
  outline(t, c('ink'));
  return t;
}

/**
 * 16 × 24 lectern with an open tome, 4 frames: gold motes rise off the page and fade (frame 0 is
 * also the still frame). Each holds one skill category.
 */
export function lectern(c: C): PixelCanvas {
  const sheet = new PixelCanvas(64, 24);
  const motes: Array<Array<[number, number, string]>> = [
    [[6, 3, 'gold-light'], [10, 6, 'gold']],
    [[7, 2, 'gold'], [9, 4, 'gold-light'], [5, 6, 'gold']],
    [[8, 1, 'gold-light'], [5, 4, 'gold-light'], [11, 5, 'gold']],
    [[6, 2, 'gold'], [10, 3, 'gold-light'], [8, 5, 'paper']],
  ];
  motes.forEach((list, f) => {
    const t = new PixelCanvas(16, 24);
    // Stand and base.
    t.rect(6, 13, 4, 8, c('bark'));
    t.rect(8, 13, 2, 8, c('bark-dark'));
    t.rect(3, 20, 10, 3, c('wood'));
    t.rect(3, 22, 10, 1, c('bark'));
    // Slanted top and the open book.
    t.rect(2, 10, 12, 3, c('wood'));
    t.rect(2, 12, 12, 1, c('bark'));
    t.rect(3, 8, 5, 3, c('paper'));
    t.rect(8, 8, 5, 3, c('cream'));
    t.rect(7, 8, 1, 3, c('sand'));
    for (const y of [9, 10]) {
      t.rect(4, y, 3, 1, c('stone'));
      t.rect(9, y, 3, 1, c('stone'));
    }
    outline(t, c('ink'));
    // Motes float free of the outline.
    for (const [x, y, hex] of list) t.set(x, y, c(hex));
    sheet.blit(t, f * 16, 0);
  });
  return sheet;
}

/** 48 × 48 stone hearth set into a wall, 4 frames of fire (frame 0 is also the still frame). */
export function hearth(c: C): PixelCanvas {
  const sheet = new PixelCanvas(192, 48);
  const flames = [
    [[18, 30, 12, 'brick'], [20, 26, 8, 'gold'], [22, 23, 4, 'gold-light'], [23, 21, 2, 'paper']],
    [[17, 31, 13, 'brick'], [19, 27, 9, 'gold'], [21, 24, 5, 'gold-light'], [24, 22, 2, 'paper']],
    [[18, 30, 12, 'brick'], [21, 25, 7, 'gold'], [22, 22, 4, 'gold-light'], [22, 20, 2, 'paper']],
    [[19, 31, 11, 'brick'], [20, 27, 8, 'gold'], [23, 24, 4, 'gold-light'], [23, 22, 2, 'paper']],
  ] as const;
  flames.forEach((layers, f) => {
    const t = new PixelCanvas(48, 48);
    // Chimney breast and mantel.
    t.rect(4, 0, 40, 46, c('stone'));
    t.rect(4, 0, 3, 46, c('stone-light'));
    t.rect(41, 0, 3, 46, c('stone-dark'));
    for (let y = 3; y < 44; y += 6) t.rect(4, y, 40, 1, c('stone-dark'));
    t.rect(2, 14, 44, 4, c('bark'));
    t.rect(2, 14, 44, 1, c('wood'));
    t.rect(2, 17, 44, 1, c('bark-dark'));
    // Firebox.
    t.rect(12, 20, 24, 24, c('ink'));
    t.rect(13, 21, 22, 22, c('plum'));
    for (const [x, y, w, hex] of layers) {
      for (let yy = y; yy < 40; yy++) {
        const shrink = Math.max(0, Math.floor((y + 6 - yy) / 2));
        t.rect(x + shrink, yy, Math.max(1, w - shrink * 2), 1, c(hex));
      }
    }
    // Logs and hearthstone.
    t.rect(15, 39, 18, 3, c('bark-dark'));
    t.rect(15, 39, 18, 1, c('bark'));
    t.rect(0, 44, 48, 4, c('stone-light'));
    t.rect(0, 47, 48, 1, c('stone'));
    // Something on the mantel: two candles and a small trophy.
    t.rect(8, 10, 2, 4, c('cream'));
    t.set(8, 9, c('gold-light'));
    t.rect(38, 10, 2, 4, c('cream'));
    t.set(39, 9, c('gold-light'));
    t.rect(22, 9, 4, 3, c('gold'));
    t.rect(23, 12, 2, 2, c('gold'));
    outline(t, c('ink'));
    sheet.blit(t, f * 48, 0);
  });
  return sheet;
}

/** 48 × 24 long guild table with mugs and a plate. */
export function table(c: C): PixelCanvas {
  const t = new PixelCanvas(48, 24);
  t.rect(1, 6, 46, 10, c('wood'));
  t.rect(1, 6, 46, 1, c('sand'));
  t.rect(1, 15, 46, 2, c('bark'));
  for (const x of [3, 42]) t.rect(x, 17, 3, 6, c('bark-dark'));
  for (let x = 7; x < 44; x += 9) t.rect(x, 7, 1, 8, c('bark'));
  // Mugs and a plate of bread.
  for (const x of [6, 33]) {
    t.rect(x, 2, 5, 7, c('gold'));
    t.rect(x, 2, 5, 1, c('cream'));
    t.rect(x + 5, 4, 1, 3, c('gold'));
  }
  t.rect(18, 7, 10, 4, c('paper'));
  t.rect(20, 6, 6, 3, c('sand'));
  t.rect(20, 6, 6, 1, c('cream'));
  outline(t, c('ink'));
  return t;
}

/** 16 × 24 wall plaque for one role: a framed board with a gold emblem, hung on a wall face. */
export function plaque(c: C): PixelCanvas {
  const t = new PixelCanvas(16, 24);
  t.rect(2, 4, 12, 12, c('gold'));
  t.rect(3, 5, 10, 10, c('bark'));
  t.rect(3, 5, 10, 1, c('wood'));
  t.set(2, 4, c('gold-light'));
  // Emblem: a small shield.
  t.rect(6, 7, 4, 4, c('cream'));
  t.rect(7, 11, 2, 1, c('cream'));
  t.rect(7, 8, 2, 2, c('brick'));
  // Hanging cord.
  t.set(7, 2, c('stone-dark'));
  t.set(8, 2, c('stone-dark'));
  t.set(6, 3, c('stone-dark'));
  t.set(9, 3, c('stone-dark'));
  outline(t, c('ink'));
  return t;
}

/**
 * 48 × 56 Exit Portal, 4 frames: a ring of stones with gold runes on a stepped dais, a swirl of
 * heather and sea light turning inside (frame 0 is also the still frame). The art bible's one
 * place for a glow, done with hard pixels so it still reads as pixel art.
 */
export function portal(c: C): PixelCanvas {
  const sheet = new PixelCanvas(192, 56);
  const cx = 23.5;
  const cy = 24.5;
  for (let f = 0; f < 4; f++) {
    const t = new PixelCanvas(48, 56);
    // Dais: two steps.
    t.rect(4, 46, 40, 6, c('stone'));
    t.rect(4, 46, 40, 1, c('stone-light'));
    t.rect(8, 51, 32, 4, c('stone-dark'));
    t.rect(8, 51, 32, 1, c('stone'));
    for (let y = 0; y < 47; y++) {
      for (let x = 0; x < 48; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.hypot(dx, dy);
        if (r <= 15) {
          // The swirl: bands that turn with the angle and drift a quarter turn per frame.
          const a = Math.atan2(dy, dx);
          const band = Math.floor(((a + r * 0.32 + (f * Math.PI) / 2) / (Math.PI / 3)) % 3 + 3) % 3;
          const hex = r < 3 ? 'paper' : r < 6 ? (band === 0 ? 'foam' : 'sea-light') : band === 0 ? 'heather' : band === 1 ? 'sea-light' : 'plum';
          t.set(x, y, c(hex));
        } else if (r <= 20) {
          // Ring stones: lit towards the top-left, a joint every 30°.
          const a = Math.atan2(dy, dx);
          const joint = Math.abs(((a / (Math.PI / 6)) % 1) - 0.5) > 0.44;
          const lit = dx + dy < -6;
          t.set(x, y, joint ? c('stone-dark') : lit ? c('stone-light') : dx + dy > 8 ? c('stone-dark') : c('stone'));
        }
      }
    }
    // Runes on the ring glow in turn.
    const runes: Array<[number, number]> = [[23, 6], [41, 24], [23, 43], [6, 24], [11, 11], [36, 11]];
    runes.forEach(([x, y], i) => t.set(x, y, c(i % 4 === f ? 'paper' : 'gold-light')));
    outline(t, c('ink'));
    sheet.blit(t, f * 48, 0);
  }
  return sheet;
}
