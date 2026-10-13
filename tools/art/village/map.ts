// The Starting Village (About me), written as Tiled JSON (format 1.10) so it opens in Tiled and
// loads like any map. The layout is text below; path and pond edges are chosen automatically
// from their neighbours, so the text stays readable and the edges always match.
//
// Layers: ground (terrain + village tiles), decor (plants, fences, rocks; drawn under
// characters), entities (spawn, NPC, sign, props as points at their feet), collision
// (rectangles: the forest edge; kept apart from the art so trees can be moved freely).
import { checkGrid, type Grid } from '../draw.ts';
import { COLUMNS as TERRAIN_COLUMNS, TERRAIN_TILES, TILE } from '../placeholders/terrain.ts';
import { COLUMNS as VILLAGE_COLUMNS, VILLAGE_TILES, type Edge } from './tiles.ts';

// Ground. '.' grass, ',' grass tufts, ';' clover, '=' path, '#' cobble, '~' pond,
// 'l' pond with lilies, 'r' pond with reeds (both only where the pond needs no edge).
const GROUND: Grid = [
  '..,.......;.......,.......',
  '.;....,........,.....;....',
  '....,......;......,.......',
  '..........,..==...~~~~....',
  '.;...........==..~~l~~~.,.',
  '.......,.....==..~~lll~...',
  '....;........====~~~r~~.;.',
  '..,..........====.~~~~....',
  '.....==......==...........',
  '...;.==....#####....;.....',
  '.....======#####..........',
  '.,...======#####...,......',
  '...........#####.......;..',
  '..,.........==............',
  '......;.....==.....,......',
  '.,..........==............',
  '........,...==......;.....',
  '..;.........==........,...',
  '............==............',
  '.....,......==...;........',
  '............==............',
];

// Decoration. 'B' bush, 'R' rock, 'S' stump, 'F' fence (east–west), '|' fence (north–south),
// '*' wild flowers, 't' tulips, 'd' daisies, 'g' tall grass, 'p' pebbles, 'm' mushrooms.
const DECOR: Grid = [
  '..........................',
  '..........................',
  '..........................',
  '..g.............g.........',
  '................g......g..',
  '..m.....*.......g.........',
  '.......................B..',
  '..p.......d......g........',
  '...tt..dd..*..p...........',
  '.B......R...........*.....',
  '.................FFFFFF...',
  '....p............|tdtd|...',
  '..*..d...*......d|dtdt|..B',
  '.................|tdtd|...',
  '..B....g...*..p..FF..FF...',
  '.......m..............*...',
  '....*..........d..........',
  '..R....S...........R......',
  '..........*...*...m.......',
  '...g..............g.......',
  '..........................',
];

const GROUND_KEY: Record<string, string> = { '.': 'grass', ',': 'grass-tufts', ';': 'clover', '=': 'path', '#': 'cobble', '~': 'pond', l: 'lilies', r: 'reeds' };
const DECOR_KEY: Record<string, string> = { B: 'bush', R: 'rock', S: 'stump', F: 'fence', '|': 'fence-v', '*': 'flowers', t: 'tulips', d: 'daisies', g: 'tall-grass', p: 'pebbles', m: 'mushrooms' };

/** Cells that count as the same surface when choosing edges (paths run into the cobbled square). */
const SURFACES: Record<'path' | 'pond', Set<string>> = {
  path: new Set(['=', '#']),
  pond: new Set(['~', 'l', 'r']),
};

const px = (tiles: number) => tiles * TILE;

/** Props stand on the map with their feet (bottom centre) at x, y in pixels. */
interface Placed {
  name: string;
  type: 'spawn' | 'arrive' | 'npc' | 'sign' | 'prop';
  x: number;
  y: number;
  sprite: string;
  dialogue?: string;
  facing?: string;
}

