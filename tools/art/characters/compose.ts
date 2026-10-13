// Builds a character sprite sheet from hand-placed pixel parts. Every pixel of every part is
// placed by hand in the grids (player.ts, guide.ts); this file only stacks the parts into
// frames, so all 32 frames share one anatomy and a fix to a part fixes every frame using it.
//
// Frame: 24 × 32, feet on the bottom row, body centred on the line between columns 11 and 12.
// Stacking, bottom to top: legs → head → body (the collar sits over the neck) → near arm.
// Right-facing frames are the left-facing ones mirrored.
import { PixelCanvas, checkGrid, drawGrid, type Grid, type LegendColor } from '../draw.ts';

export const FRAME = { width: 24, height: 32 } as const;
export const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** Three poses for anything that swings: at rest, and the two opposite extremes of a step. */
export interface Swing {
  rest: Grid;
  a: Grid;
  b: Grid;
}

export interface DirectionArt {
  head: Grid;
  /** Same as head with the eyes closed; defaults to head (e.g. seen from behind). */
  headBlink?: Grid;
  body: Swing;
  /** The arm nearest the viewer in side view, drawn over the body; x/y relative to the body grid. */
  arm?: Swing & { x: number; y: number };
  /** stand, contact with leg A forward, contact with leg B forward, passing (defaults to stand). */
  legs: { stand: Grid; a: Grid; b: Grid; pass?: Grid };
  /** Bottom rows of the body grids that hang over the legs (e.g. a swinging hand). */
  bodyOverlap: number;
}

export interface CharacterArt {
  id: string;
  /** Grid letter → palette colour name. */
  legend: Record<string, string>;
  down: DirectionArt;
  up: DirectionArt;
  left: DirectionArt;
}

interface Pose {
  legs: 'stand' | 'a' | 'b' | 'pass';
  swing: 'rest' | 'a' | 'b';
  /** Upper body lowered by this many pixels: knees bend on contact frames and on the idle breath. */
  dip: number;
  blink?: boolean;
}

/**
 * Idle (3 fps): still, still, a 1 px breath, a blink. Walk (8 fps): contact A, passing,
 * contact B, passing; the upper body dips on contact so the step has weight, and arms (or a
 * scarf, or a coat hem) swing against the legs.
 */
const IDLE: Pose[] = [
  { legs: 'stand', swing: 'rest', dip: 0 },
  { legs: 'stand', swing: 'rest', dip: 0 },
  { legs: 'stand', swing: 'rest', dip: 1 },
  { legs: 'stand', swing: 'rest', dip: 0, blink: true },
];
const WALK: Pose[] = [
  { legs: 'a', swing: 'a', dip: 1 },
  { legs: 'pass', swing: 'rest', dip: 0 },
  { legs: 'b', swing: 'b', dip: 1 },
  { legs: 'pass', swing: 'rest', dip: 0 },
];

/** Sheet rows, in the art bible's order (ART_BIBLE §7). */
export const ROWS = [
  ...DIRECTIONS.map((d) => ({ name: `idle-${d}`, direction: d, poses: IDLE })),
  ...DIRECTIONS.map((d) => ({ name: `walk-${d}`, direction: d, poses: WALK })),
] as const;

function checkDirection(art: DirectionArt, label: string): void {
  const all: Array<[string, Grid]> = [
    ['head', art.head],
    ['headBlink', art.headBlink ?? art.head],
    ...(['rest', 'a', 'b'] as const).map((k): [string, Grid] => [`body.${k}`, art.body[k]]),
    ...(['stand', 'a', 'b'] as const).map((k): [string, Grid] => [`legs.${k}`, art.legs[k]]),
    ...(art.arm ? (['rest', 'a', 'b'] as const).map((k): [string, Grid] => [`arm.${k}`, art.arm![k]]) : []),
  ];
  for (const [name, grid] of all) checkGrid(grid, `${label} ${name}`);
  // Swapping a pose must never change a part's footprint, or frames would jump.
  const same = (a: Grid, b: Grid, what: string) => {
    if (a.length !== b.length || a[0]!.length !== b[0]!.length) throw new Error(`${label}: ${what} poses differ in size`);
  };
  same(art.head, art.headBlink ?? art.head, 'head');
  same(art.body.rest, art.body.a, 'body');
  same(art.body.rest, art.body.b, 'body');
  same(art.legs.stand, art.legs.a, 'legs');
  same(art.legs.stand, art.legs.b, 'legs');
  if (art.legs.pass) same(art.legs.stand, art.legs.pass, 'legs');
}

const centred = (grid: Grid) => Math.floor((FRAME.width - grid[0]!.length) / 2);

function drawFrame(sheet: PixelCanvas, col: number, row: number, art: DirectionArt, pose: Pose, legend: Record<string, LegendColor>, label: string, mirror: boolean): void {
  const frame = new PixelCanvas(FRAME.width, FRAME.height);
  const legs = art.legs[pose.legs] ?? art.legs.stand;
  const body = art.body[pose.swing];
  const head = pose.blink && art.headBlink ? art.headBlink : art.head;

  const legsY = FRAME.height - legs.length;
  const bodyY = legsY - (body.length - art.bodyOverlap) + pose.dip;
  // The head's bottom row (chin and neck) tucks under the collar.
  const headY = bodyY - head.length + 1;
  if (headY < 0) throw new Error(`${label}: figure is taller than the ${FRAME.height} px frame`);

  drawGrid(frame, legs, legend, centred(legs), legsY, `${label} legs`);
  drawGrid(frame, head, legend, centred(head), headY, `${label} head`);
  drawGrid(frame, body, legend, centred(body), bodyY, `${label} body`);
  if (art.arm) drawGrid(frame, art.arm[pose.swing], legend, centred(body) + art.arm.x, bodyY + art.arm.y, `${label} arm`);

  const ox = col * FRAME.width;
  const oy = row * FRAME.height;
  for (let y = 0; y < FRAME.height; y++) {
    for (let x = 0; x < FRAME.width; x++) {
      const sx = mirror ? FRAME.width - 1 - x : x;
      const i = (y * FRAME.width + sx) * 4;
      if (frame.data[i + 3] === 0) continue;
      sheet.data.set(frame.data.subarray(i, i + 4), ((oy + y) * sheet.width + ox + x) * 4);
    }
  }
}

/** 4 columns × 8 rows of 24 × 32 frames: 96 × 256 px. */
export function characterSheet(art: CharacterArt, color: (name: string) => string): PixelCanvas {
  const legend: Record<string, LegendColor> = Object.fromEntries(Object.entries(art.legend).map(([ch, name]) => [ch, { base: color(name) }]));
  (['down', 'up', 'left'] as const).forEach((d) => checkDirection(art[d], `${art.id} ${d}`));
  const sheet = new PixelCanvas(FRAME.width * 4, FRAME.height * ROWS.length);
  ROWS.forEach((rowSpec, row) => {
    const mirror = rowSpec.direction === 'right';
    const dirArt = art[rowSpec.direction === 'right' ? 'left' : rowSpec.direction];
    rowSpec.poses.forEach((pose, col) => drawFrame(sheet, col, row, dirArt, pose, legend, `${art.id} ${rowSpec.name}[${col}]`, mirror));
  });
  return sheet;
}
