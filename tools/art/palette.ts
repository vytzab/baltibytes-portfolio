// Loads a palette from art/palettes/<id>.json. The JSON is the single source of truth;
// the .gpl and swatch PNG next to it are generated for pixel-art editors.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface PaletteColor {
  name: string;
  hex: string;
  use: string;
}

export interface Palette {
  id: string;
  status: string;
  description: string;
  colors: PaletteColor[];
}

export const PALETTE_DIR = join(import.meta.dirname, '../../art/palettes');

export function loadPalette(id: string, dir = PALETTE_DIR): Palette {
  return JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')) as Palette;
}

/** Name → hex lookup that fails loudly on a typo instead of drawing black. */
export function colorsByName(palette: Palette): (name: string) => string {
  const map = new Map(palette.colors.map((c) => [c.name, c.hex.toLowerCase()]));
  return (name) => {
    const hex = map.get(name);
    if (!hex) throw new Error(`Palette ${palette.id} has no colour "${name}"`);
    return hex;
  };
}