const ENTITIES: Placed[] = [
  { name: 'player', type: 'spawn', x: px(13), y: px(20), sprite: 'char.player' },
  { name: 'guide', type: 'npc', x: px(15) + 8, y: px(12), sprite: 'char.npc-guide', dialogue: 'village-guide' },
  { name: 'welcome-sign', type: 'sign', x: px(10) + 8, y: px(20) + 4, sprite: 'obj.sign', dialogue: 'village-sign' },
  { name: 'welcome-arch', type: 'prop', x: px(13), y: px(18), sprite: 'obj.arch' },
  // The cellar at the top of the north path leads down to the Dungeon (Projects).
  { name: 'cellar', type: 'prop', x: px(14), y: px(3) + 8, sprite: 'obj.cellar' },
  { name: 'from-dungeon', type: 'arrive', x: px(14), y: px(5), sprite: '', facing: 'down' },
  { name: 'notice-board', type: 'prop', x: px(13) + 8, y: px(10), sprite: 'obj.noticeboard', dialogue: 'village-board' },
  { name: 'workshop', type: 'prop', x: px(6), y: px(8), sprite: 'obj.house', dialogue: 'village-workshop' },
  { name: 'crates', type: 'prop', x: px(9) + 8, y: px(8), sprite: 'obj.crates' },
  { name: 'lamp-west', type: 'prop', x: px(10) + 8, y: px(10), sprite: 'obj.lamp' },
  { name: 'lamp-east', type: 'prop', x: px(16) + 8, y: px(10), sprite: 'obj.lamp' },
  // Trees: a forest edge along the north, west and east, thinning towards the entrance.
  ...[1, 3, 5, 9, 11, 17, 20, 23, 25].map((t, i) => ({ name: `tree-n${i}`, type: 'prop' as const, x: px(t), y: px(2) + 6, sprite: i % 3 === 1 ? 'obj.tree-birch' : 'obj.tree-pine' })),
  ...[5, 8, 11, 14, 17].map((t, i) => ({ name: `tree-w${i}`, type: 'prop' as const, x: px(1), y: px(t), sprite: i % 2 ? 'obj.tree-birch' : 'obj.tree-pine' })),
  ...[5, 9, 12, 16].map((t, i) => ({ name: `tree-e${i}`, type: 'prop' as const, x: px(25), y: px(t), sprite: i % 2 ? 'obj.tree-pine' : 'obj.tree-birch' })),
  ...[3, 7, 18, 22].map((t, i) => ({ name: `tree-s${i}`, type: 'prop' as const, x: px(t), y: px(21), sprite: i % 2 ? 'obj.tree-birch' : 'obj.tree-pine' })),
  { name: 'pond-birch', type: 'prop', x: px(24), y: px(8), sprite: 'obj.tree-birch' },
  { name: 'square-birch', type: 'prop', x: px(9) + 8, y: px(14), sprite: 'obj.tree-birch' },
  { name: 'gate-pine-w', type: 'prop', x: px(9), y: px(18), sprite: 'obj.tree-pine' },
  { name: 'gate-pine-e', type: 'prop', x: px(17), y: px(18) + 4, sprite: 'obj.tree-pine' },
];

/** The forest edge: solid strips round the map, with a gap for the entrance at the south. */
const COLLISION = [
  { name: 'forest-north', x: 0, y: 0, width: px(26), height: 40 },
  { name: 'forest-west', x: 0, y: 0, width: 24, height: px(21) },
  { name: 'forest-east', x: px(26) - 24, y: 0, width: 24, height: px(21) },
  { name: 'forest-south-west', x: 0, y: px(21) - 12, width: px(11), height: 12 },
  { name: 'forest-south-east', x: px(15), y: px(21) - 12, width: px(11), height: 12 },
];

function edgeFor(grid: Grid, x: number, y: number, surface: 'path' | 'pond'): Edge | null {
  const same = (dx: number, dy: number) => {
    const row = grid[y + dy];
    const ch = row?.[x + dx];
    // Off the map counts as the same surface: a path running off the edge has no fringe there.
    return ch === undefined || SURFACES[surface].has(ch);
  };
  const n = !same(0, -1);
  const s = !same(0, 1);
  const w = !same(-1, 0);
  const e = !same(1, 0);
  if ((n && s) || (w && e)) throw new Error(`village: ${surface} at ${x},${y} is only 1 tile wide; make it at least 2`);
  if (n && w) return 'nw';
  if (n && e) return 'ne';
  if (s && w) return 'sw';
  if (s && e) return 'se';
  if (n) return 'n';
  if (s) return 's';
  if (w) return 'w';
  if (e) return 'e';
  const corners = (['nw', 'ne', 'sw', 'se'] as const).filter((k) => !same(k.includes('w') ? -1 : 1, k.includes('n') ? -1 : 1));
  if (corners.length > 1) throw new Error(`village: ${surface} at ${x},${y} needs ${corners.length} inner corners; widen it`);
  return corners.length ? (`i${corners[0]}` as Edge) : null;
}

