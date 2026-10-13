// Run with `npm test`. Each case starts from a small valid fixture, breaks one thing on purpose
// and checks the validator reports it, with the asset and a useful message.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PixelCanvas } from './draw.ts';
import { writePng } from './png.ts';
import { validateAssets, type Issue } from './validate-assets.ts';

const INK = '#2a1e2b';
const GRASS = '#6aa04a';

interface Fixture {
  root: string;
  assets: string;
  palettes: string;
  manifest: { version: number; assets: Array<Record<string, any>> };
  run: (opts?: { noPlaceholders?: boolean }) => Issue[];
}

const provenance = { origin: 'code-generated', author: 'Test', created: '2026-10-13', license: 'owner', tool: 'test' };

/** A valid little asset folder: a 2-frame sprite sheet, an opaque tileset and a map using it. */
function fixture(): Fixture {
  const root = mkdtempSync(join(tmpdir(), 'art-validate-'));
  const assets = join(root, 'assets');
  const palettes = join(root, 'palettes');
  mkdirSync(palettes, { recursive: true });
  writeFileSync(join(palettes, 'test.json'), JSON.stringify({ id: 'test', status: 'test', description: '', colors: [{ name: 'ink', hex: INK, use: '' }, { name: 'grass', hex: GRASS, use: '' }] }));

  const sheet = new PixelCanvas(32, 16);
  sheet.rect(4, 4, 8, 8, INK);
  sheet.rect(20, 4, 8, 8, INK);
  writePng(join(assets, 'characters/hero.png'), sheet);

  const tiles = new PixelCanvas(32, 16);
  tiles.rect(0, 0, 32, 16, GRASS);
  writePng(join(assets, 'tiles/ground.png'), tiles);

  mkdirSync(join(assets, 'maps'), { recursive: true });
  writeFileSync(join(assets, 'maps/test.json'), JSON.stringify(tiledMap()));

  const manifest = {
    version: 1,
    assets: [
      { id: 'char.hero', path: 'characters/hero.png', category: 'character', type: 'spritesheet', status: 'production', usage: 'test', width: 32, height: 16, grid: { width: 16, height: 16 }, animations: [{ name: 'walk-down', row: 0, frames: 2, fps: 8, loop: true }], transparency: 'transparent', palette: 'test', provenance: { ...provenance } },
      { id: 'tiles.ground', path: 'tiles/ground.png', category: 'tileset', type: 'spritesheet', status: 'production', usage: 'test', width: 32, height: 16, grid: { width: 16, height: 16 }, transparency: 'opaque', palette: 'test', provenance: { ...provenance } },
      { id: 'map.test', path: 'maps/test.json', category: 'map', type: 'tilemap', status: 'production', usage: 'test', grid: { width: 16, height: 16 }, provenance: { ...provenance } },
    ],
  };
  const fx: Fixture = {
    root,
    assets,
    palettes,
    manifest,
    run: (opts = {}) => {
      writeFileSync(join(assets, 'manifest.json'), JSON.stringify(fx.manifest));
      return validateAssets({ assetRoot: assets, paletteDir: palettes, ...opts }).issues;
    },
  };
  return fx;
}

/** A 6 × 4 tile map (96 × 64 px): the player spawns on the left, a talking NPC stands on the right. */
function tiledMap() {
  return {
    orientation: 'orthogonal', infinite: false, width: 6, height: 4, tilewidth: 16, tileheight: 16,
    layers: [
      { name: 'ground', type: 'tilelayer', width: 6, height: 4, data: Array.from({ length: 24 }, () => 1) },
      {
        name: 'entities', type: 'objectgroup', objects: [
          { name: 'hero', type: 'npc', point: true, x: 72, y: 40, properties: [{ name: 'sprite', value: 'char.hero' }, { name: 'dialogue', value: 'hello' }] },
          { name: 'start', type: 'spawn', point: true, x: 16, y: 40 },
        ] as Array<Record<string, any>>,
      },
      { name: 'collision', type: 'objectgroup', objects: [] as Array<Record<string, any>> },
    ],
    tilesets: [{
      firstgid: 1, name: 'tiles.ground', image: '../tiles/ground.png', imagewidth: 32, imageheight: 16, tilewidth: 16, tileheight: 16, tilecount: 2, columns: 2, margin: 0, spacing: 0,
      tiles: [{ id: 1, properties: [{ name: 'collides', type: 'bool', value: true }] }],
    }],
  };
}

