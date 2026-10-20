// The Skill Tower (Skills) and the Guild Hall (Experience), written as Tiled JSON with the shared
// indoor builder. Both are reached from the village by roads leaving the forest (east and west).
import type { Grid } from '../draw.ts';
import { TILE } from '../placeholders/terrain.ts';
import { indoorMap, type Placed, type TilesetRef } from '../maps/indoor.ts';
import { SKILL_CATEGORIES } from '../../../src/content/skills.ts';
import { ROLES } from '../../../src/content/experience.ts';

const px = (tiles: number) => tiles * TILE;

/** Rug pieces for a rectangle of rug cells: corners, edges, centre; `star` replaces one centre. */
function rugAt(x: number, y: number, r: { x0: number; y0: number; x1: number; y1: number; star?: [number, number] }): string {
  if (r.star && x === r.star[0] && y === r.star[1]) return 'interior:rug-star';
  const v = y === r.y0 ? 'n' : y === r.y1 ? 's' : '';
  const h = x === r.x0 ? 'w' : x === r.x1 ? 'e' : '';
  return `interior:rug-${v + h || 'c'}`;
}

/** Deterministic flagstone variety, as in the Dungeon. */
const stoneFloor = (x: number, y: number) => {
  const h = (x * 73 + y * 151 + x * y * 7) % 23;
  return h === 0 ? 'dungeon:floor-cracked' : h % 3 === 0 ? 'dungeon:floor-2' : 'dungeon:floor';
};
const plankFloor = (x: number, y: number) => {
  const h = (x * 31 + y * 17) % 11;
  return h === 0 ? 'interior:planks-worn' : (x + y) % 3 === 0 ? 'interior:planks-2' : 'interior:planks';
};

// ---------------------------------------------------------------------------------------------
// Skill Tower: a round stone room (an octagon on the grid), bookshelves along the back wall, the
// sage by a star rug, and a lectern for each skill category in a ring round it.

const TOWER_WALLS: Grid = [
  '#####################',
  '#####################',
  '#####...........#####',
  '###...............###',
  '##.................##',
  '##.................##',
  '##.................##',
  '##.................##',
  '##.................##',
  '##.................##',
  '##.................##',
  '###...............###',
  '#####...........#####',
  '########.....########',
  '########.....########',
  '########.....########',
  '#####################',
];

// 'R' rug (5 × 5, star in the middle), 'b' books, 's' scrolls, '<' '>' cobwebs, 'H' heather banner.
const TOWER_DECOR: Grid = [
  '.....................',
  '..........H..........',
  '.....<.........>.....',
  '.....................',
  '..b..................',
  '........RRRRR........',
  '........RRRRR........',
  '........RRRRR.....s..',
  '........RRRRR........',
  '........RRRRR........',
  '...s.................',
  '.................b...',
  '.....................',
  '.....................',
  '.....................',
  '.....................',
  '.....................',
];

const TOWER_RUG = { x0: 8, y0: 5, x1: 12, y1: 9, star: [10, 7] as [number, number] };

/** Lecterns in a ring round the rug, in SKILL_CATEGORIES order. */
const LECTERNS: Array<[number, number]> = [
  [px(4), px(7)],
  [px(4), px(10)],
  [px(7) + 16, px(12)],
  [px(13) + 16, px(12)],
  [px(17), px(10)],
  [px(17), px(7)],
];

