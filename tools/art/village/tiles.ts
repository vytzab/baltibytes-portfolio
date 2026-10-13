// Village tileset: 16 × 16 tiles that extend the terrain tileset (tiles.terrain) without
// changing it. Mostly the transitions the terrain set lacks: ragged grass edges on paths and
// ponds (so paths stop looking like pasted rectangles), plus paving, a calmer pond water, a
// vertical fence and small plants. Edge tiles reuse the terrain set's own path texture.
import { PixelCanvas, seededRandom } from '../draw.ts';
import { path as pathTexture, type C } from '../placeholders/terrain.ts';

export const TILE = 16;
export const COLUMNS = 8;

/** Which sides of a tile are grass: N, S, W, E edges, outer corners, inner corners (i…). */
export const EDGES = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se', 'inw', 'ine', 'isw', 'ise'] as const;
export type Edge = (typeof EDGES)[number];

export const VILLAGE_TILES = [
  ...EDGES.map((e) => ({ name: `path-${e}`, collides: false })),
  { name: 'pond', collides: true },
  ...EDGES.map((e) => ({ name: `pond-${e}`, collides: true })),
  { name: 'cobble', collides: false },
  { name: 'clover', collides: false },
  { name: 'tulips', collides: false },
  { name: 'daisies', collides: false },
  { name: 'tall-grass', collides: false },
  { name: 'pebbles', collides: false },
  { name: 'fence-v', collides: true },
  { name: 'reeds', collides: true },
  { name: 'lilies', collides: true },
  { name: 'mushrooms', collides: false },
] as const;
export type VillageTileName = (typeof VILLAGE_TILES)[number]['name'];

// Depth of the grass fringe along an edge, per pixel. Starts and ends at 3 so neighbouring
// edge tiles join up, wobbles in between so the edge looks trodden rather than ruled.
const FRINGE = [3, 3, 4, 4, 3, 3, 2, 2, 3, 4, 4, 3, 3, 2, 3, 3];
const FRINGE_B = [3, 3, 2, 3, 3, 4, 4, 3, 3, 2, 2, 3, 4, 4, 3, 3];

/** True where an edge tile shows grass instead of its own surface. */
function grassMask(edge: Edge, x: number, y: number): boolean {
  const n = y < FRINGE[x]!;
  const s = y > 15 - FRINGE_B[x]!;
  const w = x < FRINGE_B[y]!;
  const e = x > 15 - FRINGE[y]!;
  // Outer corners: the surface's corner is rounded off with a radius-4 curve.
  const round = (cx: number, cy: number, dx: number, dy: number) => dx * (x - cx) > 0 && dy * (y - cy) > 0 && (x - cx) ** 2 + (y - cy) ** 2 > 16;
  switch (edge) {
    case 'n': return n;
    case 's': return s;
    case 'w': return w;
    case 'e': return e;
    case 'nw': return n || w || round(7, 7, -1, -1);
    case 'ne': return n || e || round(8, 7, 1, -1);
    case 'sw': return s || w || round(7, 8, -1, 1);
    case 'se': return s || e || round(8, 8, 1, 1);
    // Inner corners: only the small nub where two neighbouring fringes meet.
    case 'inw': return n && w;
    case 'ine': return n && e;
    case 'isw': return s && w;
    case 'ise': return s && e;
  }
}

/** Calm pond water: no bands, a few ripples and glints, tiles seamlessly. */
function pond(t: PixelCanvas, c: C, seed = 5): void {
  t.rect(0, 0, TILE, TILE, c('sea'));
  const rnd = seededRandom(seed);
  for (let i = 0; i < 3; i++) {
    const x = 1 + Math.floor(rnd() * 11);
    const y = 2 + Math.floor(rnd() * 12);
    t.rect(x, y, 3, 1, c('sea-light'));
  }
  t.set(2 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 13), c('foam'));
  // A darker patch towards the bottom-right suggests depth without striping the tiles.
  t.rect(9, 10, 3, 1, c('sea-deep'));
  t.rect(4, 13, 2, 1, c('sea-deep'));
}