function withFixture(fn: (fx: Fixture) => void) {
  const fx = fixture();
  try {
    fn(fx);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
}

function expectError(issues: Issue[], asset: string, pattern: RegExp) {
  const hit = issues.find((i) => i.level === 'error' && i.asset === asset && pattern.test(i.message));
  assert.ok(hit, `expected an error for ${asset} matching ${pattern}; got:\n${issues.map((i) => `  ${i.asset}: ${i.message}`).join('\n') || '  (none)'}`);
}

test('the valid fixture has no issues', () => withFixture((fx) => assert.deepEqual(fx.run(), [])));

test('the real project assets validate', () => {
  const issues = validateAssets({ assetRoot: join(import.meta.dirname, '../../src/assets') }).issues;
  assert.deepEqual(issues.filter((i) => i.level === 'error'), []);
});

test('missing file', () => withFixture((fx) => {
  fx.manifest.assets[0]!.path = 'characters/nobody.png';
  expectError(fx.run(), 'char.hero', /file not found: src\/assets\/characters\/nobody\.png/);
}));

test('file that is not a PNG', () => withFixture((fx) => {
  writeFileSync(join(fx.assets, 'characters/hero.png'), 'not a png');
  expectError(fx.run(), 'char.hero', /cannot decode/);
}));

test('declared size differs from the image', () => withFixture((fx) => {
  fx.manifest.assets[0]!.width = 48;
  expectError(fx.run(), 'char.hero', /image is 32×16, manifest says 48×16/);
}));

test('sheet is not a whole number of frames', () => withFixture((fx) => {
  fx.manifest.assets[0]!.grid = { width: 12, height: 16 };
  expectError(fx.run(), 'char.hero', /not a whole number of 12×16 frames/);
}));

test('animation longer than the sheet is wide', () => withFixture((fx) => {
  fx.manifest.assets[0]!.animations[0].frames = 3;
  expectError(fx.run(), 'char.hero', /3 frames but the sheet is 2 columns wide/);
}));

test('animation row past the end of the sheet', () => withFixture((fx) => {
  fx.manifest.assets[0]!.animations[0].row = 1;
  expectError(fx.run(), 'char.hero', /row 1 is past the last row/);
}));

test('empty animation frame', () => withFixture((fx) => {
  const sheet = new PixelCanvas(32, 16);
  sheet.rect(4, 4, 8, 8, INK);
  writePng(join(fx.assets, 'characters/hero.png'), sheet);
  expectError(fx.run(), 'char.hero', /frame 1 .* is empty/);
}));

test('sprite exported without a transparent background', () => withFixture((fx) => {
  const sheet = new PixelCanvas(32, 16);
  sheet.rect(0, 0, 32, 16, GRASS);
  writePng(join(fx.assets, 'characters/hero.png'), sheet);
  expectError(fx.run(), 'char.hero', /frame \(column 0, row 0\) has no transparent pixels/);
}));

test('opaque asset with holes', () => withFixture((fx) => {
  const tiles = new PixelCanvas(32, 16);
  tiles.rect(0, 0, 31, 16, GRASS);
  writePng(join(fx.assets, 'tiles/ground.png'), tiles);
  expectError(fx.run(), 'tiles.ground', /declared opaque but has transparent pixels, first at 31,0/);
}));

test('semi-transparent pixels (soft edges)', () => withFixture((fx) => {
  const sheet = new PixelCanvas(32, 16);
  sheet.rect(4, 4, 8, 8, INK);
  sheet.rect(20, 4, 8, 8, INK);
  sheet.data[(5 * 32 + 5) * 4 + 3] = 128;
  writePng(join(fx.assets, 'characters/hero.png'), sheet);
  expectError(fx.run(), 'char.hero', /1 semi-transparent pixel\(s\), first at 5,5/);
}));

test('colour outside the palette', () => withFixture((fx) => {
  const sheet = new PixelCanvas(32, 16);
  sheet.rect(4, 4, 8, 8, INK);
  sheet.rect(20, 4, 8, 8, '#ff00ff');
  writePng(join(fx.assets, 'characters/hero.png'), sheet);
  expectError(fx.run(), 'char.hero', /64 pixel\(s\) use colours outside palette "test": #ff00ff at 20,4/);
}));

test('duplicate id', () => withFixture((fx) => {
  fx.manifest.assets.push({ ...fx.manifest.assets[0]!, path: 'characters/hero-2.png' });
  writePng(join(fx.assets, 'characters/hero-2.png'), new PixelCanvas(32, 16));
  expectError(fx.run(), 'char.hero', /duplicate id/);
}));

test('path escaping the asset folder', () => withFixture((fx) => {
  fx.manifest.assets[0]!.path = '../secret.png';
  expectError(fx.run(), 'char.hero', /plain relative path inside src\/assets/);
}));

test('symlink pointing outside the asset folder', () => withFixture((fx) => {
  writePng(join(fx.root, 'outside.png'), new PixelCanvas(32, 16));
  symlinkSync(join(fx.root, 'outside.png'), join(fx.assets, 'characters/linked.png'));
  fx.manifest.assets[0]!.path = 'characters/linked.png';
  expectError(fx.run(), 'char.hero', /resolves outside src\/assets/);
}));

test('file in the wrong category folder', () => withFixture((fx) => {
  fx.manifest.assets[0]!.category = 'object';
  const issues = fx.run();
  expectError(issues, 'char.hero', /must start with "objects\/"/);
  expectError(issues, 'char.hero', /must start with "obj\."/);
}));

test('missing licence', () => withFixture((fx) => {
  delete fx.manifest.assets[0]!.provenance.license;
  expectError(fx.run(), 'char.hero', /provenance\.license "undefined" is not accepted/);
}));

test('third-party asset without a source URL or attribution', () => withFixture((fx) => {
  fx.manifest.assets[0]!.provenance = { origin: 'third-party', author: 'Someone', created: '2026-10-13', license: 'CC-BY-4.0' };
  const issues = fx.run();
  expectError(issues, 'char.hero', /source must be the https URL/);
  expectError(issues, 'char.hero', /attribution is required for CC-BY-4.0/);
}));

test('file on disk that is not in the manifest', () => withFixture((fx) => {
  writePng(join(fx.assets, 'objects/stray.png'), new PixelCanvas(8, 8));
  expectError(fx.run(), 'objects/stray.png', /not in manifest\.json/);
}));

test('map refers to a tileset that is not in the manifest', () => withFixture((fx) => {
  const map = tiledMap();
  map.tilesets[0]!.name = 'tiles.unknown';
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /tileset name "tiles\.unknown" must be the id of a tileset/);
}));

test('map uses a tile the tileset does not have', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[0]!.data![1] = 3;
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /cell 1 uses tile 3, but the tilesets only go up to 2/);
}));

