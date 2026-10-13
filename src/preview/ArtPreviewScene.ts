// The art preview: walk around a map (the Starting Village, or the small test area) with the
// player, talk to whoever is there. Everything it shows comes from the manifest (assets), the
// map (placement, collision; see src/game/world.ts) and PREVIEW_DIALOGUE (text).
import * as Phaser from 'phaser';
import { preloadAssets, registerAnimations } from '../game/assets/loader.ts';
import type { Character, Facing } from '../game/character.ts';
import type { DialogueBox } from '../game/dialogue-box.ts';
import { InteractionPrompt } from '../game/interaction.ts';
import { buildWorld } from '../game/world.ts';
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

export class ArtPreviewScene extends Phaser.Scene {
  private readonly dialogue: DialogueBox;
  private readonly reduceMotion: boolean;
  private mapId: string;
  /** Called at the end of every create(), including after a map change. */
  onCreated: (() => void) | null = null;
  private player!: Character;
  private prompt!: InteractionPrompt;
  private keys!: Keys;
  /** Set by keydown events, consumed in update(). Polling (JustDown) misses taps shorter than a frame. */
  private pending: 'act' | 'close' | null = null;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];
  private gridOverlay!: Phaser.GameObjects.Graphics;
  private collisionOverlay!: Phaser.GameObjects.Graphics;

  constructor(dialogue: DialogueBox, reduceMotion: boolean, mapId: string) {
    super({ key: 'art-preview' });
    this.dialogue = dialogue;
    this.reduceMotion = reduceMotion;
    this.mapId = mapId;
  }

  /** Swaps to another map, keeping the page (toolbar, dialogue box) as it is. */
  showMap(mapId: string): void {
    this.dialogue.close();
    this.scene.restart({ mapId });
  }

  preload(): void {
    preloadAssets(this);
  }

  init(data: { mapId?: string }): void {
    this.mapId = data.mapId ?? this.mapId;
  }

  create(): void {
    registerAnimations(this);
    const world = buildWorld(this, this.mapId, { reduceMotion: this.reduceMotion });
    const { map } = world;
    this.layers = world.layers;
    this.player = world.player;
    this.prompt = new InteractionPrompt(this, world.interactables, this.reduceMotion);

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite, true);
    camera.setRoundPixels(true);
    this.fitCamera(map);
    const onResize = () => this.fitCamera(map);
    this.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, onResize));

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
    this.onCreated?.();
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