/**
 * An edge tile: the surface painted first, grass laid over the mask, then a rim where they
 * meet. Paths get a dark trodden rim; ponds get a sandy bank and a line of foam.
 */
function edgeTile(t: PixelCanvas, c: C, edge: Edge, surface: 'path' | 'pond'): void {
  if (surface === 'path') pathTexture(t, c);
  else pond(t, c);
  const grass = (x: number, y: number) => x >= 0 && y >= 0 && x < TILE && y < TILE && grassMask(edge, x, y);
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) if (grass(x, y)) t.set(x, y, c('grass'));
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      if (grass(x, y)) continue;
      const touches = grass(x - 1, y) || grass(x + 1, y) || grass(x, y - 1) || grass(x, y + 1);
      if (!touches) continue;
      if (surface === 'path') t.set(x, y, c('wood'));
      else t.set(x, y, c('foam'));
    }
  }
  if (surface === 'pond') {
    // Sandy bank on the grass side of the waterline.
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        if (!grass(x, y)) continue;
        const nearWater = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => {
          const nx = x + dx!;
          const ny = y + dy!;
          return nx >= 0 && ny >= 0 && nx < TILE && ny < TILE && !grass(nx, ny);
        });
        if (nearWater) t.set(x, y, c('sand'));
      }
    }
  }
}

/** Square-ish paving stones in staggered rows; tiles seamlessly in both directions. */
function cobble(t: PixelCanvas, c: C): void {
  t.rect(0, 0, TILE, TILE, c('stone'));
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    const offset = row % 2 === 0 ? 0 : 4;
    for (let k = -1; k < 3; k++) {
      const x = k * 8 + offset;
      // Stone face 7 × 3 inside a 1 px mortar line, lit top-left.
      for (let yy = y; yy < y + 3; yy++) for (let xx = x; xx < x + 7; xx++) {
        if (xx < 0 || xx >= TILE) continue;
        const lit = yy === y || xx === x;
        const dark = yy === y + 2 || xx === x + 6;
        t.set(xx, yy, lit ? c('cream') : dark ? c('stone') : c('stone-light'));
      }
    }
    t.rect(0, y + 3, TILE, 1, c('stone-dark'));
  }
}

function clover(t: PixelCanvas, c: C): void {
  t.rect(0, 0, TILE, TILE, c('grass'));
  for (const [x, y] of [[3, 4], [10, 9], [5, 12]] as const) {
    t.set(x, y, c('grass-light'));
    t.set(x + 1, y, c('grass-light'));
    t.set(x, y + 1, c('grass-light'));
    t.set(x + 1, y + 1, c('moss'));
  }
  t.set(12, 3, c('leaf-light'));
}

/** Decoration tiles below are drawn on a transparent background (decor layer). */
function tulips(t: PixelCanvas, c: C): void {
  for (const [x, y] of [[3, 5], [7, 3], [11, 6], [5, 10], [10, 11]] as const) {
    t.rect(x, y + 2, 1, 3, c('moss'));
    t.set(x - 1, y + 3, c('grass-light'));
    t.rect(x - 1, y, 3, 2, c('brick'));
    t.set(x - 1, y, c('rose'));
    t.set(x, y - 1, c('brick'));
  }
}

function daisies(t: PixelCanvas, c: C): void {
  const spots: Array<[number, number, string]> = [[3, 4, 'paper'], [9, 3, 'gold-light'], [12, 8, 'paper'], [5, 10, 'paper'], [10, 12, 'gold-light']];
  for (const [x, y, petal] of spots) {
    t.set(x, y + 2, c('moss'));
    t.set(x - 1, y, c(petal));
    t.set(x + 1, y, c(petal));
    t.set(x, y - 1, c(petal));
    t.set(x, y + 1, c(petal));
    t.set(x, y, c('gold'));
  }
}

