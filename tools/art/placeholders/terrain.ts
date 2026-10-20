// The terrain tileset's tile list: 32 × 32 tiles in a 5 × 2 sheet (ART_BIBLE §11). The art is
// painted by the assetGenerator repo (designs/baltibytes/export.py, `terrain`) in this order;
// change the list there and here together. Ground tiles are opaque and tile seamlessly;
// decoration tiles have a transparent background and sit on a second map layer.

export const TILE = 32;
export const COLUMNS = 5;

/** Tile index (0-based, as in Tiled's tileset) → name and whether the player collides with it. */
export const TERRAIN_TILES = [
  { name: 'grass', collides: false },
  { name: 'grass-tufts', collides: false },
  { name: 'path', collides: false },
  { name: 'water', collides: true },
  { name: 'shore', collides: true },
  { name: 'bush', collides: true },
  { name: 'rock', collides: true },
  { name: 'fence', collides: true },
  { name: 'flowers', collides: false },
  { name: 'stump', collides: true },
] as const;

export type TerrainTileName = (typeof TERRAIN_TILES)[number]['name'];
