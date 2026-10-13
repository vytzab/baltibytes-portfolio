// The Dungeon (Projects), written as Tiled JSON. Five vaults open off a torch-lit hall; each
// holds a quest chest with one project's case study, under a banner in that project's colour.
// Stairs at the south lead back up to the village.
//
// Walls are drawn from the text below: '#' wall, '.' floor. A wall with floor to its south
// shows its brick face (two tiles high); other walls show their top, rimmed where they meet floor.
import { checkGrid, type Grid } from '../draw.ts';
import { TILE } from '../placeholders/terrain.ts';
import { COLUMNS as VILLAGE_COLUMNS, VILLAGE_TILES } from '../village/tiles.ts';
import { PROJECTS } from '../../../src/content/projects.ts';
import { COLUMNS, DUNGEON_TILES, RIM } from './tiles.ts';

const WALLS: Grid = [
  '##########################',
  '##########################',
  '##.....###......###.....##',
  '##.....###......###.....##',
  '##.....###......###.....##',
  '##.....###......###.....##',
  '####..#####....#####..####',
  '####..#####....#####..####',
  '##......................##',
  '##......................##',
  '##......................##',
  '##......................##',
  '##......................##',
  '####..######..######..####',
  '####..######..######..####',
  '##.....####....####.....##',
  '##.....####....####.....##',
  '##.....####....####.....##',
  '###########....###########',
  '##########################',
];

// Decoration over the floor and walls: 'R' rug (2 wide; left/right picked by position),
// 'r' rubble, 'm' mushrooms, 'p' pebbles, '<' / '>' cobwebs in a room's NW / NE corner,
// '1'–'5' the banner of project 1–5 (in PROJECTS order).
const DECOR: Grid = [
  '..........................',
  '....1......2..2......3....',
  '..<....................>..',
  '..........................',
  '.....r....................',
  '...................p......',
  '..........................',
  '..........................',
  '..<...........m........>..',
  '............RR............',
  '............RR........r...',
  '..p.........RR............',
  '............RR............',
  '............RR............',
  '...4..4.....RR.....5..5...',
  '..<.........RR.........>..',
  '............RR.........m..',
  '......m.....RR............',
  '............RR............',
  '..........................',
];

const px = (tiles: number) => tiles * TILE;

/**
 * Vaults in PROJECTS order: A, B, C open north off the hall, D and E south. Chests stand against
 * the far wall; torches hang on the visible (north) wall faces, clear of the banners.
 */
const VAULTS = [
  { x: px(4) + 8, chestY: px(4), torches: [px(2) + 8, px(6) + 8], torchY: px(2) },
  { x: px(13), chestY: px(4), torches: [px(10) + 8, px(15) + 8], torchY: px(2) },
  { x: px(21) + 8, chestY: px(4), torches: [px(19) + 8, px(23) + 8], torchY: px(2) },
  { x: px(4) + 8, chestY: px(18), torches: [px(2) + 8], torchY: px(15) },
  { x: px(21) + 8, chestY: px(18), torches: [px(23) + 8], torchY: px(15) },
];

interface Placed {
  name: string;
  type: 'spawn' | 'arrive' | 'npc' | 'prop';
  x: number;
  y: number;
  props: Record<string, string>;
}

function entities(): Placed[] {
  if (PROJECTS.length !== VAULTS.length) throw new Error(`dungeon: ${PROJECTS.length} projects but ${VAULTS.length} vaults`);
  const list: Placed[] = [
    { name: 'player', type: 'spawn', x: px(13), y: px(17), props: { sprite: 'char.player' } },
    { name: 'from-village', type: 'arrive', x: px(13), y: px(17), props: { facing: 'up' } },
    { name: 'guide', type: 'npc', x: px(10) + 8, y: px(11), props: { sprite: 'char.npc-guide', dialogue: 'dungeon-guide' } },
    { name: 'stairs-up', type: 'prop', x: px(13), y: px(19), props: { sprite: 'obj.stairs-up' } },
  ];
  PROJECTS.forEach((p, i) => {
    const v = VAULTS[i]!;
    list.push({ name: `chest-${p.id}`, type: 'prop', x: v.x, y: v.chestY, props: { sprite: 'obj.chest', caseStudy: p.id } });
    v.torches.forEach((x, k) => list.push({ name: `torch-${p.id}-${k}`, type: 'prop', x, y: v.torchY, props: { sprite: 'obj.torch' } }));
  });
  // Torches along the hall's north wall.
  for (const x of [px(8) + 8, px(17) + 8]) list.push({ name: `torch-hall-${x}`, type: 'prop', x, y: px(8), props: { sprite: 'obj.torch' } });
  return list;
}