function tallGrass(t: PixelCanvas, c: C): void {
  for (const [x, h] of [[3, 6], [5, 8], [7, 5], [10, 7], [12, 9]] as const) {
    for (let i = 0; i < h; i++) t.set(x + (i > h - 3 ? (x % 2 ? 1 : -1) : 0), 14 - i, i < 2 ? c('moss-dark') : i < h - 2 ? c('moss') : c('grass-light'));
  }
}

function pebbles(t: PixelCanvas, c: C): void {
  for (const [x, y, w] of [[3, 5, 3], [10, 4, 2], [7, 10, 3], [12, 12, 2]] as const) {
    t.rect(x, y, w, 2, c('stone-light'));
    t.set(x, y, c('cream'));
    t.rect(x, y + 2, w, 1, c('stone-dark'));
  }
}

/** A fence running north–south: posts at the top and middle, two rails between. */
function fenceV(t: PixelCanvas, c: C): void {
  t.rect(6, 0, 4, 16, c('ink'));
  t.rect(7, 0, 2, 16, c('wood'));
  t.rect(8, 0, 1, 16, c('bark'));
  for (const y of [1, 9]) {
    t.rect(5, y, 6, 6, c('ink'));
    t.rect(6, y + 1, 4, 4, c('wood'));
    t.rect(6, y + 1, 4, 1, c('sand'));
    t.rect(9, y + 1, 1, 4, c('bark'));
  }
}

function reeds(t: PixelCanvas, c: C): void {
  pond(t, c, 9);
  for (const [x, h] of [[4, 9], [6, 12], [8, 8], [11, 11]] as const) {
    t.rect(x, 15 - h, 1, h, c('moss'));
    t.set(x, 15 - h, c('moss-dark'));
    if (h > 10) t.rect(x - 1, 15 - h + 1, 1, 3, c('bark'));
  }
}

function lilies(t: PixelCanvas, c: C): void {
  pond(t, c, 13);
  for (const [x, y] of [[3, 4], [10, 9]] as const) {
    t.rect(x, y, 4, 3, c('moss'));
    t.rect(x, y, 3, 1, c('grass-light'));
    t.set(x + 3, y + 2, c('moss-dark'));
    t.set(x + 2, y + 1, c('sea'));
  }
  t.rect(11, 8, 2, 1, c('blush'));
  t.set(11, 7, c('paper'));
}

function mushrooms(t: PixelCanvas, c: C): void {
  for (const [x, y] of [[4, 9], [9, 6], [11, 11]] as const) {
    t.rect(x, y + 2, 2, 2, c('cream'));
    t.rect(x - 1, y, 4, 2, c('brick'));
    t.set(x - 1, y, c('rose'));
    t.set(x + 1, y, c('paper'));
  }
}

export function villageTileset(c: C): PixelCanvas {
  const rows = Math.ceil(VILLAGE_TILES.length / COLUMNS);
  const sheet = new PixelCanvas(COLUMNS * TILE, rows * TILE);
  VILLAGE_TILES.forEach((tile, i) => {
    const t = new PixelCanvas(TILE, TILE);
    const [kind, edge] = tile.name.split(/-(?=[nsewi])/) as [string, Edge | undefined];
    if ((kind === 'path' || kind === 'pond') && edge && EDGES.includes(edge)) edgeTile(t, c, edge, kind);
    else {
      const painters: Record<string, (t: PixelCanvas) => void> = {
        pond: (t) => pond(t, c),
        cobble: (t) => cobble(t, c),
        clover: (t) => clover(t, c),
        tulips: (t) => tulips(t, c),
        daisies: (t) => daisies(t, c),
        'tall-grass': (t) => tallGrass(t, c),
        pebbles: (t) => pebbles(t, c),
        'fence-v': (t) => fenceV(t, c),
        reeds: (t) => reeds(t, c),
        lilies: (t) => lilies(t, c),
        mushrooms: (t) => mushrooms(t, c),
      };
      const paint = painters[tile.name];
      if (!paint) throw new Error(`No painter for village tile "${tile.name}"`);
      paint(t);
    }
    sheet.blit(t, (i % COLUMNS) * TILE, Math.floor(i / COLUMNS) * TILE);
  });
  return sheet;
}