test('map object uses an unknown sprite', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[1]!.objects![0]!.properties[0]!.value = 'char.ghost';
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /sprite "char\.ghost", which is not in the manifest/);
}));

test('--no-placeholders turns placeholders and drafts into errors', () => withFixture((fx) => {
  fx.manifest.assets[0]!.status = 'placeholder';
  fx.manifest.assets[1]!.status = 'draft';
  assert.deepEqual(fx.run(), []);
  const issues = fx.run({ noPlaceholders: true });
  expectError(issues, 'char.hero', /still a placeholder/);
  expectError(issues, 'tiles.ground', /still a draft/);
}));

test('unknown status', () => withFixture((fx) => {
  fx.manifest.assets[0]!.status = 'final';
  expectError(fx.run(), 'char.hero', /status must be one of placeholder, draft, production/);
}));

test('solid box outside the frame', () => withFixture((fx) => {
  fx.manifest.assets[0]!.solid = [{ x: 10, y: 10, width: 8, height: 8 }];
  expectError(fx.run(), 'char.hero', /solid box 0 \(10,10 8×8\) sticks out of the 16×16 frame/);
}));

test('spawn inside a collision rectangle', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[2]!.objects!.push({ name: 'rock', type: 'solid', x: 8, y: 30, width: 16, height: 16 });
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /spawn at 16,40 is blocked by object "rock"/);
}));

test('NPC walled off by collision rectangles', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[2]!.objects!.push({ name: 'wall', type: 'solid', x: 40, y: 0, width: 8, height: 64 });
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /"hero" can't be reached/);
}));

test('NPC walled off by colliding tiles', () => withFixture((fx) => {
  const map = tiledMap();
  for (let row = 0; row < 4; row++) map.layers[0]!.data![row * 6 + 3] = 2;
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /"hero" can't be reached/);
}));

