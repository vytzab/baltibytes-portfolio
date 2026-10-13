// The art-preview map, laid out as text and written as Tiled JSON (format 1.10), so it opens
// in the Tiled editor and Phaser loads it like any real map. Real maps will be drawn in Tiled
// directly; this one is generated only because it ships with the placeholder art.
import { COLUMNS, TERRAIN_TILES, TILE, type TerrainTileName } from './terrain.ts';
import { checkGrid, type Grid } from '../draw.ts';

// Ground layer: every cell filled.
const GROUND: Grid = [
  '........................',
  '.,..........,.......,...',
  '........................',
  '....,.........,.........',
  '..........==............',
  '..........==............',
  '..==========....,.......',
  '..==========............',
  '..........==....________',
  '.,........==....~~~~~~~~',
  '..........==....~~~~~~~~',
  '....,.....==....~~~~~~~~',
  '..........==....~~~~~~~~',
  '..........==..,.~~~~~~~~',
  '..........==....~~~~~~~~',
];

// Decoration layer and entities: tiles above the ground, plus P player, N NPC, G sign.
const DECOR: Grid = [
  'FFFFFFFFFFFFFFFFFFFFFFFF',
  'B.....................SB',
  '...*.........B.....*....',
  '........................',
  '.........G..............',
  '..............N.........',
  '.....................R..',
  '..*..............*......',
  '.B....P.................',
  '........................',
  '..S.....................',
  '...........*............',
  '.R......................',
  '....B...................',
  '..*.....................',
];

const GROUND_KEY: Record<string, TerrainTileName> = { '.': 'grass', ',': 'grass-tufts', '=': 'path', '~': 'water', _: 'shore' };
const DECOR_KEY: Record<string, TerrainTileName> = { B: 'bush', R: 'rock', F: 'fence', '*': 'flowers', S: 'stump' };
const ENTITIES: Record<string, { name: string; type: string; properties: Record<string, string> }> = {
  P: { name: 'player', type: 'spawn', properties: { sprite: 'char.player' } },
  N: { name: 'guide', type: 'npc', properties: { sprite: 'char.npc-guide', dialogue: 'preview-guide' } },
  G: { name: 'preview-sign', type: 'sign', properties: { sprite: 'obj.sign', dialogue: 'preview-sign' } },
};

/** Tiled global tile id: tileset index + firstgid (1); 0 means an empty cell. */
const gid = (name: TerrainTileName) => TERRAIN_TILES.findIndex((t) => t.name === name) + 1;

export function previewMap(tilesetId: string, tilesetImage: string): object {
  checkGrid(GROUND, 'ground');
  checkGrid(DECOR, 'decor');
  const width = GROUND[0]!.length;
  const height = GROUND.length;
  if (DECOR.length !== height || DECOR[0]!.length !== width) throw new Error('decor layer size differs from ground');

  const ground: number[] = [];
  const decor: number[] = [];
  const objects: object[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const g = GROUND_KEY[GROUND[y]![x]!];
      if (!g) throw new Error(`ground: unknown "${GROUND[y]![x]}" at ${x},${y}`);
      ground.push(gid(g));
      const d = DECOR[y]![x]!;
      const entity = ENTITIES[d];
      if (entity) {
        // Point objects at the cell's bottom centre: where the sprite's feet go.
        objects.push({
          id: objects.length + 1,
          name: entity.name,
          type: entity.type,
          point: true,
          x: x * TILE + TILE / 2,
          y: (y + 1) * TILE,
          width: 0,
          height: 0,
          rotation: 0,
          visible: true,
          properties: Object.entries(entity.properties).map(([name, value]) => ({ name, type: 'string', value })),
        });
        decor.push(0);
      } else if (d === '.') {
        decor.push(0);
      } else {
        const name = DECOR_KEY[d];
        if (!name) throw new Error(`decor: unknown "${d}" at ${x},${y}`);
        decor.push(gid(name));
      }
    }
  }

  const tileLayer = (id: number, name: string, data: number[]) => ({ id, name, type: 'tilelayer', width, height, x: 0, y: 0, opacity: 1, visible: true, data });
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
    nextobjectid: objects.length + 1,
    layers: [
      tileLayer(1, 'ground', ground),
      tileLayer(2, 'decor', decor),
      { id: 3, name: 'entities', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: tilesetId,
        image: tilesetImage,
        imagewidth: COLUMNS * TILE,
        imageheight: Math.ceil(TERRAIN_TILES.length / COLUMNS) * TILE,
        columns: COLUMNS,
        tilecount: TERRAIN_TILES.length,
        tilewidth: TILE,
        tileheight: TILE,
        margin: 0,
        spacing: 0,
        tiles: TERRAIN_TILES.map((t, id) => ({
          id,
          type: t.name,
          properties: [{ name: 'collides', type: 'bool', value: t.collides }],
        })),
      },
    ],
  };
}
