// Regenerates every code-drawn placeholder asset, plus the palette files for editors.
//   npm run art:generate
// Output is deterministic: running it twice gives byte-identical files.
// It only writes the files listed below; it never touches the manifest or other assets.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PixelCanvas } from './draw.ts';
import { writePng } from './png.ts';
import { PALETTE_DIR, colorsByName, loadPalette, type Palette } from './palette.ts';
import { characterSheet } from './placeholders/characters.ts';
import { terrainTileset } from './placeholders/terrain.ts';
import { dialogueBox, interactPrompt, shadow, sign } from './placeholders/props.ts';
import { previewMap } from './placeholders/map.ts';

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

console.log('Generating placeholder art:');
out('characters/player.png', characterSheet(
  {
    outline: c('ink'),
    blush: c('blush'),
    hair: { base: c('bark'), shade: c('bark-dark') },
    skin: { base: c('skin'), shade: c('skin-shade') },
    shirt: { base: c('denim-light'), shade: c('denim') },
    belt: { base: c('bark-dark') },
    trousers: { base: c('bark-dark'), shade: c('plum') },
    boots: { base: c('bark'), shade: c('bark-dark') },
  },
  true,
  'char.player',
));
out('characters/npc-guide.png', characterSheet(
  {
    outline: c('ink'),
    blush: c('blush'),
    hair: { base: c('stone-light'), shade: c('stone') },
    skin: { base: c('skin-shade'), shade: c('bark') },
    shirt: { base: c('moss'), shade: c('moss-dark') },
    belt: { base: c('gold') },
    trousers: { base: c('wood'), shade: c('bark') },
    boots: { base: c('bark-dark'), shade: c('plum') },
  },
  false,
  'char.npc-guide',
));
out('tiles/terrain.png', terrainTileset(c));
out('objects/sign.png', sign(c));
out('ui/dialogue-box.png', dialogueBox(c));
out('ui/prompt.png', interactPrompt(c));
out('effects/shadow.png', shadow(c));

const mapPath = join(ASSETS, 'maps/art-preview.json');
mkdirSync(dirname(mapPath), { recursive: true });
writeFileSync(mapPath, JSON.stringify(previewMap('tiles.terrain', '../tiles/terrain.png'), null, 1) + '\n');
console.log('  src/assets/maps/art-preview.json');

writeGpl(palette);
writeSwatch(palette);
console.log(`  art/palettes/${PALETTE_ID}.gpl, ${PALETTE_ID}.png`);
console.log('Done. Run `npm run art:validate` next.');