test('the same wall with a gap is fine', () => withFixture((fx) => {
  const map = tiledMap();
  for (let row = 0; row < 3; row++) map.layers[0]!.data![row * 6 + 3] = 2;
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  assert.deepEqual(fx.run(), []);
}));

test('unknown object type and point collision objects', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[1]!.objects!.push({ name: 'thing', type: 'chest', point: true, x: 10, y: 10 });
  map.layers[2]!.objects!.push({ name: 'dot', type: 'solid', point: true, x: 5, y: 5 });
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  const issues = fx.run();
  expectError(issues, 'map.test', /type "chest" is not one of spawn, arrive, npc, sign, prop, portal/);
  expectError(issues, 'map.test', /collision objects must be rectangles/);
}));

/** The fixture map plus a portal back into itself and the arrival it needs. */
function mapWithPortal(portal: Record<string, unknown> = {}) {
  const map = tiledMap();
  map.layers[1]!.objects!.push(
    { name: 'door', type: 'portal', x: 80, y: 8, width: 10, height: 8, properties: [{ name: 'to', value: 'map.test' }, { name: 'arrive', value: 'back' }], ...portal },
    { name: 'back', type: 'arrive', point: true, x: 40, y: 40 },
  );
  return map;
}

test('a portal and its arrival are fine', () => withFixture((fx) => {
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(mapWithPortal()));
  assert.deepEqual(fx.run(), []);
}));

test('a locked portal is a wall you can still reach and knock on', () => withFixture((fx) => {
  const map = mapWithPortal();
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  writeFileSync(join(fx.assets, 'manifest.json'), JSON.stringify(fx.manifest));
  const locked = { 'map.test': 'closed' };
  assert.deepEqual(validateAssets({ assetRoot: fx.assets, paletteDir: fx.palettes, locked }).issues, []);
  // Solid: an arrival standing inside it is blocked.
  map.layers[1]!.objects!.push({ name: 'stuck', type: 'arrive', point: true, x: 85, y: 16 });
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  const issues = validateAssets({ assetRoot: fx.assets, paletteDir: fx.palettes, locked }).issues;
  expectError(issues, 'map.test', /arrival "stuck" at 85,16 is blocked by object "door" in layer "entities" \(locked\)/);
}));

test('portal to a map that does not exist', () => withFixture((fx) => {
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(mapWithPortal({ properties: [{ name: 'to', value: 'map.nowhere' }, { name: 'arrive', value: 'back' }] })));
  expectError(fx.run(), 'map.test', /leads to "map\.nowhere", which is not a map in the manifest/);
}));

test('portal to an arrival that does not exist', () => withFixture((fx) => {
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(mapWithPortal({ properties: [{ name: 'to', value: 'map.test' }, { name: 'arrive', value: 'cellar' }] })));
  expectError(fx.run(), 'map.test', /arrives at "cellar", but map\.test has no "arrive" object/);
}));

test('portal behind a wall', () => withFixture((fx) => {
  const map = mapWithPortal();
  map.layers[2]!.objects!.push({ name: 'wall', type: 'solid', x: 64, y: 0, width: 32, height: 24 });
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  expectError(fx.run(), 'map.test', /portal "door" can't be reached/);
}));

test('panel that is not in the content', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[1]!.objects!.push(
    { name: 'chest', type: 'prop', point: true, x: 48, y: 40, properties: [{ name: 'sprite', value: 'char.hero' }, { name: 'panel', value: 'project:secret-project' }] },
    { name: 'tome', type: 'prop', point: true, x: 56, y: 40, properties: [{ name: 'sprite', value: 'char.hero' }, { name: 'panel', value: 'skills' }] },
  );
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  const issues = fx.run();
  expectError(issues, 'map.test', /panel "project:secret-project" is not something in src\/content/);
  expectError(issues, 'map.test', /panel "skills" is not something in src\/content/);
}));

test('panels for a real project, skill category, role, the overview and contact are fine', () => withFixture((fx) => {
  const map = tiledMap();
  map.layers[1]!.objects!.push(
    ...['project:portio', 'skills:languages', 'role:independent', 'experience', 'contact'].map((panel, i) => ({ name: `p${i}`, type: 'prop', point: true, x: 40 + i * 4, y: 56, properties: [{ name: 'sprite', value: 'char.hero' }, { name: 'panel', value: panel }] })),
  );
  writeFileSync(join(fx.assets, 'maps/test.json'), JSON.stringify(map));
  assert.deepEqual(fx.run(), []);
}));
