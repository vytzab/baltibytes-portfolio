// Builds a playable world from a Tiled map and the manifest, so any scene (the art preview now,
// the real locations later) gets the same rules:
// - tile layers sit under everything; tiles with the "collides" property are solid;
// - a "collision" object layer holds solid rectangles (forest edges, invisible walls);
// - entities stand with their feet at their point: "spawn" (the player), "npc", "sign", "prop",
//   and "arrive" (where you come out of a portal from another map); "portal" is a rectangle you
//   walk into to go to another map;
// - signs and props are solid only where their manifest "solid" boxes say (a trunk, two posts),
//   NPCs at their feet; anything with a "dialogue" property can be talked to, anything with a
//   "panel" property opens that info-panel document ("project:portio", "skills:web", …);
// - characters and props are depth-sorted by the y of their feet, so you walk behind a tree's
//   crown but in front of its trunk.
import * as Phaser from 'phaser';
import { asset, createTilemap } from './assets/loader.ts';
import { animationKey } from './assets/manifest.ts';
import { Character, type Facing } from './character.ts';
import type { Interactable } from './interaction.ts';

export interface Portal {
  name: string;
  /** Map id and arrival point to go to. */
  to: string;
  arrive: string;
  zone: Phaser.GameObjects.Zone;
}

/** A prop that opens a project's case study (a quest chest); the scene sets its open/closed look. */
export interface CaseStudyProp {
  projectId: string;
  object: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  assetId: string;
}

export interface World {
  map: Phaser.Tilemaps.Tilemap;
  layers: Phaser.Tilemaps.TilemapLayer[];
  player: Character;
  npcs: Character[];
  interactables: Interactable[];
  portals: Portal[];
  caseStudies: CaseStudyProp[];
}

const FACINGS: readonly Facing[] = ['down', 'left', 'right', 'up'];

type MapObject = Phaser.Types.Tilemaps.TiledObject;

function prop(obj: MapObject, name: string): string | undefined {
  const props = obj.properties as Array<{ name: string; value: unknown }> | undefined;
  const value = props?.find((p) => p.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
}

/** `arrive` names an "arrive" object to start at (coming through a portal); otherwise the spawn. */
export function buildWorld(scene: Phaser.Scene, mapId: string, options: { reduceMotion: boolean; arrive?: string }): World {
  const { map, layers } = createTilemap(scene, mapId);
  // Tile layers sit below everything that is depth-sorted by y (characters, props: depth ≥ 0).
  layers.forEach((layer, i) => layer.setDepth(-10 + i));
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  const solids = scene.physics.add.staticGroup();
  const addSolid = (x: number, y: number, width: number, height: number) => {
    const zone = scene.add.zone(x + width / 2, y + height / 2, width, height);
    scene.physics.add.existing(zone, true);
    solids.add(zone);
  };

  const entities: MapObject[] = [];
  for (const layer of map.objects) {
    if (layer.name === 'collision') {
      for (const r of layer.objects) addSolid(r.x ?? 0, r.y ?? 0, r.width ?? 0, r.height ?? 0);
    } else entities.push(...layer.objects);
  }

  const spawn = entities.find((o) => o.type === 'spawn');
  const arrival = options.arrive ? entities.find((o) => o.type === 'arrive' && o.name === options.arrive) : undefined;
  if (options.arrive && !arrival) console.warn(`Map "${mapId}" has no arrival "${options.arrive}"; using the spawn`);
  const start = arrival ?? spawn;
  const player = new Character(scene, start?.x ?? 0, start?.y ?? 0, (spawn && prop(spawn, 'sprite')) ?? 'char.player', { movable: true });
  const facing = start && prop(start, 'facing');
  if (facing && (FACINGS as string[]).includes(facing)) player.play('idle', facing as Facing);
  player.sprite.setCollideWorldBounds(true);
  for (const layer of layers) scene.physics.add.collider(player.sprite, layer);

  const npcs: Character[] = [];
  const interactables: Interactable[] = [];
  const portals: Portal[] = [];
  const caseStudies: CaseStudyProp[] = [];
  for (const obj of entities) {
    const x = obj.x ?? 0;
    const y = obj.y ?? 0;
    if (obj.type === 'portal') {
      const to = prop(obj, 'to');
      const arrive = prop(obj, 'arrive');
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      if (!to || !arrive) continue;
      const zone = scene.add.zone(x + w / 2, y + h / 2, w, h);
      scene.physics.add.existing(zone, true);
      portals.push({ name: obj.name ?? '', to, arrive, zone });
      continue;
    }
    const sprite = prop(obj, 'sprite');
    const dialogueId = prop(obj, 'dialogue');
    const panel = prop(obj, 'panel');
    const projectId = panel?.startsWith('project:') ? panel.slice('project:'.length) : undefined;
    if (!sprite || obj.type === 'spawn' || obj.type === 'arrive') continue;

    if (obj.type === 'npc') {
      const npc = new Character(scene, x, y, sprite, { movable: false });
      npc.sync();
      npcs.push(npc);
      scene.physics.add.collider(player.sprite, npc.sprite);
      if (dialogueId) interactables.push({ x, y, height: npc.sprite.height, dialogueId, onInteract: (px, py) => npc.face(px, py) });
      continue;
    }

    // Signs and props: an image, or an animated sprite when the manifest gives it animations.
    // Case-study chests use their animations as states (closed/open), set by the scene.
    const entry = asset(sprite);
    const first = entry.animations?.[0];
    const object = first ? scene.add.sprite(x, y, sprite, 0) : scene.add.image(x, y, sprite);
    object.setOrigin(0.5, 1).setDepth(y);
    if (first && object instanceof Phaser.GameObjects.Sprite && !options.reduceMotion && !projectId && first.frames > 1) {
      // Start each lamp at a different point so neighbours don't flicker in step.
      object.play({ key: animationKey(sprite, first.name), startFrame: Math.floor(Math.random() * first.frames) });
    }
    const left = x - object.width / 2;
    const top = y - object.height;
    for (const b of entry.solid ?? []) addSolid(left + b.x, top + b.y, b.width, b.height);
    if (projectId) caseStudies.push({ projectId, object, assetId: sprite });
    if (panel) interactables.push({ x, y, height: object.height, panel });
    else if (dialogueId) interactables.push({ x, y, height: object.height, dialogueId });
  }
  scene.physics.add.collider(player.sprite, solids);

  return { map, layers, player, npcs, interactables, portals, caseStudies };
}
