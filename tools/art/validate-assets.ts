// Checks src/assets/manifest.json against the files on disk. Pure function: returns issues,
// prints nothing, so tests can call it on fixture folders. The CLI is validate.ts.
//
// What it can check: structure, ids, paths, provenance, decodable PNGs, sizes, frame grids,
// empty frames, transparency, hard alpha edges, palette membership and Tiled map wiring.
// What it can't: whether the art is good, readable or stylistically consistent. That needs eyes
// (art-preview.html and art/ART_BIBLE.md).
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, join, normalize, posix, relative, sep } from 'node:path';
import {
  CATEGORIES,
  LICENSES,
  type AssetCategory,
  type AssetEntry,
  type AnimationSpec,
  type SolidBox,
} from '../../src/game/assets/manifest.ts';
import { FEET, INTERACT_RANGE } from '../../src/game/rules.ts';
import { readPng, rgbToHex, type RgbaImage } from './png.ts';
import { PALETTE_DIR, loadPalette } from './palette.ts';

export interface Issue {
  level: 'error' | 'warning';
  /** Asset id, or the file path when there is no id. */
  asset: string;
  message: string;
}

export interface ValidateOptions {
  assetRoot: string;
  manifestPath?: string;
  paletteDir?: string;
  /** Treat anything not yet production (placeholder or draft) as an error: a release gate. */
  noPlaceholders?: boolean;
}

export interface ValidateResult {
  issues: Issue[];
  assetCount: number;
  placeholders: string[];
  drafts: string[];
}

const ID_RE = /^[a-z]+\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = ['image', 'spritesheet', 'tilemap'] as const;
const STATUSES = ['placeholder', 'draft', 'production'] as const;
const TRANSPARENCIES = ['opaque', 'transparent', 'mixed'] as const;
const ORIGINS = ['code-generated', 'hand-drawn', 'ai-assisted', 'third-party'] as const;
/** Files in the asset root that aren't assets. */
const NOT_ASSETS = new Set(['manifest.json', 'README.md']);
// Tiled stores flip/rotate flags in the top bits of each gid.
const GID_MASK = 0x1fffffff;

const isPosInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function validateAssets(options: ValidateOptions): ValidateResult {
  const assetRoot = options.assetRoot;
  const manifestPath = options.manifestPath ?? join(assetRoot, 'manifest.json');
  const paletteDir = options.paletteDir ?? PALETTE_DIR;
  const issues: Issue[] = [];
  const error = (asset: string, message: string) => issues.push({ level: 'error', asset, message });
  const warn = (asset: string, message: string) => issues.push({ level: 'warning', asset, message });

  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    error('manifest', `cannot read ${manifestPath}: ${(e as Error).message}`);
    return { issues, assetCount: 0, placeholders: [], drafts: [] };
  }
  const m = manifest as { version?: unknown; assets?: unknown };
  if (m.version !== 1) error('manifest', `"version" must be 1, found ${JSON.stringify(m.version)}`);
  if (!Array.isArray(m.assets)) {
    error('manifest', '"assets" must be an array');
    return { issues, assetCount: 0, placeholders: [], drafts: [] };
  }
  const entries = m.assets as AssetEntry[];

  const ids = new Map<string, number>();
  const paths = new Map<string, string>();
  const byId = new Map<string, AssetEntry>();
  const listedFiles = new Set<string>();
  const palettes = new Map<string, Set<string> | null>();
  const placeholders: string[] = [];
  const drafts: string[] = [];

  entries.forEach((entry, index) => {
    const label = isText(entry?.id) ? entry.id : `assets[${index}]`;
    const err = (msg: string) => error(label, msg);

    if (typeof entry !== 'object' || entry === null) return err('entry must be an object');

    // Id
    if (!isText(entry.id)) err('missing "id"');
    else {
      if (!ID_RE.test(entry.id)) err(`id "${entry.id}" must look like "<prefix>.<kebab-name>", e.g. "char.player"`);
      if (ids.has(entry.id)) err(`duplicate id (also assets[${ids.get(entry.id)}])`);
      else ids.set(entry.id, index);
      byId.set(entry.id, entry);
    }

    // Category, type, status
    const category = entry.category as AssetCategory;
    const categoryInfo = CATEGORIES[category];
    if (!categoryInfo) err(`unknown category "${entry.category}"; use one of ${Object.keys(CATEGORIES).join(', ')}`);
    else if (isText(entry.id) && !entry.id.startsWith(`${categoryInfo.prefix}.`)) {
      err(`id for category "${category}" must start with "${categoryInfo.prefix}."`);
    }
    if (!TYPES.includes(entry.type)) err(`unknown type "${entry.type}"; use one of ${TYPES.join(', ')}`);
    if (category === 'map' && entry.type !== 'tilemap') err('maps must have type "tilemap"');
    if (category !== 'map' && entry.type === 'tilemap') err('only category "map" can have type "tilemap"');
    if (category === 'tileset' && entry.type !== 'spritesheet') err('tilesets must have type "spritesheet" (the grid is the tile size)');
    if (!STATUSES.includes(entry.status)) err(`status must be one of ${STATUSES.join(', ')}, found ${JSON.stringify(entry.status)}`);
    if (entry.status === 'placeholder') placeholders.push(label);
    if (entry.status === 'draft') drafts.push(label);
    if (options.noPlaceholders && (entry.status === 'placeholder' || entry.status === 'draft')) {
      err(`is still a ${entry.status} (--no-placeholders)`);
    }
    if (!isText(entry.usage)) err('missing "usage": say where and how the game uses it');

    // Path
    let file: string | null = null;
    if (!isText(entry.path)) err('missing "path"');
    else {
      const p = entry.path;
      const segments = p.split('/');
      const ext = posix.extname(p);
      if (isAbsolute(p) || p.includes('\\') || segments.includes('..') || segments.includes('.') || normalize(p) !== p.split('/').join(sep)) {
        err(`path "${p}" must be a plain relative path inside src/assets (no "..", "./", "\\" or leading "/")`);
      } else {
        const stem = segments.map((s, i) => (i === segments.length - 1 ? s.slice(0, s.length - ext.length) : s));
        if (!stem.every((s) => SEGMENT_RE.test(s))) err(`path "${p}" must use lowercase kebab-case names`);
        if (categoryInfo && segments[0] !== categoryInfo.dir) err(`path must start with "${categoryInfo.dir}/" for category "${category}"`);
        const wantExt = entry.type === 'tilemap' ? '.json' : '.png';
        if (TYPES.includes(entry.type) && ext !== wantExt) err(`path must end in "${wantExt}" for type "${entry.type}"`);
        if (paths.has(p)) err(`path "${p}" is also used by ${paths.get(p)}`);
        paths.set(p, label);
        file = join(assetRoot, p);
        listedFiles.add(p);
        if (!existsSync(file)) {
          err(`file not found: src/assets/${p}`);
          file = null;
        } else {
          // Symlinks could point outside the asset folder; resolve before trusting it.
          const real = relative(realpathSync(assetRoot), realpathSync(file));
          if (real.startsWith('..') || isAbsolute(real)) {
            err(`path "${p}" resolves outside src/assets`);
            file = null;
          } else if (!statSync(file).isFile()) {
            err(`"${p}" is not a file`);
            file = null;
          }
        }
      }
    }

    // Provenance
    const prov = entry.provenance;
    if (typeof prov !== 'object' || prov === null) err('missing "provenance" (origin, author, created, license)');
    else {
      if (!ORIGINS.includes(prov.origin)) err(`provenance.origin must be one of ${ORIGINS.join(', ')}`);
      if (!isText(prov.author)) err('provenance.author is required');
      if (!isText(prov.created) || !DATE_RE.test(prov.created) || Number.isNaN(Date.parse(prov.created))) {
        err('provenance.created must be a date, YYYY-MM-DD');
      }
      if (!LICENSES.includes(prov.license)) err(`provenance.license "${prov.license}" is not accepted; use one of ${LICENSES.join(', ')} (or ask the owner to add one)`);
      if ((prov.origin === 'code-generated' || prov.origin === 'ai-assisted') && !isText(prov.tool)) {
        err(`provenance.tool is required for ${prov.origin} assets (the script, editor or model used)`);
      }
      if (prov.origin === 'third-party') {
        if (!isText(prov.source) || !/^https:\/\//.test(prov.source)) err('provenance.source must be the https URL of a third-party asset');
        if (prov.license === 'owner') err('a third-party asset cannot have license "owner"');
      }
      if (prov.license === 'CC-BY-4.0' && !isText(prov.attribution)) err('provenance.attribution is required for CC-BY-4.0 (the credit line)');
    }

    // Size, grid, animations, transparency
    const isImage = entry.type === 'image' || entry.type === 'spritesheet';
    if (isImage) {
      if (!isPosInt(entry.width) || !isPosInt(entry.height)) err('"width" and "height" (pixels) are required');
      if (!TRANSPARENCIES.includes(entry.transparency!)) err(`"transparency" must be one of ${TRANSPARENCIES.join(', ')}`);
    }
    if (entry.grid !== undefined && (!isPosInt(entry.grid?.width) || !isPosInt(entry.grid?.height))) err('"grid" needs positive integer width and height');
    if ((entry.type === 'spritesheet' || entry.type === 'tilemap') && entry.grid === undefined) err(`"grid" is required for type "${entry.type}"`);
    if (entry.animations !== undefined) {
      if (entry.type !== 'spritesheet') err('only spritesheets can have animations');
      else checkAnimationSpecs(entry.animations, err);
    }
    if (entry.solid !== undefined) {
      if (!isImage) err('only images and spritesheets can have "solid" boxes');
      else checkSolid(entry, err);
    }
    if (entry.palette !== undefined && !palettes.has(entry.palette)) {
      try {
        const palette = loadPalette(entry.palette, paletteDir);
        palettes.set(entry.palette, new Set(palette.colors.map((c) => c.hex.toLowerCase())));
      } catch {
        palettes.set(entry.palette, null);
      }
    }
    if (entry.palette !== undefined && palettes.get(entry.palette) === null) err(`palette "${entry.palette}" not found in art/palettes/`);

    if (!file) return;
    if (isImage) checkImage(entry, file, palettes.get(entry.palette ?? '') ?? null, err);
  });

  // Maps last: they refer to tilesets and sprites by id.
  for (const entry of entries) {
    if (entry?.type !== 'tilemap' || !isText(entry.path) || !listedFiles.has(entry.path)) continue;
    const file = join(assetRoot, entry.path);
    if (existsSync(file)) checkTilemap(entry, file, byId, (msg) => error(entry.id ?? entry.path, msg));
  }

  // Every file in the asset folder needs a manifest entry (that's where its provenance lives).
  for (const p of listFiles(assetRoot)) {
    if (!listedFiles.has(p) && !NOT_ASSETS.has(p)) error(p, 'file is not in manifest.json: add an entry (with provenance) or delete it');
  }

  if (entries.length === 0) warn('manifest', 'no assets listed');
  return { issues, assetCount: entries.length, placeholders, drafts };
}

