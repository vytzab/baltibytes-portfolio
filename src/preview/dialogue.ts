// Text for the art preview's NPC and sign, keyed by the `dialogue` property of map objects.
import { ABOUT } from '../content/about.ts';
import type { Dialogue } from '../game/dialogue-box.ts';

export const PREVIEW_DIALOGUE: Record<string, Dialogue> = {
  'preview-guide': {
    speaker: 'Guide',
    lines: [
      'Welcome to the art preview! The ground and props here are still placeholders. The two of us are draft art, waiting for approval.',
      'Walk with WASD or the arrow keys. Talk to people and read signs with E, Space or Enter.',
      'The toolbar changes the zoom, shows the 16-pixel grid and collision boxes, and lists every asset with its status and licence.',
      'When real art arrives, it replaces these files one by one, without changing any game code.',
    ],
  },
  'preview-sign': {
    speaker: 'Sign',
    lines: ['ART PREVIEW — palette baltibytes-v0 · tiles 16 × 16 · characters 24 × 32 frames · whole-pixel zoom only.'],
  },
  // Starting Village (About me).
  'village-guide': {
    speaker: 'Guide',
    lines: [
      `Welcome to the Starting Village! This is where ${ABOUT.name} lives and works.`,
      'The notice board on the square says who they are. The workshop by the path is where they tinker.',
      'Further out are the other places: projects, skills, experience and the way to get in touch. They aren\'t built yet.',
    ],
  },
  'village-board': { speaker: 'Notice board', lines: [`${ABOUT.name} · ${ABOUT.tagline}`, ...ABOUT.bio] },
  'village-workshop': { speaker: 'Workshop', lines: ABOUT.workshop },
  'village-sign': { speaker: 'Sign', lines: ['STARTING VILLAGE — About me. Head up the path to the square.'] },
};
