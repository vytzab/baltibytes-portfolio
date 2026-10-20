// The interior tileset's tile list for the Skill Tower and the Guild Hall: 32 × 32 tiles, 8 per
// row. Dark plank floors, a heather rug with a patterned gold border (3 × 3 pieces, any size from
// 3 × 3 up), a star for the rug's centre, and small floor clutter. Walls and banners come from the
// dungeon tileset, so every stone building shares one masonry. The art is painted by the
// assetGenerator repo (designs/baltibytes/tiles/interior.py, NAMES) in this order; change the list
// there and here together.

export const TILE = 32;
export const COLUMNS = 8;

const RUG_PARTS = ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'] as const;

export const INTERIOR_TILES = [
  { name: 'planks', collides: false },
  { name: 'planks-2', collides: false },
  { name: 'planks-worn', collides: false },
  ...RUG_PARTS.map((p) => ({ name: `rug-${p}`, collides: false })),
  { name: 'rug-star', collides: false },
  { name: 'books', collides: false },
  { name: 'scrolls', collides: false },
] as const;
