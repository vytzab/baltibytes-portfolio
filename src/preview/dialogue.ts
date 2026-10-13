// Text for the art preview's NPC and sign, keyed by the `dialogue` property of map objects.
import { ABOUT } from '../content/about.ts';
import { PROJECTS } from '../content/projects.ts';
import { openedCaseStudies } from '../game/progress.ts';
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
      'The old cellar at the top of the north path leads down to the Dungeon. Every project is kept there in a chest of its own.',
      'Further out are the other places: skills, experience and the way to get in touch. They aren\'t built yet.',
    ],
  },
  'village-board': { speaker: 'Notice board', lines: [`${ABOUT.name} · ${ABOUT.tagline}`, ...ABOUT.bio] },
  'village-workshop': { speaker: 'Workshop', lines: ABOUT.workshop },
  'village-sign': { speaker: 'Sign', lines: ['STARTING VILLAGE — About me. Head up the path to the square.'] },
};

/** The Dungeon guide counts the chests you have opened, so it is built when you talk to her. */
function dungeonGuide(): Dialogue {
  const opened = PROJECTS.filter((p) => openedCaseStudies().has(p.id)).length;
  const total = PROJECTS.length;
  const progress =
    opened === 0
      ? `There are ${total} vaults down here, one project in each chest. Walk up to a chest and press E to open its case study.`
      : opened < total
        ? `You've opened ${opened} of ${total} chests. The banners over the vaults show which project is which.`
        : `You've opened all ${total} chests. That's every project. The stairs behind you lead back up to the village.`;
  return { speaker: 'Guide', lines: ['Welcome to the Dungeon, where the projects are kept.', progress] };
}

/** Text for a dialogue id, or undefined if there is none. */
export function dialogueFor(id: string): Dialogue | undefined {
  if (id === 'dungeon-guide') return dungeonGuide();
  return PREVIEW_DIALOGUE[id];
}

