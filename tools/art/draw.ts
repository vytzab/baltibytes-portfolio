// A tiny pixel canvas for drawing placeholder art in code. Every pixel is a palette hex or
// transparent; there is no anti-aliasing anywhere, on purpose.
import { hexToRgb, type RgbaImage } from './png.ts';

export class PixelCanvas implements RgbaImage {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  set(x: number, y: number, hex: string | null): void {
    if (!this.inside(x, y)) return;
    const i = (y * this.width + x) * 4;
    if (hex === null) {
      this.data.fill(0, i, i + 4);
      return;
    }
    const [r, g, b] = hexToRgb(hex);
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = 255;
  }

  isSet(x: number, y: number): boolean {
    return this.inside(x, y) && this.data[(y * this.width + x) * 4 + 3] !== 0;
  }

  rect(x: number, y: number, w: number, h: number, hex: string): void {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex);
  }

  /** Copies another canvas in; transparent pixels of the source are skipped. */
  blit(src: PixelCanvas, ox: number, oy: number): void {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const i = (y * src.width + x) * 4;
        if (src.data[i + 3] === 0) continue;
        const t = ((oy + y) * this.width + (ox + x)) * 4;
        if (this.inside(ox + x, oy + y)) this.data.set(src.data.subarray(i, i + 4), t);
      }
    }
  }
}

/**
 * A grid is an array of equal-length strings, one character per pixel; '.' is transparent and
 * every other character is looked up in the legend (character → palette hex).
 */
export type Grid = readonly string[];

export function checkGrid(grid: Grid, label: string): void {
  const width = grid[0]?.length ?? 0;
  grid.forEach((row, y) => {
    if (row.length !== width) throw new Error(`${label}: row ${y} is ${row.length} wide, expected ${width}`);
  });
}

export function mirrorGrid(grid: Grid): string[] {
  return grid.map((row) => [...row].reverse().join(''));
}

export interface LegendColor {
  base: string;
  /** Drawn instead of base where the pixel sits on the region's lower or right edge (light from top-left). */
  shade?: string;
}

export function drawGrid(
  canvas: PixelCanvas,
  grid: Grid,
  legend: Record<string, LegendColor>,
  ox: number,
  oy: number,
  label: string,
): void {
  checkGrid(grid, label);
  grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const color = legend[ch];
      if (!color) throw new Error(`${label}: no legend entry for "${ch}" at ${x},${y}`);
      // Shade pixels whose right or lower neighbour is the outline or empty: cheap form
      // shading with the light from the top-left.
      const right = row[x + 1] ?? '.';
      const below = grid[y + 1]?.[x] ?? '.';
      const rim = [right, below].some((c) => c === 'o' || c === '.');
      canvas.set(ox + x, oy + y, color.shade && rim ? color.shade : color.base);
    });
  });
}

/** Deterministic random numbers (mulberry32), so regenerated art is byte-identical. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fills an ellipse with an outline, a highlight towards the top-left and a shade towards the
 * bottom-right: the house style for round props (bushes, rocks, stumps).
 */
export function shadedEllipse(
  canvas: PixelCanvas,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  colors: { outline: string; base: string; shade: string; highlight: string },
): void {
  const inside = (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      let color = colors.base;
      if (edge) color = colors.outline;
      else if (dx + dy > 0.55) color = colors.shade;
      else if (dx + dy < -0.75) color = colors.highlight;
      canvas.set(x, y, color);
    }
  }
}
