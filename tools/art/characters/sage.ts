// The sage of the Skill Tower: a young scholar in a wide-brimmed, pointed heather hat with a gold
// star, long dark hair, a teal robe with a gold trim down the front, holding a glowing orb.
// The hat brim and cone make a silhouette none of the others has; teal keeps her apart from the
// player's denim and the guide's heather coat.
// Every pixel is placed by hand. Light comes from the top-left: highlights left, shade right.
import type { CharacterArt } from './compose.ts';

const HAT = [
  '..........oo....',
  '........oojjo...',
  '.......ojjhho...',
  '......ojhhhHo...',
  '.....ojhhhhHo...',
  '.....ohhhhHHo...',
  '....ohhyhhhHHo..',
  '.oohhhhhhhhhhHHo',
  'ohhhhhhhhhhhhHHo',
];

const FRONT_LEGS = {
  stand: ['....oppoopPo....', '...obbdoobbdo...', '...oooo..oooo...'],
  a: ['....oppoobdo....', '...obbdooooo....', '...oooo.........'],
  b: ['....obdoopPo....', '....ooooobbdo...', '.........oooo...'],
};

export const SAGE: CharacterArt = {
  id: 'char.npc-sage',
  legend: {
    o: 'ink',
    e: 'ink',
    s: 'skin',
    S: 'skin-shade',
    k: 'blush',
    m: 'bark',
    h: 'heather', // hat
    H: 'plum',
    j: 'heather',
    y: 'gold-light', // star, orb glow
    w: 'paper', // orb core
    g: 'gold', // trim
    R: 'bark-dark', // hair
    c: 'sea', // robe
    C: 'sea-deep',
    p: 'sea-deep',
    P: 'plum',
    b: 'bark',
    d: 'bark-dark',
  },

  down: {
    head: [...HAT, '..oRRssssssRRo..', '..oRRsessesRRo..', '..oRRsessesRRo..', '..oRRksmmskRRo..', '..oRRossssoRRo..', '...oRRooooRRo...'],
    headBlink: [...HAT, '..oRRssssssRRo..', '..oRRssssssRRo..', '..oRRsessesRRo..', '..oRRksmmskRRo..', '..oRRossssoRRo..', '...oRRooooRRo...'],
    body: {
      rest: [
        '..oRRoggggoRRo..',
        '.ocRRccggccRRCo.',
        '.occcccggcccCCo.',
        '.occoccggccoCCo.',
        '.occosywyysoCCo.',
        '.occocyyyycoCCo.',
        '.occcccggcccCCo.',
        '.oyccccggcccCCo.',
        'occccccggcccCCCo',
        'oooooooooooooooo',
      ],
      // Walking: the robe's hem sways 1 px against the step.
      a: [
        '..oRRoggggoRRo..',
        '.ocRRccggccRRCo.',
        '.occcccggcccCCo.',
        '.occoccggccoCCo.',
        '.occosywyysoCCo.',
        '.occocyyyycoCCo.',
        '.occcccggcccCCo.',
        '.oyccccggcccCCo.',
        'occccccggccCCCo.',
        'ooooooooooooooo.',
      ],
      b: [
        '..oRRoggggoRRo..',
        '.ocRRccggccRRCo.',
        '.occcccggcccCCo.',
        '.occoccggccoCCo.',
        '.occosywyysoCCo.',
        '.occocyyyycoCCo.',
        '.occcccggcccCCo.',
        '.oyccccggcccCCo.',
        '.occcccggcccCCCo',
        '.ooooooooooooooo',
      ],
    },
    legs: FRONT_LEGS,
    bodyOverlap: 0,
  },

  up: {
    head: [...HAT, '..oRRRRRRRRRRo..', '..oRRRRRRRRRRo..', '..oRRRRRRRRRRo..', '..oRRRRRRRRRRo..', '..oRRRRRRRRRRo..', '...oRRRRRRRRo...'],
    body: {
      rest: [
        '..oRRRRRRRRRRo..',
        '.ocRRRRRRRRRRCo.',
        '.occRRRRRRRRCCo.',
        '.occocRRRRcoCCo.',
        '.occoccRRccoCCo.',
        '.occoccccccoCCo.',
        'occcccccccccCCCo',
        'occcccccccccCCCo',
        'occcccccccccCCCo',
        'oooooooooooooooo',
      ],
      a: [
        '..oRRRRRRRRRRo..',
        '.ocRRRRRRRRRRCo.',
        '.occRRRRRRRRCCo.',
        '.occocRRRRcoCCo.',
        '.occoccRRccoCCo.',
        '.occoccccccoCCo.',
        'occcccccccccCCCo',
        'occcccccccccCCCo',
        'occcccccccccCCo.',
        'ooooooooooooooo.',
      ],
      b: [
        '..oRRRRRRRRRRo..',
        '.ocRRRRRRRRRRCo.',
        '.occRRRRRRRRCCo.',
        '.occocRRRRcoCCo.',
        '.occoccRRccoCCo.',
        '.occoccccccoCCo.',
        'occcccccccccCCCo',
        'occcccccccccCCCo',
        '.occcccccccccCCo',
        '.ooooooooooooooo',
      ],
    },
    legs: FRONT_LEGS,
    bodyOverlap: 0,
  },

  // Facing left; right-facing frames are mirrored from these. The hat's point bends back.
  left: {
    head: [
      '............oo..',
      '..........oojho.',
      '........oojhhHo.',
      '.......ojhhhHo..',
      '......ojhhhhHo..',
      '......ohhhhHHo..',
      '.....ohhyhhhHo..',
      '..oohhhhhhhhHHoo',
      '.ohhhhhhhhhhhHHo',
      '..oossssRRRRRo..',
      '..osesssRRRRo...',
      '.oosessRRRRRo...',
      '..oksssRRRRRo...',
      '..omssoRRRRRo...',
      '...ooooRRRRo....',
    ],
    headBlink: [
      '............oo..',
      '..........oojho.',
      '........oojhhHo.',
      '.......ojhhhHo..',
      '......ojhhhhHo..',
      '......ohhhhHHo..',
      '.....ohhyhhhHo..',
      '..oohhhhhhhhHHoo',
      '.ohhhhhhhhhhhHHo',
      '..oossssRRRRRo..',
      '..osssssRRRRo...',
      '.oosessRRRRRo...',
      '..oksssRRRRRo...',
      '..omssoRRRRRo...',
      '...ooooRRRRo....',
    ],
    body: {
      rest: [
        '......occRRRo...',
        '.....occcRRRo...',
        '.....occccRCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....oyccccCo...',
        '.....occccCCo...',
        '....occcccCCCo..',
        '....oooooooooo..',
      ],
      a: [
        '......occRRRo...',
        '.....occcRRRo...',
        '.....occccRCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....oyccccCo...',
        '.....occccCCo...',
        '...occcccCCCo...',
        '...oooooooooo...',
      ],
      b: [
        '......occRRRo...',
        '.....occcRRRo...',
        '.....occccRCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....occccCCo...',
        '.....oyccccCo...',
        '.....occccCCo...',
        '.....occcccCCCo.',
        '.....oooooooooo.',
      ],
    },
    // The near arm holds the glowing orb out in front of her.
    arm: {
      x: 1,
      y: 2,
      rest: ['....occo', '....occo', '..oyyso.', '..owyo..', '..oyyo..', '...oo...'],
      a: ['....occo', '....occo', '..oyyso.', '..owyo..', '..oyyo..', '...oo...'],
      b: ['....occo', '....occo', '..oyyso.', '..owyo..', '..oyyo..', '...oo...'],
    },
    legs: {
      stand: ['......opPo......', '.....obbdo......', '.....ooooo......'],
      a: ['....oppo.oPo....', '...obbdo.oddo...', '...ooooo.oooo...'],
      b: ['....oPPo.opo....', '...odddo.obbo...', '...ooooo.oooo...'],
    },
    bodyOverlap: 0,
  },
};
