// Text for the art preview's NPC and sign, keyed by the `dialogue` property of map objects.
import type { Dialogue } from '../game/dialogue-box.ts';

export const PREVIEW_DIALOGUE: Record<string, Dialogue> = {
  'preview-guide': {
    speaker: 'Guide',
    lines: [
      'Welcome to the art preview! Everything you see here is placeholder art, drawn in code to test scale, palette and animation.',
      'Walk with WASD or the arrow keys. Talk to people and read signs with E, Space or Enter.',
      'The toolbar changes the zoom, shows the 16-pixel grid and collision boxes, and lists every asset with its status and licence.',
      'When real art arrives, it replaces these files one by one, without changing any game code.',
    ],
  },
  'preview-sign': {
    speaker: 'Sign',
    lines: ['ART PREVIEW — palette baltibytes-v0 · tiles 16 × 16 · characters 16 × 24 · whole-pixel zoom only.'],
  },
};