function wallTile(x: number, y: number): string {
  const at = (dx: number, dy: number) => WALLS[y + dy]?.[x + dx] ?? '#';
  if (at(0, 1) === '.') return 'wall-face-lower';
  if (at(0, 1) === '#' && at(0, 2) === '.') return 'wall-face-upper';
  let mask = 0;
  if (at(0, -1) === '.') mask |= RIM.n;
  if (at(1, 0) === '.') mask |= RIM.e;
  if (at(-1, 0) === '.') mask |= RIM.w;
  return `wall-top-${mask}`;
}

/** Deterministic floor variety: mostly plain, some split stones, a few cracks and mossy stones. */
function floorTile(x: number, y: number): string {
  const h = (x * 73 + y * 151 + x * y * 7) % 23;
  return h === 0 ? 'floor-cracked' : h === 5 ? 'floor-moss' : h % 3 === 0 ? 'floor-2' : 'floor';
}

export function dungeonMap(tilesets: { dungeon: { id: string; image: string }; village: { id: string; image: string } }): object {
  checkGrid(WALLS, 'dungeon walls');
  checkGrid(DECOR, 'dungeon decor');
  const width = WALLS[0]!.length;
  const height = WALLS.length;
  if (DECOR.length !== height || DECOR[0]!.length !== width) throw new Error('dungeon: decor layer size differs from walls');

  const dungeonGid = (name: string) => {
    const i = DUNGEON_TILES.findIndex((t) => t.name === name);
    if (i < 0) throw new Error(`no dungeon tile "${name}"`);
    return 1 + i;
  };
  const villageFirst = 1 + COLUMNS * Math.ceil(DUNGEON_TILES.length / COLUMNS);
  const villageGid = (name: string) => {
    const i = VILLAGE_TILES.findIndex((t) => t.name === name);
    if (i < 0) throw new Error(`no village tile "${name}"`);
    return villageFirst + i;
  };

  const ground: number[] = [];
  const decor: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isWall = WALLS[y]![x] === '#';
      ground.push(dungeonGid(isWall ? wallTile(x, y) : floorTile(x, y)));
      const d = DECOR[y]![x]!;
      const needsFloor = 'Rrmp<>'.includes(d);
      if (d !== '.' && needsFloor && isWall) throw new Error(`dungeon decor "${d}" at ${x},${y} is on a wall`);
      if (/[1-5]/.test(d) && wallTile(x, y) !== 'wall-face-lower') throw new Error(`dungeon banner at ${x},${y} must hang on a wall face`);
      if (d === '.') decor.push(0);
      else if (d === 'R') decor.push(dungeonGid(DECOR[y]![x - 1] === 'R' ? 'rug-right' : 'rug-left'));
      else if (d === 'r') decor.push(dungeonGid('rubble'));
      else if (d === '<') decor.push(dungeonGid('cobweb-nw'));
      else if (d === '>') decor.push(dungeonGid('cobweb-ne'));
      else if (d === 'm') decor.push(villageGid('mushrooms'));
      else if (d === 'p') decor.push(villageGid('pebbles'));
      else if (/[1-5]/.test(d)) decor.push(dungeonGid(`banner-${PROJECTS[Number(d) - 1]!.accent}`));
      else throw new Error(`dungeon decor: unknown "${d}" at ${x},${y}`);
    }
  }

  let nextId = 1;
  const point = (e: Placed) => ({
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
    properties: Object.entries(e.props).map(([name, value]) => ({ name, type: 'string', value })),
  });
  const objects: object[] = entities().map(point);
  // Walking onto the bottom step takes you back up to the village.
  objects.push({
    id: nextId++, name: 'to-village', type: 'portal', x: px(12) + 4, y: px(18) + 8, width: 24, height: 8, rotation: 0, visible: true,
    properties: [{ name: 'to', type: 'string', value: 'map.village' }, { name: 'arrive', type: 'string', value: 'from-dungeon' }],
  });

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
    nextlayerid: 4,
    nextobjectid: nextId,
    layers: [
      tileLayer(1, 'ground', ground),
      tileLayer(2, 'decor', decor),
      { id: 3, name: 'entities', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects },
    ],
    tilesets: [
      tileset(1, tilesets.dungeon, DUNGEON_TILES, COLUMNS),
      tileset(villageFirst, tilesets.village, VILLAGE_TILES, VILLAGE_COLUMNS),
    ],
  };
}
