// The dungeon tileset's tile list: the Projects vaults, 32 × 32 tiles, 8 per row. The art is
// painted by the assetGenerator repo (designs/baltibytes/tiles/dungeon.py, NAMES) in this order;
// change the list there and here together.
// Walls follow the top-down three-quarter view: where a wall has floor to its south we see its
// face, two tiles of brick (upper and lower); everywhere else we see its dark top, rimmed with a
// light edge on each side that meets floor. The map generator picks the right tile.

export const TILE = 32;
export const COLUMNS = 8;

/** Rim bits on a wall top: which sides face open floor. */
export const RIM = { n: 1, e: 2, s: 4, w: 8 } as const;

export const BANNERS = ['brick', 'denim', 'moss', 'gold', 'heather'] as const;
export type BannerColor = (typeof BANNERS)[number];

export const DUNGEON_TILES = [
  ...Array.from({ length: 16 }, (_, mask) => ({ name: `wall-top-${mask}`, collides: true })),
  { name: 'wall-face-upper', collides: true },
  { name: 'wall-face-lower', collides: true },
  { name: 'floor', collides: false },
  { name: 'floor-2', collides: false },
  { name: 'floor-cracked', collides: false },
  { name: 'floor-moss', collides: false },
  { name: 'rug-left', collides: false },
  { name: 'rug-right', collides: false },
  { name: 'rubble', collides: false },
  { name: 'cobweb-nw', collides: false },
  { name: 'cobweb-ne', collides: false },
  ...BANNERS.map((b) => ({ name: `banner-${b}`, collides: true })),
] as const;
