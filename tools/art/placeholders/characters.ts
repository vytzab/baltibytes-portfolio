// Placeholder characters: one 16 × 20 body template, recoloured per character and placed
// bottom-centre in 16 × 24 frames (4 px of headroom for hats and hair).
// Legend: o outline, h hair, s skin, e eye, k blush, c shirt, B belt, p trousers, b boots.
import { PixelCanvas, drawGrid, mirrorGrid, type Grid, type LegendColor } from '../draw.ts';

export const FRAME = { width: 16, height: 24 } as const;
export const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
type Direction = (typeof DIRECTIONS)[number];

const HEAD_DOWN: Grid = [
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohssssssho...',
  '...osesssseso...',
  '...osssssssso...',
  '....osksskso....',
  '.....oossoo.....',
];

// Eyes closed: the eye row becomes skin.
const HEAD_DOWN_BLINK: Grid = HEAD_DOWN.map((row, y) => (y === 5 ? '...osssssssso...' : row));

const HEAD_UP: Grid = [
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...oshhhhhhso...',
  '....ohhhhhho....',
  '.....oossoo.....',
];

const BODY_FRONT: Grid = [
  '...occcssccco...',
  '..occcccccccco..',
  '..occcccccccco..',
  '..occcccccccco..',
  '..osccBBBBccso..',
  '...oppppppppo...',
  '...oppppppppo...',
];

const LEGS_FRONT: Grid = ['...opppoopppo...', '...opppoopppo...', '...obbboobbbo...', '...oooooooooo...'];
// Left foot lifted; the right-foot frame is its mirror image.
const LEGS_FRONT_STEP: Grid = ['...opppoopppo...', '...obbboopppo...', '...oooooobbbo...', '........ooooo...'];

const HEAD_LEFT: Grid = [
  '......ooooo.....',
  '.....ohhhhho....',
  '....ohhhhhhho...',
  '....ohhhhhhho...',
  '....ossshhhho...',
  '....oessshhho...',
  '...osssssshho...',
  '....oksssssho...',
  '.....ooossoo....',
];

const HEAD_LEFT_BLINK: Grid = HEAD_LEFT.map((row, y) => (y === 5 ? '....osssshhho...' : row));

const BODY_LEFT: Grid = [
  '.....occcccco...',
  '.....occcccco...',
  '.....occcccco...',
  '.....occcscco...',
  '.....oBBBBBBo...',
  '.....oppppppo...',
  '.....oppppppo...',
];

const LEGS_LEFT: Grid = ['.....oppppppo...', '.....oppppppo...', '....obbbbbbo....', '....oooooooo....'];
const LEGS_LEFT_STRIDE: Grid = ['....oppo.oppo...', '...oppo...oppo..', '..obbbo...obbo..', '..ooooo...oooo..'];

export interface CharacterColors {
  hair: LegendColor;
  skin: LegendColor;
  shirt: LegendColor;
  belt: LegendColor;
  trousers: LegendColor;
  boots: LegendColor;
  outline: string;
  blush: string;
}

function legendFor(c: CharacterColors): Record<string, LegendColor> {
  return {
    o: { base: c.outline },
    e: { base: c.outline },
    k: { base: c.blush },
    h: c.hair,
    s: c.skin,
    c: c.shirt,
    B: c.belt,
    p: c.trousers,
    b: c.boots,
  };
}

/** The 20-row figure for one direction and pose. */
function figure(direction: Direction, pose: 'stand' | 'blink' | 'step-a' | 'step-b'): Grid {
  if (direction === 'right') return mirrorGrid(figure('left', pose));
  if (direction === 'left') {
    const head = pose === 'blink' ? HEAD_LEFT_BLINK : HEAD_LEFT;
    const legs = pose === 'step-a' || pose === 'step-b' ? LEGS_LEFT_STRIDE : LEGS_LEFT;
    return [...head, ...BODY_LEFT, ...legs];
  }
  const head = direction === 'up' ? HEAD_UP : pose === 'blink' ? HEAD_DOWN_BLINK : HEAD_DOWN;
  const legs = pose === 'step-a' ? LEGS_FRONT_STEP : pose === 'step-b' ? mirrorGrid(LEGS_FRONT_STEP) : LEGS_FRONT;
  return [...head, ...BODY_FRONT, ...legs];
}

function drawFrame(sheet: PixelCanvas, col: number, row: number, grid: Grid, legend: Record<string, LegendColor>, label: string) {
  const ox = col * FRAME.width + Math.floor((FRAME.width - grid[0]!.length) / 2);
  const oy = row * FRAME.height + (FRAME.height - grid.length); // feet on the frame's bottom row
  drawGrid(sheet, grid, legend, ox, oy, label);
}

const IDLE_POSES = ['stand', 'stand', 'stand', 'blink'] as const;
const WALK_POSES = ['stand', 'step-a', 'stand', 'step-b'] as const;

/**
 * Sheet layout (ART_BIBLE §Sprite sheets): one animation per row, 4 columns.
 * Rows: idle-down, idle-left, idle-right, idle-up, then (if walk) walk-down … walk-up.
 */
export function characterSheet(colors: CharacterColors, withWalk: boolean, label: string): PixelCanvas {
  const rows = withWalk ? 8 : 4;
  const sheet = new PixelCanvas(FRAME.width * 4, FRAME.height * rows);
  const legend = legendFor(colors);
  DIRECTIONS.forEach((dir, d) => {
    IDLE_POSES.forEach((pose, f) => drawFrame(sheet, f, d, figure(dir, pose), legend, `${label} idle-${dir}`));
    if (withWalk) WALK_POSES.forEach((pose, f) => drawFrame(sheet, f, 4 + d, figure(dir, pose), legend, `${label} walk-${dir}`));
  });
  return sheet;
}
