// Placeholder interactive objects, UI pieces and effects.
import { PixelCanvas, drawGrid, shadedEllipse, type Grid } from '../draw.ts';

type C = (name: string) => string;

/** 16 × 16 wooden sign on a post; feet (post bottom) on the last row. */
export function sign(c: C): PixelCanvas {
  const t = new PixelCanvas(16, 16);
  t.rect(6, 9, 4, 7, c('ink'));
  t.rect(7, 9, 2, 6, c('bark'));
  t.rect(8, 9, 1, 6, c('bark-dark'));
  t.rect(1, 2, 14, 9, c('ink'));
  t.rect(2, 3, 12, 7, c('wood'));
  t.rect(2, 3, 12, 1, c('sand'));
  t.rect(2, 9, 12, 1, c('bark'));
  t.rect(13, 4, 1, 5, c('bark'));
  // "Writing": two short lines.
  t.rect(4, 5, 7, 1, c('bark-dark'));
  t.rect(4, 7, 5, 1, c('bark-dark'));
  return t;
}

const BOX: Grid = [
  '..oooooooooooooooooooo..',
  '.owwwwwwwwwwwwwwwwwwwwo.',
  'owwddddddddddddddddddwwo',
  'owdmmmmmmmmmmmmmmmmmmdwo',
  'owdmffffffffffffffffmdwo',
  'owdmffffffffffffffffmdwo',
  'owdmffffffffffffffffmdwo',
  'owdmffffffffffffffffmdwo',
];

/**
 * 24 × 24 nine-slice frame for dialogue and panels: 8 px corners, 8 px stretchable edges,
 * cream fill in the centre. Built from its top third, mirrored down.
 */
export function dialogueBox(c: C): PixelCanvas {
  const middle = Array.from({ length: 8 }, () => BOX[7]!);
  const grid = [...BOX, ...middle, ...[...BOX].reverse()];
  const t = new PixelCanvas(24, 24);
  drawGrid(t, grid, { o: { base: c('ink') }, w: { base: c('wood') }, d: { base: c('bark') }, m: { base: c('sand') }, f: { base: c('cream') } }, 0, 0, 'ui.dialogue-box');
  return t;
}

/** 9 × 9 speech bubble with "!" shown above whatever the player can talk to. */
export function interactPrompt(c: C): PixelCanvas {
  const grid: Grid = [
    '.ooooooo.',
    'oppp!pppo',
    'oppp!pppo',
    'oppp!pppo',
    'opppppppo',
    'oppp!pppo',
    'opppppppo',
    '.ooopooo.',
    '....o....',
  ];
  const t = new PixelCanvas(9, 9);
  drawGrid(t, grid, { o: { base: c('ink') }, p: { base: c('paper') }, '!': { base: c('brick') } }, 0, 0, 'ui.prompt');
  return t;
}

/** 12 × 5 ground shadow, drawn under characters at reduced alpha by the game. */
export function shadow(c: C): PixelCanvas {
  const t = new PixelCanvas(12, 5);
  shadedEllipse(t, 5.5, 2, 5.5, 2, { outline: c('ink'), base: c('ink'), shade: c('ink'), highlight: c('ink') });
  return t;
}
