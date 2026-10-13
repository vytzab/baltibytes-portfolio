// The art preview: one small map with a player, an NPC and a sign. Everything it shows comes from
// the manifest (assets), the map's object layer (placement) and PREVIEW_DIALOGUE (text).
import * as Phaser from 'phaser';
import { createTilemap, preloadAssets, registerAnimations } from '../game/assets/loader.ts';
import { Character, type Facing } from '../game/character.ts';
import type { DialogueBox } from '../game/dialogue-box.ts';
import { InteractionPrompt, type Interactable } from '../game/interaction.ts';
import { PREVIEW_DIALOGUE } from './dialogue.ts';

/** Walking speed in game pixels per second: about 4.5 tiles a second. */
const SPEED = 72;
const GRID_COLOR = 0xfdf6e3;

interface Keys {
  up: Phaser.Input.Keyboard.Key[];
  down: Phaser.Input.Keyboard.Key[];
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
}

const ACT_CODES = new Set(['KeyE', 'Space', 'Enter', 'NumpadEnter']);

type MapObject = Phaser.Types.Tilemaps.TiledObject;

function prop(obj: MapObject, name: string): string | undefined {
  const props = obj.properties as Array<{ name: string; value: unknown }> | undefined;
  const value = props?.find((p) => p.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
}

export class ArtPreviewScene extends Phaser.Scene {
  private readonly dialogue: DialogueBox;
  private readonly reduceMotion: boolean;
  private player!: Character;
  private prompt!: InteractionPrompt;
  private keys!: Keys;
  /** Set by keydown events, consumed in update(). Polling (JustDown) misses taps shorter than a frame. */
  private pending: 'act' | 'close' | null = null;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];
  private gridOverlay!: Phaser.GameObjects.Graphics;
  private collisionOverlay!: Phaser.GameObjects.Graphics;

  constructor(dialogue: DialogueBox, reduceMotion: boolean) {
    super({ key: 'art-preview' });
    this.dialogue = dialogue;
    this.reduceMotion = reduceMotion;
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    registerAnimations(this);
    const { map, layers } = createTilemap(this, 'map.art-preview');
    this.layers = layers;
    // Tile layers sit below everything that is depth-sorted by y (characters, props: depth ≥ 0).
    layers.forEach((layer, i) => layer.setDepth(-10 + i));
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const objects = map.getObjectLayer('entities')?.objects ?? [];
    const spawn = objects.find((o) => o.type === 'spawn');
    this.player = new Character(this, spawn?.x ?? 0, spawn?.y ?? 0, (spawn && prop(spawn, 'sprite')) ?? 'char.player', { movable: true });
    this.player.sprite.setCollideWorldBounds(true);
    for (const layer of layers) this.physics.add.collider(this.player.sprite, layer);

    const interactables: Interactable[] = [];
    for (const obj of objects) {
      const x = obj.x ?? 0;
      const y = obj.y ?? 0;
      const sprite = prop(obj, 'sprite');
      const dialogueId = prop(obj, 'dialogue');
      if (!sprite || !dialogueId) continue;
      if (obj.type === 'npc') {
        const npc = new Character(this, x, y, sprite, { movable: false });
        npc.sync();
        this.physics.add.collider(this.player.sprite, npc.sprite);
        interactables.push({ x, y, height: npc.sprite.height, dialogueId, onInteract: (px, py) => npc.face(px, py) });
      } else if (obj.type === 'sign') {
        const image = this.add.image(x, y, sprite).setOrigin(0.5, 1).setDepth(y);
        // Solid only at the post, so the player can stand right in front of the board.
        const post = this.add.zone(x, y - 3, 6, 6);
        this.physics.add.existing(post, true);
        this.physics.add.collider(this.player.sprite, post);
        interactables.push({ x, y, height: image.height, dialogueId });
      }
    }
    this.prompt = new InteractionPrompt(this, interactables, this.reduceMotion);

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite, true);
    camera.setRoundPixels(true);
    this.fitCamera(map);
    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.fitCamera(map));

    this.gridOverlay = this.add.graphics().setDepth(Number.MAX_SAFE_INTEGER - 1).setVisible(false);
    this.gridOverlay.lineStyle(1, GRID_COLOR, 0.25);
    for (let x = 0; x <= map.widthInPixels; x += map.tileWidth) this.gridOverlay.lineBetween(x + 0.5, 0, x + 0.5, map.heightInPixels);
    for (let y = 0; y <= map.heightInPixels; y += map.tileHeight) this.gridOverlay.lineBetween(0, y + 0.5, map.widthInPixels, y + 0.5);
    this.collisionOverlay = this.add.graphics().setDepth(Number.MAX_SAFE_INTEGER - 2).setVisible(false);

    const kb = this.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: [kb.addKey(K.W), kb.addKey(K.UP)],
      down: [kb.addKey(K.S), kb.addKey(K.DOWN)],
      left: [kb.addKey(K.A), kb.addKey(K.LEFT)],
      right: [kb.addKey(K.D), kb.addKey(K.RIGHT)],
    };
    // Stop Space and Enter from scrolling the page or pressing a focused toolbar button.
    kb.addCapture([K.SPACE, K.ENTER]);
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (ACT_CODES.has(e.code)) this.pending = 'act';
      else if (e.code === 'Escape') this.pending = 'close';
    });
  }

  update(): void {
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const pressed = (keys: Phaser.Input.Keyboard.Key[]) => keys.some((k) => k.isDown);
    const action = this.pending;
    this.pending = null;

    if (this.dialogue.isOpen) {
      body.setVelocity(0, 0);
      this.player.play('idle', this.player.facing);
      if (action === 'act') this.dialogue.advance();
      else if (action === 'close') this.dialogue.close();
      this.player.sync();
      this.prompt.update(this.player.sprite.x, this.player.sprite.y, false);
      return;
    }

    const dx = Number(pressed(this.keys.right)) - Number(pressed(this.keys.left));
    const dy = Number(pressed(this.keys.down)) - Number(pressed(this.keys.up));
    const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(SPEED);
    body.setVelocity(velocity.x, velocity.y);
    if (dx === 0 && dy === 0) this.player.play('idle', this.player.facing);
    else {
      // Horizontal wins on diagonals: side views read better than backs while strafing.
      const facing: Facing = dx !== 0 ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      this.player.play('walk', facing);
    }
    this.player.sync();

    const target = this.prompt.update(this.player.sprite.x, this.player.sprite.y, true);
    if (target && action === 'act') {
      const text = PREVIEW_DIALOGUE[target.dialogueId];
      if (text) {
        target.onInteract?.(this.player.sprite.x, this.player.sprite.y);
        this.dialogue.open(text);
      } else console.warn(`No dialogue "${target.dialogueId}"`);
    }
  }

  /**
   * Follows the player inside the map; on an axis where the map is smaller than the view (a tall
   * phone screen), the map is centred instead of stuck to the top-left.
   */
  private fitCamera(map: Phaser.Tilemaps.Tilemap): void {
    const camera = this.cameras.main;
    camera.setSize(this.scale.width, this.scale.height);
    const pad = (view: number, size: number) => Math.max(0, Math.ceil((view - size) / 2));
    const px = pad(camera.width, map.widthInPixels);
    const py = pad(camera.height, map.heightInPixels);
    camera.setBounds(-px, -py, map.widthInPixels + 2 * px, map.heightInPixels + 2 * py);
  }

  setGridVisible(visible: boolean): void {
    this.gridOverlay.setVisible(visible);
  }

  /** Colliding tiles in rose, physics bodies in Phaser's debug colours. */
  setCollisionVisible(visible: boolean): void {
    this.collisionOverlay.clear().setVisible(visible);
    if (visible) {
      for (const layer of this.layers) {
        layer.renderDebug(this.collisionOverlay, { tileColor: null, collidingTileColor: new Phaser.Display.Color(217, 121, 107, 120), faceColor: null });
      }
    }
    const world = this.physics.world;
    if (visible && !world.debugGraphic) world.createDebugGraphic();
    world.drawDebug = visible;
    world.debugGraphic?.clear().setVisible(visible).setDepth(Number.MAX_SAFE_INTEGER - 2);
  }
}