export function villageMap(tilesets: { terrain: { id: string; image: string }; village: { id: string; image: string } }): object {
  checkGrid(GROUND, 'village ground');
  checkGrid(DECOR, 'village decor');
  const width = GROUND[0]!.length;
  const height = GROUND.length;
  if (DECOR.length !== height || DECOR[0]!.length !== width) throw new Error('village: decor layer size differs from ground');

  const terrainGid = (name: string) => {
    const i = TERRAIN_TILES.findIndex((t) => t.name === name);
    if (i < 0) throw new Error(`no terrain tile "${name}"`);
    return 1 + i;
  };
  const villageFirstGid = 1 + TERRAIN_TILES.length;
  const villageGid = (name: string) => {
    const i = VILLAGE_TILES.findIndex((t) => t.name === name);
    if (i < 0) throw new Error(`no village tile "${name}"`);
    return villageFirstGid + i;
  };
  const gid = (name: string) => (TERRAIN_TILES.some((t) => t.name === name) ? terrainGid(name) : villageGid(name));

  const ground: number[] = [];
  const decor: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = GROUND[y]![x]!;
      const name = GROUND_KEY[ch];
      if (!name) throw new Error(`village ground: unknown "${ch}" at ${x},${y}`);
      if (ch === '=' || ch === '~') {
        const surface = ch === '=' ? 'path' : 'pond';
        const edge = edgeFor(GROUND, x, y, surface);
        ground.push(edge ? villageGid(`${surface}-${edge}`) : ch === '=' ? terrainGid('path') : villageGid('pond'));
      } else if (ch === 'l' || ch === 'r') {
        if (edgeFor(GROUND, x, y, 'pond')) throw new Error(`village: "${ch}" at ${x},${y} is on the pond's edge; move it inwards`);
        ground.push(villageGid(name));
      } else ground.push(gid(name));

      const d = DECOR[y]![x]!;
      if (d === '.') decor.push(0);
      else {
        const decoName = DECOR_KEY[d];
        if (!decoName) throw new Error(`village decor: unknown "${d}" at ${x},${y}`);
        decor.push(gid(decoName));
      }
    }
  }

  let nextId = 1;
  const props = (p: Record<string, string | undefined>) =>
    Object.entries(p)
      .filter((kv): kv is [string, string] => kv[1] !== undefined)
      .map(([name, value]) => ({ name, type: 'string', value }));
  const entities: object[] = ENTITIES.map((e) => ({
    id: nextId++,
    name: e.name,
    type: e.type,
    point: true,
    x: e.x,
    y: e.y,
    width: 0,
    height: 0,
    rotation: 0,
    visible: true,
    properties: props({ sprite: e.sprite || undefined, dialogue: e.dialogue, facing: e.facing }),
  }));
  // Walking into the cellar's dark doorway takes you down to the Dungeon.
  entities.push({
    id: nextId++, name: 'to-dungeon', type: 'portal', point: false, x: px(14) - 9, y: 40, width: 18, height: 8, rotation: 0, visible: true,
    properties: props({ to: 'map.dungeon', arrive: 'from-village' }),
  });
  const collision = COLLISION.map((r) => ({ id: nextId++, name: r.name, type: 'solid', x: r.x, y: r.y, width: r.width, height: r.height, rotation: 0, visible: true }));

  const tileLayer = (id: number, name: string, data: number[]) => ({ id, name, type: 'tilelayer', width, height, x: 0, y: 0, opacity: 1, visible: true, data });
  const tileset = (firstgid: number, ref: { id: string; image: string }, list: readonly { name: string; collides: boolean }[], columns: number) => ({
    firstgid,
    name: ref.id,
    image: ref.image,
    imagewidth: columns * TILE,
    imageheight: Math.ceil(list.length / columns) * TILE,
    columns,
    tilecount: columns * Math.ceil(list.length / columns),
    tilewidth: TILE,
    tileheight: TILE,
    margin: 0,
    spacing: 0,
    tiles: list.map((t, id) => ({ id, type: t.name, properties: [{ name: 'collides', type: 'bool', value: t.collides }] })),
  });

  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.11.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    infinite: false,
    compressionlevel: -1,
    width,
    height,
    tilewidth: TILE,
    tileheight: TILE,
    nextlayerid: 5,
    nextobjectid: nextId,
    layers: [
      tileLayer(1, 'ground', ground),
      tileLayer(2, 'decor', decor),
      { id: 3, name: 'entities', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: entities },
      { id: 4, name: 'collision', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: collision },
    ],
    tilesets: [
      tileset(1, tilesets.terrain, TERRAIN_TILES, TERRAIN_COLUMNS),
      tileset(villageFirstGid, tilesets.village, VILLAGE_TILES, VILLAGE_COLUMNS),
    ],
  };
}