function checkAnimationSpecs(animations: AnimationSpec[], err: (m: string) => void): void {
  if (!Array.isArray(animations)) return err('"animations" must be an array');
  const names = new Set<string>();
  animations.forEach((a, i) => {
    const label = `animation ${isText(a?.name) ? `"${a.name}"` : `#${i}`}`;
    if (!isText(a?.name) || !NAME_RE.test(a.name)) err(`${label}: name must be kebab-case, e.g. "walk-down"`);
    else if (names.has(a.name)) err(`${label}: duplicate name`);
    else names.add(a.name);
    if (!Number.isInteger(a?.row) || a.row < 0) err(`${label}: "row" must be a whole number ≥ 0`);
    if (!isPosInt(a?.frames)) err(`${label}: "frames" must be a whole number ≥ 1`);
    if (typeof a?.fps !== 'number' || a.fps <= 0 || a.fps > 60) err(`${label}: "fps" must be between 1 and 60`);
    if (typeof a?.loop !== 'boolean') err(`${label}: "loop" must be true or false`);
  });
}

function checkSolid(entry: AssetEntry, err: (m: string) => void): void {
  if (!Array.isArray(entry.solid) || entry.solid.length === 0) return err('"solid" must be a non-empty array of boxes');
  const fw = entry.grid?.width ?? entry.width ?? 0;
  const fh = entry.grid?.height ?? entry.height ?? 0;
  entry.solid.forEach((b: SolidBox, i) => {
    const label = `solid box ${i}`;
    if (!Number.isInteger(b?.x) || !Number.isInteger(b?.y) || b.x < 0 || b.y < 0 || !isPosInt(b?.width) || !isPosInt(b?.height)) {
      return err(`${label}: needs whole-number x, y ≥ 0 and width, height ≥ 1`);
    }
    if (b.x + b.width > fw || b.y + b.height > fh) err(`${label} (${b.x},${b.y} ${b.width}×${b.height}) sticks out of the ${fw}×${fh} ${entry.grid ? 'frame' : 'image'}`);
  });
}

