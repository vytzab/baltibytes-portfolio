// Shape of src/assets/manifest.json, plus small pure helpers.
// No Phaser or Vite imports here: the Node art tools (tools/art/) import this file too.

/** Each category has one folder under src/assets/ and one id prefix. */
export const CATEGORIES = {
  character: { dir: 'characters', prefix: 'char' },
  tileset: { dir: 'tiles', prefix: 'tiles' },
  map: { dir: 'maps', prefix: 'map' },
  object: { dir: 'objects', prefix: 'obj' },
  portrait: { dir: 'portraits', prefix: 'portrait' },
  ui: { dir: 'ui', prefix: 'ui' },
  effect: { dir: 'effects', prefix: 'fx' },
} as const;

export type AssetCategory = keyof typeof CATEGORIES;

/** How the game loads it: a plain image, a grid of frames, or a Tiled JSON map. */
export type AssetType = 'image' | 'spritesheet' | 'tilemap';

/**
 * opaque: no transparent pixels at all (e.g. a full-screen background).
 * transparent: every frame has a transparent background (sprites; catches art exported on white).
 * mixed: both allowed (tilesets that hold ground and decoration tiles).
 */
export type Transparency = 'opaque' | 'transparent' | 'mixed';

/**
 * placeholder: stand-in art to be replaced. draft: real art waiting for the owner's approval.
 * production: approved final art.
 */
export type AssetStatus = 'placeholder' | 'draft' | 'production';

export type Origin = 'code-generated' | 'hand-drawn' | 'ai-assisted' | 'third-party';

/** Licences we accept. "owner" = original work made for this site; the owner holds the rights. */
export const LICENSES = ['owner', 'CC0-1.0', 'CC-BY-4.0', 'OFL-1.1', 'MIT'] as const;
export type License = (typeof LICENSES)[number];

export interface Size {
  width: number;
  height: number;
}

/** One animation = one row of the sheet, starting at column 0 (see art/ART_BIBLE.md). */
/** A collision box in image pixels, measured from the image's top-left corner. */
export interface SolidBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationSpec {
  name: string;
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
}

export interface Provenance {
  origin: Origin;
  author: string;
  /** YYYY-MM-DD the asset (or this version of it) was made. */
  created: string;
  license: License;
  /** Program, script or generator used. Required for code-generated and ai-assisted. */
  tool?: string;
  /** Where it came from: a URL for third-party, a source file for hand-drawn work. */
  source?: string;
  /** Credit line, required by CC-BY. */
  attribution?: string;
  notes?: string;
}

export interface AssetEntry {
  /** Stable id used by game code; never rename once used. `<prefix>.<kebab-name>`. */
  id: string;
  /** Relative to src/assets/. */
  path: string;
  category: AssetCategory;
  type: AssetType;
  status: AssetStatus;
  /** Where and how the game uses it. */
  usage: string;
  /** Image size in pixels (image and spritesheet). */
  width?: number;
  height?: number;
  /** Frame size of a sprite sheet, or tile size of a tileset or map. */
  grid?: Size;
  animations?: AnimationSpec[];
  /** Required for image and spritesheet. */
  transparency?: Transparency;
  /**
   * Where a prop is solid, as boxes in image pixels (per frame for sheets). Usually just its
   * footprint at the base (a trunk, two posts), so characters can walk behind the rest.
   */
  solid?: SolidBox[];
  /** Allow semi-transparent pixels. Off by default: pixel art has hard edges. */
  softAlpha?: boolean;
  /** Palette id; when set, every visible pixel must be a colour from it. */
  palette?: string;
  provenance: Provenance;
  notes?: string;
}

export interface AssetManifest {
  version: 1;
  assets: AssetEntry[];
}

export function sheetColumns(entry: AssetEntry): number {
  return entry.grid && entry.width ? Math.floor(entry.width / entry.grid.width) : 1;
}

/** Phaser animation key: `char.player:walk-down`. */
export function animationKey(assetId: string, animation: string): string {
  return `${assetId}:${animation}`;
}

/** First and last frame index of an animation in its sheet. */
export function animationFrames(entry: AssetEntry, spec: AnimationSpec): { start: number; end: number } {
  const start = spec.row * sheetColumns(entry);
  return { start, end: start + spec.frames - 1 };
}
