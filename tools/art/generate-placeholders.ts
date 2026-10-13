// Regenerates every code-drawn placeholder asset, plus the palette files for editors.
//   npm run art:generate
// Output is deterministic: running it twice gives byte-identical files.
// It only writes the files listed below; it never touches the manifest or other assets.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PixelCanvas } from './draw.ts';
import { writePng } from './png.ts';
import { PALETTE_DIR, colorsByName, loadPalette, type Palette } from './palette.ts';
import { characterSheet } from './characters/compose.ts';
import { GUIDE } from './characters/guide.ts';
import { PLAYER } from './characters/player.ts';
import { KEEPER } from './characters/keeper.ts';
import { SAGE } from './characters/sage.ts';
import { GUILDMASTER } from './characters/guildmaster.ts';
import { COURIER } from './characters/courier.ts';
import { INTERIOR_TILES, COLUMNS as INTERIOR_COLUMNS, interiorTileset } from './interior/tiles.ts';
import { bookshelf, hearth, lectern, plaque, portal, table } from './interior/props.ts';
import { guildMap, towerMap } from './interior/maps.ts';
import { DUNGEON_TILES, COLUMNS as DUNGEON_COLUMNS } from './dungeon/tiles.ts';
import { terrainTileset } from './placeholders/terrain.ts';
import { dialogueBox, interactPrompt, shadow, sign } from './placeholders/props.ts';
import { previewMap } from './placeholders/map.ts';
import { villageTileset } from './village/tiles.ts';
import { arch, birch, crates, house, lamp, noticeBoard, pine } from './village/props.ts';
import { villageMap } from './village/map.ts';
import { dungeonTileset } from './dungeon/tiles.ts';
import { cellar, chest, stairsUp, torch } from './dungeon/props.ts';
import { dungeonMap } from './dungeon/map.ts';

const ASSETS = join(import.meta.dirname, '../../src/assets');
const PALETTE_ID = 'baltibytes-v0';

const palette = loadPalette(PALETTE_ID);
const c = colorsByName(palette);

function out(path: string, image: PixelCanvas): void {
  writePng(join(ASSETS, path), image);
  console.log(`  src/assets/${path}`);
}

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

console.log('Generating code-drawn art:');
out('characters/player.png', characterSheet(PLAYER, c));
out('characters/npc-guide.png', characterSheet(GUIDE, c));
out('characters/npc-keeper.png', characterSheet(KEEPER, c));
out('characters/npc-sage.png', characterSheet(SAGE, c));
out('characters/npc-guildmaster.png', characterSheet(GUILDMASTER, c));
out('characters/npc-courier.png', characterSheet(COURIER, c));
out('tiles/terrain.png', terrainTileset(c));
out('objects/sign.png', sign(c));
out('ui/dialogue-box.png', dialogueBox(c));
out('ui/prompt.png', interactPrompt(c));
out('effects/shadow.png', shadow(c));

// Starting Village
out('tiles/village.png', villageTileset(c));
out('objects/house.png', house(c));
out('objects/tree-pine.png', pine(c));
out('objects/tree-birch.png', birch(c));
out('objects/arch.png', arch(c));
out('objects/noticeboard.png', noticeBoard(c));
out('objects/lamp.png', lamp(c));
out('objects/crates.png', crates(c));
out('objects/cellar.png', cellar(c));

// Dungeon
out('tiles/dungeon.png', dungeonTileset(c));
out('objects/torch.png', torch(c));
out('objects/chest.png', chest(c));
out('objects/stairs-up.png', stairsUp(c));

// Skill Tower and Guild Hall
out('tiles/interior.png', interiorTileset(c));
out('objects/bookshelf.png', bookshelf(c));
out('objects/lectern.png', lectern(c));
out('objects/hearth.png', hearth(c));
out('objects/table.png', table(c));
out('objects/plaque.png', plaque(c));

// Exit Portal
out('objects/portal.png', portal(c));

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
console.log('Done. Run `npm run art:validate` next.');
