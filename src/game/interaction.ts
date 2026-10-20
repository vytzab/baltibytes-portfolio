// Finds the nearest thing the player can interact with and shows the "!" prompt above it.
import * as Phaser from 'phaser';
import { INTERACT_RANGE, reachDistance, type FrontEdge } from './rules.ts';

export interface Interactable {
  /** Feet position (where the object touches the ground). */
  x: number;
  y: number;
  /** A prop's front edge (rules.ts): reach is measured to it instead of to the feet point. */
  front?: FrontEdge;
  /** Height of its sprite, so the prompt floats just above it. */
  height: number;
  /** Text to show (a key into the scene's dialogue), or an info-panel document to open (panel-docs.ts). */
  dialogueId?: string;
  panel?: string;
  /** Called when the player starts talking, e.g. to turn an NPC towards them. */
  onInteract?: (playerX: number, playerY: number) => void;
}

const PROMPT_GAP = 4;

export class InteractionPrompt {
  private readonly targets: Interactable[];
  private readonly prompt: Phaser.GameObjects.Image;
  private current: Interactable | null = null;
  /** 0 or 1: a whole-pixel bob, so the prompt never lands between pixels. */
  private bob = 0;

  constructor(scene: Phaser.Scene, targets: Interactable[], reduceMotion: boolean) {
    this.targets = targets;
    this.prompt = scene.add.image(0, 0, 'ui.prompt').setOrigin(0.5, 1).setVisible(false).setDepth(Number.MAX_SAFE_INTEGER);
    // A gentle 1 px bob draws the eye; skipped when the visitor asks for reduced motion.
    if (!reduceMotion) scene.time.addEvent({ delay: 450, loop: true, callback: () => (this.bob = 1 - this.bob) });
  }

  /** Call every frame with the player's feet position; returns what is in reach, if anything. */
  update(px: number, py: number, enabled: boolean): Interactable | null {
    let best: Interactable | null = null;
    let bestDistance = INTERACT_RANGE;
    if (enabled) {
      for (const t of this.targets) {
        const d = reachDistance(px, py, t);
        if (d <= bestDistance) {
          best = t;
          bestDistance = d;
        }
      }
    }
    this.current = best;
    this.prompt.setVisible(best !== null);
    if (best) this.prompt.setPosition(best.x, best.y - best.height - PROMPT_GAP - this.bob);
    return best;
  }

  get target(): Interactable | null {
    return this.current;
  }
}
