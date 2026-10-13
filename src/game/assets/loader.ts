// Loads assets into Phaser by manifest id. Game code never hard-codes a file path: replacing a
// sprite means replacing its PNG (and its manifest entry if the size or frames change).
import * as Phaser from 'phaser';
import manifestJson from '../../assets/manifest.json';
import { animationFrames, animationKey, type AssetEntry, type AssetManifest } from './manifest.ts';

// Vite turns every asset file into a hashed URL at build time.
const urls = import.meta.glob<string>(['../../assets/**/*.png', '../../assets/**/*.json', '!../../assets/manifest.json'], {
  eager: true,
  query: '?url',
  import: 'default',
});

export const manifest = manifestJson as unknown as AssetManifest;
const byId = new Map(manifest.assets.map((a) => [a.id, a]));

export function asset(id: string): AssetEntry {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Asset "${id}" is not in src/assets/manifest.json`);
  return entry;
}

export function assetUrl(id: string): string {
  const entry = asset(id);
  const url = urls[`../../assets/${entry.path}`];
  if (!url) throw new Error(`Asset "${id}": file src/assets/${entry.path} was not bundled`);
  return url;
}

/** Queues assets in a scene's preload(); Phaser texture/cache keys are the manifest ids. */
export function preloadAssets(scene: Phaser.Scene, ids: readonly string[] = manifest.assets.map((a) => a.id)): void {
  for (const id of ids) {
    const entry = asset(id);
    const url = assetUrl(id);
    if (entry.type === 'tilemap') scene.load.tilemapTiledJSON(id, url);
    else if (entry.type === 'spritesheet' && entry.category !== 'tileset' && entry.grid) {
      scene.load.spritesheet(id, url, { frameWidth: entry.grid.width, frameHeight: entry.grid.height });
    } else scene.load.image(id, url);
  }
}

/** Registers every manifest animation once (Phaser animations are global). */
export function registerAnimations(scene: Phaser.Scene): void {
  for (const entry of manifest.assets) {
    for (const spec of entry.animations ?? []) {
      const key = animationKey(entry.id, spec.name);
      if (scene.anims.exists(key) || !scene.textures.exists(entry.id)) continue;
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(entry.id, animationFrames(entry, spec)),
        frameRate: spec.fps,
        repeat: spec.loop ? -1 : 0,
      });
    }
  }
}

/**
 * Adds a map's layers. Tiled tileset names are manifest ids (the validator checks this), so
 * no map needs its own wiring code.
 */
export function createTilemap(scene: Phaser.Scene, mapId: string): { map: Phaser.Tilemaps.Tilemap; layers: Phaser.Tilemaps.TilemapLayer[] } {
  const map = scene.make.tilemap({ key: mapId });
  const tilesets = map.tilesets.map((ts) => map.addTilesetImage(ts.name, ts.name)).filter((ts) => ts !== null);
  const layers = map.layers.map((layerData) => {
    const layer = map.createLayer(layerData.name, tilesets, 0, 0);
    if (!layer) throw new Error(`Map "${mapId}": could not create layer "${layerData.name}"`);
    layer.setCollisionByProperty({ collides: true });
    return layer as Phaser.Tilemaps.TilemapLayer;
  });
  return { map, layers };
}
