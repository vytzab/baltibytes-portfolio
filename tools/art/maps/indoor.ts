// Builds indoor maps (the Dungeon, the Skill Tower, the Guild Hall) as Tiled JSON from a text
// layout. Walls come from a '#'/'.' grid and pick their own tiles (see wallTile); floors and
// decoration are named tiles from any of the given tilesets ("dungeon:floor", "interior:planks").
// Entities are points at their feet; portals are rectangles that lead to another map.
import { checkGrid, type Grid } from '../draw.ts';
import { TILE } from '../placeholders/terrain.ts';
import { RIM } from '../dungeon/tiles.ts';

/** Which wall tile (from the dungeon tileset) a '#' at x, y shows. Exported for the dungeon map. */
export function wallTile(walls: Grid, x: number, y: number): string {
  const at = (dx: number, dy: number) => walls[y + dy]?.[x + dx] ?? '#';
  if (at(0, 1) === '.') return 'wall-face-lower';
  if (at(0, 1) === '#' && at(0, 2) === '.') return 'wall-face-upper';
  let mask = 0;
  if (at(0, -1) === '.') mask |= RIM.n;
  if (at(1, 0) === '.') mask |= RIM.e;
  if (at(-1, 0) === '.') mask |= RIM.w;
  return `wall-top-${mask}`;
}

export interface TilesetRef {
  key: string;
  id: string;
  image: string;
  columns: number;
  tiles: readonly { name: string; collides: boolean }[];
}

export interface Placed {
  name: string;
  type: 'spawn' | 'arrive' | 'npc' | 'sign' | 'prop';
  x: number;
  y: number;
  props: Record<string, string>;
}

export interface PortalSpec {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  to: string;
  arrive: string;
}

export interface IndoorSpec {
  label: string;
  walls: Grid;
  /** Floor tile for a '.' cell, as "set:name". */
  floor: (x: number, y: number) => string;
  decor: Grid;
  /** Decor character → "set:name", or a function of position (e.g. a rug's corners). '.' is empty. */
  decorKey: Record<string, string | ((x: number, y: number) => string)>;
  entities: Placed[];
  portals: PortalSpec[];
}

export function indoorMap(spec: IndoorSpec, tilesets: TilesetRef[]): object {
  checkGrid(spec.walls, `${spec.label} walls`);
  checkGrid(spec.decor, `${spec.label} decor`);
  const width = spec.walls[0]!.length;
  const height = spec.walls.length;
  if (spec.decor.length !== height || spec.decor[0]!.length !== width) throw new Error(`${spec.label}: decor layer size differs from walls`);

  const firstGid = new Map<string, number>();
  let next = 1;
  for (const ts of tilesets) {
    firstGid.set(ts.key, next);
    next += ts.columns * Math.ceil(ts.tiles.length / ts.columns);
  }
  const gid = (ref: string) => {
    const [key, name] = ref.split(':') as [string, string];
    const ts = tilesets.find((t) => t.key === key);
    const i = ts?.tiles.findIndex((t) => t.name === name) ?? -1;
    if (!ts || i < 0) throw new Error(`${spec.label}: no tile "${ref}"`);
    return firstGid.get(key)! + i;
  };

  const ground: number[] = [];
  const decor: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isWall = spec.walls[y]![x] === '#';
      ground.push(gid(isWall ? `dungeon:${wallTile(spec.walls, x, y)}` : spec.floor(x, y)));
      const d = spec.decor[y]![x]!;
      if (d === '.') {
        decor.push(0);
        continue;
      }
      const ref = spec.decorKey[d];
      if (!ref) throw new Error(`${spec.label} decor: unknown "${d}" at ${x},${y}`);
      const tile = typeof ref === 'function' ? ref(x, y) : ref;
      // Wall hangings go on lower wall faces; everything else on floor.
      const onWall = tile.includes('banner');
      if (onWall && wallTile(spec.walls, x, y) !== 'wall-face-lower') throw new Error(`${spec.label}: "${tile}" at ${x},${y} must hang on a lower wall face`);
      if (!onWall && isWall) throw new Error(`${spec.label}: "${tile}" at ${x},${y} is on a wall`);
      decor.push(gid(tile));
    }
  }

  let nextId = 1;
  const objects: object[] = spec.entities.map((e) => ({
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
  }));
  for (const p of spec.portals) {
    objects.push({
      id: nextId++, name: p.name, type: 'portal', x: p.x, y: p.y, width: p.width, height: p.height, rotation: 0, visible: true,
      properties: [{ name: 'to', type: 'string', value: p.to }, { name: 'arrive', type: 'string', value: p.arrive }],
    });
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
    nextobjectid: nextId,
    layers: [
      tileLayer(1, 'ground', ground),
      tileLayer(2, 'decor', decor),
      { id: 3, name: 'entities', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects },
    ],
    tilesets: tilesets.map((ts) => ({
      firstgid: firstGid.get(ts.key)!,
      name: ts.id,
      image: ts.image,
      imagewidth: ts.columns * TILE,
      imageheight: Math.ceil(ts.tiles.length / ts.columns) * TILE,
      columns: ts.columns,
      tilecount: ts.columns * Math.ceil(ts.tiles.length / ts.columns),
      tilewidth: TILE,
      tileheight: TILE,
      margin: 0,
      spacing: 0,
      tiles: ts.tiles.map((t, id) => ({ id, type: t.name, properties: [{ name: 'collides', type: 'bool', value: t.collides }] })),
    })),
  };
}
