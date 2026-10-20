// Images with fixed URLs in public/ (they can't be hashed): the link-preview picture and the
// icons. They are drawn from the game's own generated art, never by hand: a crop of the Starting
// Village rendered the way world.ts draws it (tile layers, then sprites sorted by their feet),
// shown at a whole-number scale so every game pixel stays square (art bible: one pixel size).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { readPng, writePng, type RgbaImage } from './png.ts';

const ROOT = join(import.meta.dirname, '../..');
const ASSETS = join(ROOT, 'src/assets');
const PUBLIC = join(ROOT, 'public');
/** Tiled stores flip flags in the top bits of a tile number. */
const GID_MASK = 0x1fffffff;

interface Asset {
  id: string;
  path: string;
  width?: number;
  height?: number;
  grid?: { width: number; height: number };
}
interface MapObject {
  name?: string;
  type: string;
  x: number;
  y: number;
  properties?: Array<{ name: string; value: string }>;
}

const manifest = JSON.parse(readFileSync(join(ASSETS, 'manifest.json'), 'utf8')) as { assets: Asset[] };
const byId = new Map(manifest.assets.map((a) => [a.id, a]));
const images = new Map<string, RgbaImage>();
const image = (path: string) => images.get(path) ?? images.set(path, readPng(join(ASSETS, path))).get(path)!;

function canvas(width: number, height: number): RgbaImage {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

/** Copies a rectangle, skipping transparent pixels (the art has hard alpha: 0 or 255). */
function draw(dst: RgbaImage, src: RgbaImage, sx: number, sy: number, w: number, h: number, dx: number, dy: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tx = dx + x;
      const ty = dy + y;
      if (tx < 0 || ty < 0 || tx >= dst.width || ty >= dst.height) continue;
      const i = ((sy + y) * src.width + sx + x) * 4;
      if (src.data[i + 3] === 0) continue;
      dst.data.set(src.data.subarray(i, i + 4), (ty * dst.width + tx) * 4);
    }
  }
}

function fill(dst: RgbaImage, hex: string): void {
  const n = Number.parseInt(hex.slice(1), 16);
  for (let i = 0; i < dst.data.length; i += 4) dst.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], i);
}

/** Nearest-neighbour enlargement by a whole number: each pixel becomes a scale × scale block. */
function enlarge(src: RgbaImage, scale: number): RgbaImage {
  const out = canvas(src.width * scale, src.height * scale);
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const i = (Math.floor(y / scale) * src.width + Math.floor(x / scale)) * 4;
      out.data.set(src.data.subarray(i, i + 4), (y * out.width + x) * 4);
    }
  }
  return out;
}

function crop(src: RgbaImage, x: number, y: number, w: number, h: number): RgbaImage {
  const out = canvas(w, h);
  draw(out, src, x, y, w, h, 0, 0);
  return out;
}

/** The whole village at one screen pixel per game pixel, plus extra sprites placed for the picture (e.g. the player). */
function renderVillage(extra: MapObject[]): RgbaImage {
  const map = JSON.parse(readFileSync(join(ASSETS, 'maps/village.json'), 'utf8'));
  const tw: number = map.tilewidth;
  const out = canvas(map.width * tw, map.height * map.tileheight);
  const tilesets = (map.tilesets as Array<{ firstgid: number; image: string; columns: number }>)
    .map((t) => ({ ...t, png: image(join('maps', t.image)) }))
    .sort((a, b) => b.firstgid - a.firstgid);
  for (const layer of map.layers.filter((l: { type: string }) => l.type === 'tilelayer')) {
    (layer.data as number[]).forEach((raw, i) => {
      const gid = raw & GID_MASK;
      if (!gid) return;
      const ts = tilesets.find((t) => gid >= t.firstgid)!;
      const local = gid - ts.firstgid;
      draw(out, ts.png, (local % ts.columns) * tw, Math.floor(local / ts.columns) * tw, tw, tw, (i % map.width) * tw, Math.floor(i / map.width) * tw);
    });
  }
  const objects = (map.layers.find((l: { name: string }) => l.name === 'entities').objects as MapObject[])
    .filter((o) => o.type !== 'spawn')
    .concat(extra);
  // Depth = feet y, as in the game, so the player stands in front of what is behind them.
  for (const o of objects.sort((a, b) => a.y - b.y)) {
    const id = o.properties?.find((p) => p.name === 'sprite')?.value;
    const asset = id ? byId.get(id) : undefined;
    if (!asset) continue;
    const fw = asset.grid?.width ?? asset.width!;
    const fh = asset.grid?.height ?? asset.height!;
    const row = Number(o.properties?.find((p) => p.name === 'row')?.value ?? 0);
    draw(out, image(asset.path), 0, row * fh, fw, fh, Math.round(o.x - fw / 2), o.y - fh);
  }
  return out;
}

/** An .ico holding one PNG: every browser that asks for /favicon.ico understands it. */
function writeIco(path: string, png: RgbaImage): void {
  const encoded = new PNG({ width: png.width, height: png.height });
  encoded.data = Buffer.from(png.data);
  const body = PNG.sync.write(encoded, { colorType: 6 });
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(png.width % 256, 6);
  header.writeUInt8(png.height % 256, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(body.length, 14);
  header.writeUInt32LE(22, 18); // image data offset
  writeFileSync(path, Buffer.concat([header, body]));
}

export function writeSiteImages(paperHex: string): void {
  // Link preview, 1200 × 630 (the size LinkedIn, Slack and X expect): 600 × 316 game pixels of the
  // square (workshop, notice board, lamps, the guide) at ×2, with the player walking up to the
  // board. 316 × 2 = 632, so the bottom two screen pixels are trimmed; still whole game pixels.
  const scene = renderVillage([{ name: 'player', type: 'npc', x: 464, y: 412, properties: [{ name: 'sprite', value: 'char.player' }, { name: 'row', value: '3' }] }]);
  writePng(join(PUBLIC, 'og-image.png'), crop(enlarge(crop(scene, 144, 116, 600, 316), 2), 0, 0, 1200, 630));

  // Icons: the player's head (32 × 32 from the idle-down frame), on paper.
  const player = byId.get('char.player')!;
  const head = canvas(32, 32);
  fill(head, paperHex);
  draw(head, image(player.path), 8, 2, 32, 32, 0, 0);
  writePng(join(PUBLIC, 'favicon.png'), head);
  writeIco(join(PUBLIC, 'favicon.ico'), head);
  // Apple touch icon: 180 × 180, the head at ×5 (160) centred on a 10 px paper margin.
  const touch = canvas(180, 180);
  fill(touch, paperHex);
  draw(touch, enlarge(head, 5), 0, 0, 160, 160, 10, 10);
  writePng(join(PUBLIC, 'apple-touch-icon.png'), touch);
  console.log('  public/og-image.png, favicon.png, favicon.ico, apple-touch-icon.png');
}