function checkImage(entry: AssetEntry, file: string, palette: Set<string> | null, err: (m: string) => void): void {
  let image: RgbaImage;
  try {
    image = readPng(file);
  } catch (e) {
    return err(`cannot decode ${entry.path} as PNG: ${(e as Error).message}`);
  }
  if (isPosInt(entry.width) && isPosInt(entry.height) && (image.width !== entry.width || image.height !== entry.height)) {
    err(`image is ${image.width}×${image.height}, manifest says ${entry.width}×${entry.height}`);
  }

  // Frames: the grid cells of a spritesheet, or the whole image.
  const grid = entry.grid && isPosInt(entry.grid.width) && isPosInt(entry.grid.height) ? entry.grid : null;
  const fw = grid?.width ?? image.width;
  const fh = grid?.height ?? image.height;
  if (image.width % fw !== 0 || image.height % fh !== 0) {
    return err(`image ${image.width}×${image.height} is not a whole number of ${fw}×${fh} frames`);
  }
  const cols = image.width / fw;
  const rows = image.height / fh;
  const alphaAt = (x: number, y: number) => image.data[(y * image.width + x) * 4 + 3]!;

  for (const a of Array.isArray(entry.animations) ? entry.animations : []) {
    if (!Number.isInteger(a?.row) || !isPosInt(a?.frames)) continue;
    if (a.row >= rows) {
      err(`animation "${a.name}": row ${a.row} is past the last row (${rows - 1})`);
      continue;
    }
    if (a.frames > cols) {
      err(`animation "${a.name}": ${a.frames} frames but the sheet is ${cols} columns wide`);
      continue;
    }
    for (let col = 0; col < a.frames; col++) {
      if (frameIsEmpty(col, a.row)) err(`animation "${a.name}": frame ${col} (column ${col}, row ${a.row}) is empty`);
    }
  }

  function frameIsEmpty(col: number, row: number): boolean {
    for (let y = row * fh; y < (row + 1) * fh; y++) for (let x = col * fw; x < (col + 1) * fw; x++) if (alphaAt(x, y) !== 0) return false;
    return true;
  }

  // Transparency rules.
  if (entry.transparency === 'opaque') {
    const at = firstPixel(image, (_, a) => a < 255);
    if (at) err(`declared opaque but has transparent pixels, first at ${at}`);
  }
  if (entry.transparency === 'transparent') {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let hasClear = false;
        for (let y = row * fh; y < (row + 1) * fh && !hasClear; y++) for (let x = col * fw; x < (col + 1) * fw; x++) if (alphaAt(x, y) === 0) { hasClear = true; break; }
        if (!hasClear) err(`declared transparent but frame (column ${col}, row ${row}) has no transparent pixels: background not removed?`);
      }
    }
  }
  if (!entry.softAlpha) {
    let count = 0;
    let first = '';
    forEachPixel(image, (x, y, _, a) => {
      if (a > 0 && a < 255) {
        if (count++ === 0) first = `${x},${y}`;
      }
    });
    if (count > 0) err(`${count} semi-transparent pixel(s), first at ${first}: pixel art needs alpha 0 or 255 (set "softAlpha": true only for deliberate glows)`);
  }

  // Palette membership, for visible pixels only.
  if (palette) {
    const off = new Map<string, string>();
    let count = 0;
    forEachPixel(image, (x, y, rgb, a) => {
      if (a === 0 || palette.has(rgb)) return;
      count++;
      if (!off.has(rgb) && off.size < 5) off.set(rgb, `${x},${y}`);
    });
    if (count > 0) {
      const sample = [...off].map(([hex, at]) => `${hex} at ${at}`).join(', ');
      err(`${count} pixel(s) use colours outside palette "${entry.palette}": ${sample}${off.size === 5 ? ', …' : ''}`);
    }
  }
}

