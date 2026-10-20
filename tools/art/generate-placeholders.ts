// Regenerates what this repo still draws itself: the Tiled maps, the palette files for editors
// and the fixed-URL site images (link preview, icons).
//   npm run art:generate
// Output is deterministic: running it twice gives byte-identical files.
// The sprites and tilesets are painted at 2× by the sibling assetGenerator repo
// (`assetgen export designs/baltibytes/export.py`, art/README.md → Workflows), which writes them
// into src/assets/; this script never touches them, the manifest or any other asset.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PixelCanvas } from './draw.ts';
import { writePng } from './png.ts';
import { PALETTE_DIR, colorsByName, loadPalette, type Palette } from './palette.ts';
import { INTERIOR_TILES, COLUMNS as INTERIOR_COLUMNS } from './interior/tiles.ts';
import { guildMap, towerMap } from './interior/maps.ts';
import { DUNGEON_TILES, COLUMNS as DUNGEON_COLUMNS } from './dungeon/tiles.ts';
import { previewMap } from './placeholders/map.ts';
import { villageMap } from './village/map.ts';
import { dungeonMap } from './dungeon/map.ts';
import { writeSiteImages } from './site-images.ts';

const ASSETS = join(import.meta.dirname, '../../src/assets');
const PALETTE_ID = 'baltibytes-v0';

const palette = loadPalette(PALETTE_ID);
const c = colorsByName(palette);

/** GIMP palette: Aseprite, LibreSprite, Pixelorama and GIMP all import it. */
function writeGpl(p: Palette): void {
  const lines = ['GIMP Palette', `Name: ${p.id}`, 'Columns: 8', '#'];
  for (const color of p.colors) {
    const n = Number.parseInt(color.hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => String(v).padStart(3)).join(' ');
    lines.push(`${rgb}\t${color.name}`);
  }
  writeFileSync(join(PALETTE_DIR, `${p.id}.gpl`), lines.join('\n') + '\n');
}

/** One 8 × 8 swatch per colour, 8 per row: for eyedroppers and quick review. */
function writeSwatch(p: Palette): void {
  const perRow = 8;
  const canvas = new PixelCanvas(perRow * 8, Math.ceil(p.colors.length / perRow) * 8);
  p.colors.forEach((color, i) => canvas.rect((i % perRow) * 8, Math.floor(i / perRow) * 8, 8, 8, color.hex));
  writePng(join(PALETTE_DIR, `${p.id}.png`), canvas);
}

console.log('Generating maps:');
function writeMap(path: string, map: object): void {
  const full = join(ASSETS, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(map, null, 1) + '\n');
  console.log(`  src/assets/${path}`);
}
writeMap('maps/art-preview.json', previewMap('tiles.terrain', '../tiles/terrain.png'));
writeMap('maps/dungeon.json', dungeonMap({ dungeon: { id: 'tiles.dungeon', image: '../tiles/dungeon.png' }, village: { id: 'tiles.village', image: '../tiles/village.png' } }));
const indoorTilesets = [
  { key: 'dungeon', id: 'tiles.dungeon', image: '../tiles/dungeon.png', columns: DUNGEON_COLUMNS, tiles: DUNGEON_TILES },
  { key: 'interior', id: 'tiles.interior', image: '../tiles/interior.png', columns: INTERIOR_COLUMNS, tiles: INTERIOR_TILES },
];
writeMap('maps/tower.json', towerMap(indoorTilesets));
writeMap('maps/guildhall.json', guildMap(indoorTilesets));
writeMap('maps/village.json', villageMap({ terrain: { id: 'tiles.terrain', image: '../tiles/terrain.png' }, village: { id: 'tiles.village', image: '../tiles/village.png' } }));

writeGpl(palette);
writeSwatch(palette);
console.log(`  art/palettes/${PALETTE_ID}.gpl, ${PALETTE_ID}.png`);
// Last, because it draws from the files written above.
writeSiteImages(c('paper'));
console.log('Done. Run `npm run art:validate` next.');
