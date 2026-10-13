// Starts the game in a page: the Phaser game (pixel-perfect, sized to its parent), the world scene
// and the HTML pieces around it (dialogue box, info panel, touch controls). Shared by the site
// (src/main.ts) and the art preview, which adds its toolbar on top.
import * as Phaser from 'phaser';
import { DialogueBox } from './dialogue-box.ts';
import { InfoPanel } from './info-panel.ts';
import { keepPixelPerfect, type PixelScale } from './pixel-scale.ts';
import { TouchControls } from './touch-controls.ts';
import { WorldScene } from './WorldScene.ts';

export interface GameOptions {
  /** Element ids: the game's parent, the dialogue box, the info panel, the touch controls. */
  ids: { game: string; dialogue: string; panel: string; touch: string };
  mapId: string;
  /** A fixed zoom instead of fitting the window (the art preview's +/− buttons). */
  zoomOverride?: () => number | null;
  onScale?: (scale: PixelScale) => void;
}

export interface RunningGame {
  game: Phaser.Game;
  scene: WorldScene;
  /** Re-applies the scale (after changing the zoom override). */
  rescale: () => void;
}

export function startGame(options: GameOptions): RunningGame {
  const $ = (id: string) => document.getElementById(id)!;
  const parent = $(options.ids.game);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = new TouchControls($(options.ids.touch));
  const scene = new WorldScene(new DialogueBox($(options.ids.dialogue)), new InfoPanel($(options.ids.panel)), reduceMotion, options.mapId, touch);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    backgroundColor: '#2a1e2b',
    width: 240,
    height: 144,
    scale: { mode: Phaser.Scale.NONE },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene,
  });

  let apply: (() => PixelScale) | null = null;
  game.events.once(Phaser.Core.Events.READY, () => {
    apply = keepPixelPerfect(game, parent, options.zoomOverride ?? (() => null), (s) => options.onScale?.(s));
    apply();
  });
  return { game, scene, rescale: () => void apply?.() };
}