function forEachPixel(image: RgbaImage, fn: (x: number, y: number, rgb: string, a: number) => void): void {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      fn(x, y, rgbToHex(image.data[i]!, image.data[i + 1]!, image.data[i + 2]!), image.data[i + 3]!);
    }
  }
}

function firstPixel(image: RgbaImage, test: (rgb: string, a: number) => boolean): string | null {
  let found: string | null = null;
  forEachPixel(image, (x, y, rgb, a) => {
    if (!found && test(rgb, a)) found = `${x},${y}`;
  });
  return found;
}

interface TiledTileset {
  tiles?: Array<{ id?: number; properties?: Array<{ name?: string; value?: unknown }> }>;
  name?: string;
  source?: string;
  image?: string;
  firstgid?: number;
  tilewidth?: number;
  tileheight?: number;
  tilecount?: number;
  columns?: number;
  imagewidth?: number;
  imageheight?: number;
  margin?: number;
  spacing?: number;
}

interface TiledLayer {
  name?: string;
  type?: string;
  width?: number;
  height?: number;
  data?: unknown;
  encoding?: string;
  objects?: TiledObject[];
}

interface TiledObject {
  name?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  point?: boolean;
  properties?: Array<{ name?: string; value?: unknown }>;
}

/** Object layers the game understands: things placed by their feet, and solid rectangles. */
const ENTITY_TYPES = ['spawn', 'npc', 'sign', 'prop'] as const;

function checkTilemap(entry: AssetEntry, file: string, byId: Map<string, AssetEntry>, err: (m: string) => void): void {
  let map: {
    orientation?: string;
    infinite?: boolean;
    width?: number;
    height?: number;
    tilewidth?: number;
    tileheight?: number;
    layers?: TiledLayer[];
    tilesets?: TiledTileset[];
  };
  try {
    map = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return err(`cannot parse ${entry.path} as JSON: ${(e as Error).message}`);
  }
  if (map.orientation !== 'orthogonal') err(`map orientation must be "orthogonal", found "${map.orientation}"`);
  if (map.infinite) err('infinite maps are not supported: in Tiled, Map → Map Properties → untick Infinite');
  if (entry.grid && (map.tilewidth !== entry.grid.width || map.tileheight !== entry.grid.height)) {
    err(`map tiles are ${map.tilewidth}×${map.tileheight}, manifest grid says ${entry.grid.width}×${entry.grid.height}`);
  }

  let maxGid = 0;
  for (const ts of map.tilesets ?? []) {
    if (ts.source) {
      err(`tileset "${ts.source}" is external: embed it (Tiled: Map → Embed Tileset) so Phaser can read it`);
      continue;
    }
    const asset = ts.name ? byId.get(ts.name) : undefined;
    if (!asset || asset.category !== 'tileset') {
      err(`tileset name "${ts.name}" must be the id of a tileset in the manifest (e.g. "tiles.terrain")`);
      continue;
    }
    if (ts.tilewidth !== map.tilewidth || ts.tileheight !== map.tileheight) err(`tileset "${ts.name}" tiles are ${ts.tilewidth}×${ts.tileheight}, map tiles are ${map.tilewidth}×${map.tileheight}`);
    if (asset.grid && (ts.tilewidth !== asset.grid.width || ts.tileheight !== asset.grid.height)) err(`tileset "${ts.name}" tile size differs from its manifest grid`);
    if (ts.imagewidth !== asset.width || ts.imageheight !== asset.height) {
      err(`tileset "${ts.name}" image is ${ts.imagewidth}×${ts.imageheight} in the map but ${asset.width}×${asset.height} in the manifest: reload the tileset in Tiled`);
    }
    if ((ts.margin ?? 0) !== 0 || (ts.spacing ?? 0) !== 0) err(`tileset "${ts.name}" must have margin 0 and spacing 0`);
    const expected = posix.relative(posix.dirname(entry.path), asset.path);
    if (ts.image !== expected) err(`tileset "${ts.name}" image is "${ts.image}", expected "${expected}" (relative to the map) so the map opens in Tiled`);
    if (isPosInt(ts.tilecount) && isPosInt(ts.firstgid)) maxGid = Math.max(maxGid, ts.firstgid + ts.tilecount - 1);
  }

  for (const layer of map.layers ?? []) {
    if (layer.type === 'tilelayer') {
      if (layer.encoding && layer.encoding !== 'csv') err(`layer "${layer.name}" uses ${layer.encoding} encoding: in Tiled, set Tile Layer Format to CSV`);
      if (!Array.isArray(layer.data)) continue;
      if (layer.width !== map.width || layer.height !== map.height || layer.data.length !== (map.width ?? 0) * (map.height ?? 0)) {
        err(`layer "${layer.name}" has ${layer.data.length} cells, expected ${map.width}×${map.height}`);
      }
      const bad = (layer.data as number[]).findIndex((g) => !Number.isInteger(g) || (g & GID_MASK) > maxGid);
      if (bad >= 0) err(`layer "${layer.name}" cell ${bad} uses tile ${layer.data[bad]}, but the tilesets only go up to ${maxGid}`);
    }
    if (layer.type === 'objectgroup') {
      for (const obj of layer.objects ?? []) {
        for (const prop of obj.properties ?? []) {
          if (prop.name === 'sprite' && (typeof prop.value !== 'string' || !byId.has(prop.value))) {
            err(`object "${obj.name}" in layer "${layer.name}" uses sprite "${String(prop.value)}", which is not in the manifest`);
          }
        }
      }
    }
  }
  checkPlacementAndReach(map, byId, err);
}

