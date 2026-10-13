// The art preview: walk around the maps (the Starting Village, the Dungeon, the small test area)
// with the player, talk to whoever is there, walk through portals between maps, and open the
// Dungeon's case studies. Everything it shows comes from the manifest (assets), the maps
// (placement, collision, portals; see src/game/world.ts) and src/content (text).
import * as Phaser from 'phaser';
import { asset, preloadAssets, registerAnimations } from '../game/assets/loader.ts';
import { animationFrames } from '../game/assets/manifest.ts';
import type { CaseStudyPanel } from '../game/case-study.ts';
import type { Character, Facing } from '../game/character.ts';
import type { DialogueBox } from '../game/dialogue-box.ts';
import type { TouchControls } from '../game/touch-controls.ts';
import { InteractionPrompt, type Interactable } from '../game/interaction.ts';
import { markCaseStudyOpened, openedCaseStudies } from '../game/progress.ts';
import { buildWorld, type CaseStudyProp } from '../game/world.ts';
import { projectById } from '../content/projects.ts';
import { dialogueFor } from './dialogue.ts';

/** Walking speed in game pixels per second: about 4.5 tiles a second. */
const SPEED = 72;
const GRID_COLOR = 0xfdf6e3;
/** Portal fade, each way. Instant when the visitor asks for reduced motion. */
const FADE_MS = 180;

interface Keys {
  up: Phaser.Input.Keyboard.Key[];
  down: Phaser.Input.Keyboard.Key[];
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
}

const ACT_CODES = new Set(['KeyE', 'Space', 'Enter', 'NumpadEnter']);

export class ArtPreviewScene extends Phaser.Scene {
  private readonly dialogue: DialogueBox;
  private readonly caseStudy: CaseStudyPanel;
  private readonly reduceMotion: boolean;
  private readonly touch: TouchControls | null;
  private mapId: string;
  private arrive: string | undefined;
  /** Called at the end of every create(), including after a map change. */
  onCreated: (() => void) | null = null;
  /** Called when the map changes from inside the game (a portal), so the page can follow. */
  onMapChanged: ((mapId: string) => void) | null = null;
  private player!: Character;
  private prompt!: InteractionPrompt;
  private keys!: Keys;
  private chests: CaseStudyProp[] = [];
  /** Set by keydown events, consumed in update(). Polling (JustDown) misses taps shorter than a frame. */
  private pending: 'act' | 'close' | null = null;
  private travelling = false;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];
  private gridOverlay!: Phaser.GameObjects.Graphics;
  private collisionOverlay!: Phaser.GameObjects.Graphics;

  constructor(dialogue: DialogueBox, caseStudy: CaseStudyPanel, reduceMotion: boolean, mapId: string, touch: TouchControls | null = null) {
    super({ key: 'art-preview' });
    this.dialogue = dialogue;
    this.caseStudy = caseStudy;
    this.reduceMotion = reduceMotion;
    this.mapId = mapId;
    this.touch = touch;
    // The on-screen A button does what E, Space or Enter do.
    if (touch) touch.onAction = () => {
      if (!this.caseStudy.isOpen) this.pending = 'act';
    };
  }

  /** Swaps to another map, keeping the page (toolbar, dialogue box) as it is. */
  showMap(mapId: string, arrive?: string): void {
    this.dialogue.close();
    this.caseStudy.close();
    this.scene.restart({ mapId, arrive });
  }

  preload(): void {
    preloadAssets(this);
  }

  init(data: { mapId?: string; arrive?: string }): void {
    this.mapId = data.mapId ?? this.mapId;
    this.arrive = data.arrive;
    this.travelling = false;
    this.pending = null;
  }

  create(): void {
    registerAnimations(this);
    const world = buildWorld(this, this.mapId, { reduceMotion: this.reduceMotion, arrive: this.arrive });
    const { map } = world;
    this.layers = world.layers;
    this.player = world.player;
    this.chests = world.caseStudies;
    this.refreshChests();
    this.prompt = new InteractionPrompt(this, world.interactables, this.reduceMotion);
    for (const portal of world.portals) {
      this.physics.add.overlap(this.player.sprite, portal.zone, () => this.travel(portal.to, portal.arrive));
    }

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite, true);
    camera.setRoundPixels(true);
    this.fitCamera(map);
    const onResize = () => this.fitCamera(map);
    this.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, onResize));
    if (this.arrive && !this.reduceMotion) camera.fadeIn(FADE_MS);

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
      if (e.repeat || this.caseStudy.isOpen) return;
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

    if (this.dialogue.isOpen || this.caseStudy.isOpen || this.travelling) {
      body.setVelocity(0, 0);
      this.player.play('idle', this.player.facing);
      if (this.dialogue.isOpen && action === 'act') this.dialogue.advance();
      else if (this.dialogue.isOpen && action === 'close') this.dialogue.close();
      this.player.sync();
      this.prompt.update(this.player.sprite.x, this.player.sprite.y, false);
      return;
    }

    // Keys win when both are used; otherwise the touch pad steers.
    let dx = Number(pressed(this.keys.right)) - Number(pressed(this.keys.left));
    let dy = Number(pressed(this.keys.down)) - Number(pressed(this.keys.up));
    if (dx === 0 && dy === 0 && this.touch) {
      dx = this.touch.dx;
      dy = this.touch.dy;
    }
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
    if (target && action === 'act') this.interact(target);
  }

  private interact(target: Interactable): void {
    target.onInteract?.(this.player.sprite.x, this.player.sprite.y);
    if (target.caseStudy) {
      const project = projectById(target.caseStudy);
      if (!project) return console.warn(`No project "${target.caseStudy}"`);
      // While the panel is open, the keyboard belongs to it: no game keys, no captured keys.
      const kb = this.input.keyboard!;
      kb.enabled = false;
      kb.disableGlobalCapture();
      markCaseStudyOpened(project.id);
      this.refreshChests();
      this.caseStudy.open(project, () => {
        kb.enabled = true;
        kb.enableGlobalCapture();
        kb.resetKeys();
        this.pending = null;
      });
      return;
    }
    const text = target.dialogueId ? dialogueFor(target.dialogueId) : undefined;
    if (text) this.dialogue.open(text);
    else console.warn(`No dialogue "${target.dialogueId}"`);
  }

  /** Chests a visitor has already opened stay open. */
  private refreshChests(): void {
    const opened = openedCaseStudies();
    for (const chest of this.chests) {
      if (!(chest.object instanceof Phaser.GameObjects.Sprite)) continue;
      const entry = asset(chest.assetId);
      const state = entry.animations?.find((a) => a.name === (opened.has(chest.projectId) ? 'open' : 'closed'));
      if (state) chest.object.setFrame(animationFrames(entry, state).start);
    }
  }

  private travel(to: string, arrive: string): void {
    if (this.travelling) return;
    this.travelling = true;
    const go = () => {
      this.onMapChanged?.(to);
      this.showMap(to, arrive);
    };
    if (this.reduceMotion) go();
    else {
      this.cameras.main.fadeOut(FADE_MS);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, go);
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
