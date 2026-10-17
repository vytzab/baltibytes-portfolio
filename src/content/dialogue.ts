// What the NPCs and signs say, keyed by the `dialogue` property of map objects.
import { ABOUT } from './about.ts';
import { PROJECTS } from './projects.ts';
import { openedCaseStudies } from '../game/progress.ts';
import type { Dialogue } from '../game/dialogue-box.ts';

export const DIALOGUE: Record<string, Dialogue> = {
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
      `Welcome to the Starting Village! This is where ${ABOUT.firstName} lives and works.`,
      'The notice board on the square says who they are. The workshop by the path is where they tinker.',
      'The old cellar at the top of the north path leads down to the Dungeon, where the projects are kept. The keeper down there will show you around.',
      'The roads lead west to the Guild Hall, where the work history is kept, and east to the Skill Tower. Both are closed for now.',
      'And right by the gate stands the Exit Portal. That\'s the way to get in touch.',
    ],
  },
  'village-board': { speaker: 'Notice board', lines: [`${ABOUT.name} · ${ABOUT.tagline}`, ...ABOUT.bio] },
  'village-workshop': { speaker: 'Workshop', lines: ABOUT.workshop },
  'village-sign-west': { speaker: 'Signpost', lines: ['← GUILD HALL — Experience', 'A board is nailed across it: "Closed for now. Opening soon!"'] },
  'village-sign-east': { speaker: 'Signpost', lines: ['SKILL TOWER — Skills →', 'A board is nailed across it: "Closed for now. Opening soon!"'] },
  'locked-dungeon': {
    speaker: 'Cellar door',
    lines: ['The cellar door is locked.', 'A note is pinned to it: "Projects are being catalogued. Back soon!"'],
  },
  'locked-guildhall': {
    speaker: 'Road',
    lines: ['A barrier blocks the road to the Guild Hall.', '"Closed for now: the guild records are still being written up. Opening soon!"'],
  },
  'locked-tower': {
    speaker: 'Road',
    lines: ['A barrier blocks the road to the Skill Tower.', '"Closed for now: the skills are still being written down. Opening soon!"'],
  },
  'portal-courier': {
    speaker: 'Courier',
    lines: [
      'Need to send word? I carry every letter that goes through the portal.',
      'Step up to it and press E: there\'s the email address and the links.',
    ],
  },
  'tower-sage': {
    speaker: 'Sage',
    lines: [
      'Welcome to the Skill Tower. Every lectern holds a book of skills: languages, Android, the web, back ends, AI, and how the work gets done.',
      'Each skill names the projects it was used in. Choose one to open its case study, without walking all the way to the Dungeon.',
    ],
  },
  'guild-master': {
    speaker: 'Guildmaster',
    lines: [
      'Welcome to the Guild Hall! The plaques on the wall are the roles held so far, one each.',
      'The records board by the door has the whole story at a glance.',
    ],
  },
  'village-sign': { speaker: 'Sign', lines: ['STARTING VILLAGE — About me. Head up the path to the square.'] },
};

/** The keeper counts the chests you have opened, so his lines are built when you talk to him. */
function dungeonKeeper(): Dialogue {
  const opened = PROJECTS.filter((p) => openedCaseStudies().has(p.id)).length;
  const total = PROJECTS.length;
  const progress =
    opened === 0
      ? `There are ${total} chests down here, one project in each. Walk up to a chest and press E to open its case study.`
      : opened < total
        ? `You've opened ${opened} of ${total} chests. The banners over the vaults show which project is which.`
        : `You've opened all ${total} chests. That's every project. The stairs behind you lead back up to the village.`;
  return { speaker: 'Keeper', lines: ['Mind the steps! I keep the projects down here, each in its own vault. The empty one is waiting for the next.', progress] };
}

/** Text for a dialogue id, or undefined if there is none. */
export function dialogueFor(id: string): Dialogue | undefined {
  if (id === 'dungeon-keeper') return dungeonKeeper();
  return DIALOGUE[id];
}

