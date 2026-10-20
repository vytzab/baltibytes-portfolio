// The village tileset's tile list: 32 × 32 tiles, 8 per row, extending tiles.terrain. The art is
// painted by the assetGenerator repo (designs/baltibytes/export.py, `village`) in this order;
// change the list there and here together.
//
// Path and pond edges are corner-based: `path-<mask>` and `pond-<mask>` show the surface on the
// corners in the mask (north-west 8, north-east 4, south-west 2, south-east 1) and grass on the
// others, so 16 tiles per surface cover every side, corner and diagonal and any tile joins any
// other. The map generator works out each cell's mask (map.ts, `cornerMask`).

export const TILE = 32;
export const COLUMNS = 8;

export const CORNER = { nw: 8, ne: 4, sw: 2, se: 1 } as const;
const MASKS = Array.from({ length: 16 }, (_, m) => m);

export const VILLAGE_TILES = [
  ...MASKS.map((m) => ({ name: `path-${m}`, collides: false })),
  // Any water at all makes the cell solid, as the 1× pond edges were.
  ...MASKS.map((m) => ({ name: `pond-${m}`, collides: m !== 0 })),
  { name: 'grass-2', collides: false },
  { name: 'grass-3', collides: false },
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
