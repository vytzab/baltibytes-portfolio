// A character (player or NPC) drawn from a manifest sprite sheet that follows the art bible's
// animation names: `idle-<facing>` and, for walkers, `walk-<facing>`.
import * as Phaser from 'phaser';
import { animationKey } from './assets/manifest.ts';

export type Facing = 'down' | 'left' | 'right' | 'up';
export type CharacterState = 'idle' | 'walk';

/** Collision box at the feet, so characters can walk "behind" the top of things. */
const FEET = { width: 10, height: 6 } as const;
const SHADOW_ALPHA = 0.25;

export class Character {
  readonly assetId: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly shadow: Phaser.GameObjects.Image;
  facing: Facing = 'down';
  private state: CharacterState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, assetId: string, options: { movable: boolean }) {
    this.assetId = assetId;
    this.shadow = scene.add.image(x, y, 'fx.shadow').setOrigin(0.5, 0.6).setAlpha(SHADOW_ALPHA);
    this.sprite = scene.physics.add.sprite(x, y, assetId, 0).setOrigin(0.5, 1);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(FEET.width, FEET.height);
    body.setOffset((this.sprite.width - FEET.width) / 2, this.sprite.height - FEET.height);
    body.setImmovable(!options.movable);
    body.pushable = options.movable;
    this.play('idle', 'down');
  }

  play(state: CharacterState, facing: Facing): void {
    if (state === this.state && facing === this.facing && this.sprite.anims.isPlaying) return;
    this.state = state;
    this.facing = facing;
    this.sprite.anims.play(animationKey(this.assetId, `${state}-${facing}`), true);
  }

  /** Turn towards a point (e.g. an NPC facing the player who talks to it). */
  face(x: number, y: number): void {
    const dx = x - this.sprite.x;
    const dy = y - this.sprite.y;
    const facing: Facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    this.play(this.state, facing);
  }

  /** Call every frame: keeps the shadow under the feet and sorts by y so lower things draw in front. */
  sync(): void {
    this.shadow.setPosition(this.sprite.x, this.sprite.y);
    this.sprite.setDepth(this.sprite.y);
    this.shadow.setDepth(this.sprite.y - 0.5);
  }
}