export function towerMap(tilesets: TilesetRef[]): object {
  if (SKILL_CATEGORIES.length !== LECTERNS.length) throw new Error(`tower: ${SKILL_CATEGORIES.length} skill categories but ${LECTERNS.length} lecterns`);
  const entities: Placed[] = [
    { name: 'player', type: 'spawn', x: px(10) + 16, y: px(15), props: { sprite: 'char.player' } },
    { name: 'from-village', type: 'arrive', x: px(10) + 16, y: px(15), props: { facing: 'up' } },
    { name: 'sage', type: 'npc', x: px(10) + 16, y: px(5) - 4, props: { sprite: 'char.npc-sage', dialogue: 'tower-sage' } },
    ...[[px(6), 'a'], [px(8), 'b'], [px(13), 'c'], [px(15), 'd']].map(([x, k]) => ({
      name: `shelf-${k}`, type: 'prop' as const, x: Number(x), y: px(3), props: { sprite: 'obj.bookshelf' },
    })),
    ...SKILL_CATEGORIES.map((cat, i) => ({
      name: `lectern-${cat.id}`, type: 'prop' as const, x: LECTERNS[i]![0], y: LECTERNS[i]![1], props: { sprite: 'obj.lectern', panel: `skills:${cat.id}` },
    })),
  ];
  return indoorMap(
    {
      label: 'tower',
      walls: TOWER_WALLS,
      floor: stoneFloor,
      decor: TOWER_DECOR,
      decorKey: {
        R: (x, y) => rugAt(x, y, TOWER_RUG),
        b: 'interior:books',
        s: 'interior:scrolls',
        '<': 'dungeon:cobweb-nw',
        '>': 'dungeon:cobweb-ne',
        H: 'dungeon:banner-heather',
      },
      entities,
      // Walking down the entrance passage leads back out to the village road.
      portals: [{ name: 'to-village', x: px(8), y: px(16) - 12, width: px(5), height: 12, to: 'map.village', arrive: 'from-skill-tower' }],
    },
    tilesets,
  );
}

// ---------------------------------------------------------------------------------------------
// Guild Hall: a long timber-floored hall with a hearth on the back wall, the guildmaster in front
// of it, a plaque for each role, long tables, and the notice board with the overview by the door.

const GUILD_WALLS: Grid = [
  '########################',
  '########################',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##....................##',
  '##########....##########',
  '##########....##########',
  '########################',
];

// 'R' runner rug (2 wide), 'g' 'r' 'd' gold, brick and denim banners, 'b' books, 's' scrolls.
const GUILD_DECOR: Grid = [
  '........................',
  '................g.r.d...',
  '..<.................>...',
  '...........RR...........',
  '...........RR...........',
  '...........RR...........',
  '...........RR...........',
  '...........RR.......s...',
  '...........RR...........',
  '...........RR...........',
  '...........RR.......b...',
  '...........RR...........',
  '...........RR...........',
  '...........RR...........',
  '........................',
];

export function guildMap(tilesets: TilesetRef[]): object {
  if (ROLES.length > 4) throw new Error(`guild hall: room for 4 role plaques, ${ROLES.length} roles`);
  const entities: Placed[] = [
    { name: 'player', type: 'spawn', x: px(12), y: px(13) + 16, props: { sprite: 'char.player' } },
    { name: 'from-village', type: 'arrive', x: px(12), y: px(13) + 16, props: { facing: 'up' } },
    { name: 'guildmaster', type: 'npc', x: px(12), y: px(4) + 8, props: { sprite: 'char.npc-guildmaster', dialogue: 'guild-master' } },
    { name: 'hearth', type: 'prop', x: px(12), y: px(2), props: { sprite: 'obj.hearth' } },
    // Plaques on the back wall, west of the hearth, one per role in ROLES order.
    ...ROLES.map((role, i) => ({ name: `plaque-${role.id}`, type: 'prop' as const, x: px(3 + i * 2) + 16, y: px(2), props: { sprite: 'obj.plaque', panel: `role:${role.id}` } })),
    { name: 'records', type: 'prop', x: px(4), y: px(12), props: { sprite: 'obj.noticeboard', panel: 'experience' } },
    ...[[px(7), px(6)], [px(17), px(6)], [px(7), px(9)], [px(17), px(9)]].map(([x, y], i) => ({ name: `table-${i}`, type: 'prop' as const, x: x!, y: y!, props: { sprite: 'obj.table' } })),
  ];
  return indoorMap(
    {
      label: 'guild hall',
      walls: GUILD_WALLS,
      floor: plankFloor,
      decor: GUILD_DECOR,
      decorKey: {
        R: (x) => (x === 11 ? 'dungeon:rug-left' : 'dungeon:rug-right'),
        g: 'dungeon:banner-gold',
        r: 'dungeon:banner-brick',
        d: 'dungeon:banner-denim',
        b: 'interior:books',
        s: 'interior:scrolls',
        '<': 'dungeon:cobweb-nw',
        '>': 'dungeon:cobweb-ne',
      },
      entities,
      portals: [{ name: 'to-village', x: px(10), y: px(14) - 12, width: px(4), height: 12, to: 'map.village', arrive: 'from-guild-hall' }],
    },
    tilesets,
  );
}