type Rect = { x: number; y: number; width: number; height: number; what: string };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const propValue = (obj: TiledObject, name: string) => {
  const v = obj.properties?.find((p) => p.name === name)?.value;
  return typeof v === 'string' ? v : undefined;
};

/**
 * Checks what the game will do with the map's objects, the way the game does it: entities stand
 * with their feet at (x, y); props and signs are solid where their manifest "solid" boxes say;
 * NPCs are solid at their feet; "collision" layers hold solid rectangles; tiles with the
 * "collides" property are solid. Then walks the player's feet box from the spawn (2 px steps)
 * and makes sure the spawn is free and everything with dialogue can be reached.
 */
function checkPlacementAndReach(
  map: { width?: number; height?: number; tilewidth?: number; tileheight?: number; layers?: TiledLayer[]; tilesets?: TiledTileset[] },
  byId: Map<string, AssetEntry>,
  err: (m: string) => void,
): void {
  const tw = map.tilewidth ?? 0;
  const th = map.tileheight ?? 0;
  const W = (map.width ?? 0) * tw;
  const H = (map.height ?? 0) * th;
  if (!W || !H) return;

  const solids: Rect[] = [];
  const talkTo: Array<{ name: string; x: number; y: number }> = [];
  let spawn: { x: number; y: number } | null = null;

  for (const layer of map.layers ?? []) {
    if (layer.type !== 'objectgroup') continue;
    const isCollision = layer.name === 'collision';
    for (const obj of layer.objects ?? []) {
      const label = `object "${obj.name}" in layer "${layer.name}"`;
      const x = obj.x ?? NaN;
      const y = obj.y ?? NaN;
      if (isCollision) {
        if (obj.point || !isPosInt(Math.round(obj.width ?? 0)) || !isPosInt(Math.round(obj.height ?? 0))) {
          err(`${label}: collision objects must be rectangles with a size`);
          continue;
        }
        if (x < 0 || y < 0 || x + obj.width! > W || y + obj.height! > H) err(`${label}: rectangle sticks out of the ${W}×${H} map`);
        solids.push({ x, y, width: obj.width!, height: obj.height!, what: label });
        continue;
      }
      if (!ENTITY_TYPES.includes(obj.type as (typeof ENTITY_TYPES)[number])) {
        err(`${label}: type "${obj.type}" is not one of ${ENTITY_TYPES.join(', ')} (rectangles go in a layer named "collision")`);
        continue;
      }
      if (!(x >= 0 && x <= W && y >= 0 && y <= H)) {
        err(`${label}: position ${x},${y} is outside the ${W}×${H} map`);
        continue;
      }
      const sprite = propValue(obj, 'sprite');
      const asset = sprite ? byId.get(sprite) : undefined;
      if (obj.type !== 'spawn' && !sprite) err(`${label}: needs a "sprite" property`);
      if (obj.type === 'spawn') {
        if (spawn) err(`${label}: a map has one spawn`);
        spawn = { x, y };
      } else if (obj.type === 'npc') {
        solids.push({ x: x - FEET.width / 2, y: y - FEET.height, width: FEET.width, height: FEET.height, what: label });
      } else if (asset) {
        const fw = asset.grid?.width ?? asset.width ?? 0;
        const fh = asset.grid?.height ?? asset.height ?? 0;
        for (const b of asset.solid ?? []) solids.push({ x: x - fw / 2 + b.x, y: y - fh + b.y, width: b.width, height: b.height, what: `${label} (${sprite})` });
      }
      if (obj.type !== 'spawn' && propValue(obj, 'dialogue')) talkTo.push({ name: obj.name ?? '?', x, y });
    }
  }

  // Colliding tiles, from each tileset's "collides" property.
  const collidingGids = new Set<number>();
  for (const ts of map.tilesets ?? []) {
    for (const t of ts.tiles ?? []) {
      if (t.properties?.some((p) => p.name === 'collides' && p.value === true) && Number.isInteger(t.id)) collidingGids.add((ts.firstgid ?? 1) + t.id!);
    }
  }
  const solidTile = new Set<number>();
  for (const layer of map.layers ?? []) {
    if (layer.type !== 'tilelayer' || !Array.isArray(layer.data)) continue;
    (layer.data as number[]).forEach((g, i) => collidingGids.has(g & GID_MASK) && solidTile.add(i));
  }

  const blockedBy = (fx: number, fy: number): string | null => {
    const feet: Rect = { x: fx - FEET.width / 2, y: fy - FEET.height, width: FEET.width, height: FEET.height, what: 'player' };
    if (feet.x < 0 || feet.y < 0 || feet.x + feet.width > W || feet.y + feet.height > H) return 'the edge of the map';
    for (let ty = Math.floor(feet.y / th); ty <= Math.floor((feet.y + feet.height - 1) / th); ty++) {
      for (let tx = Math.floor(feet.x / tw); tx <= Math.floor((feet.x + feet.width - 1) / tw); tx++) {
        if (solidTile.has(ty * (map.width ?? 0) + tx)) return `a colliding tile at ${tx},${ty}`;
      }
    }
    return solids.find((r) => overlaps(feet, r))?.what ?? null;
  };

  if (!spawn) {
    if (talkTo.length) err('the map has things to talk to but no "spawn" object, so reachability can\'t be checked');
    return;
  }
  const start: { x: number; y: number } = spawn;
  const blocker = blockedBy(start.x, start.y);
  if (blocker) return err(`the spawn at ${start.x},${start.y} is blocked by ${blocker}: the player would start stuck`);

  // Flood fill over feet positions, 2 px apart, from the spawn.
  const STEP = 2;
  const seen = new Set<string>();
  const reached: Array<[number, number]> = [];
  const queue: Array<[number, number]> = [[start.x, start.y]];
  seen.add(`${start.x},${start.y}`);
  while (queue.length) {
    const [cx, cy] = queue.pop()!;
    reached.push([cx, cy]);
    for (const [dx, dy] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]] as const) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!blockedBy(nx, ny)) queue.push([nx, ny]);
    }
  }
  for (const t of talkTo) {
    const ok = reached.some(([x, y]) => Math.hypot(x - t.x, y - t.y) <= INTERACT_RANGE);
    if (!ok) err(`"${t.name}" can't be reached: no free spot within ${INTERACT_RANGE} px of it is walkable from the spawn`);
  }
}

/** Every file under root, as forward-slash paths relative to root. */
function listFiles(root: string, dir = root): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = join(dir, d.name);
    if (d.isDirectory()) return listFiles(root, full);
    return [relative(root, full).split(sep).join('/')];
  });
}
