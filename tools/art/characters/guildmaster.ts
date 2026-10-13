// The guildmaster of the Guild Hall: stout and bald, with a big grey moustache and bushy brows,
// sleeves rolled up over strong forearms, a leather apron with a brass buckle, and the guild's
// ledger under one arm. Shortest and widest of the cast, so he reads at a glance.
// Every pixel is placed by hand. Light comes from the top-left: highlights left, shade right.
import type { CharacterArt } from './compose.ts';

const LEGS = {
  stand: ['....opppppPo....', '....oppoopPo....', '....oppoopPo....', '...obbdoobbdo...', '...oooo..oooo...'],
  a: ['....opppppPo....', '....oppoopPo....', '....oppoobdo....', '...obbdooooo....', '...oooo.........'],
  b: ['....opppppPo....', '....oppoopPo....', '....obdoopPo....', '....ooooobbdo...', '.........oooo...'],
};

const FRONT_BODY = [
  '....offffffo....',
  '.offfaaaaaafFFo.',
  '.offfaaaaaafFFo.',
  '.ossoaaggaaoSSo.',
  '.ossoaaaaaaoSSo.',
  '.osSoaaaaaaoSSo.',
  '.oooaaaaaaAAooo.',
  '....oaaaaaAo....',
  '....oooooooo....',
];

const BACK_BODY = [
  '....offffffo....',
  '.offfaffffafFFo.',
  '.offffaffaffFFo.',
  '.ossoffaaffoSSo.',
  '.ossoaaaaaaoSSo.',
  '.osSofffffFoSSo.',
  '.ooofffffFFFooo.',
  '....opppppPo....',
  '....opppppPo....',
];

const SIDE_BODY = [
  '.....offffo.....',
  '....oaffffFo....',
  '...oaaffffFFo...',
  '...oaaffffFFo...',
  '...oagffffFFo...',
  '...oaaffffFFo...',
  '...oaaaffFFFo...',
  '....oaapppPo....',
  '....oooooooo....',
];

export const GUILDMASTER: CharacterArt = {
  id: 'char.npc-guildmaster',
  legend: {
    o: 'ink',
    e: 'ink',
    s: 'skin',
    S: 'skin-shade',
    k: 'blush',
    j: 'cream', // shine on his head
    m: 'bark-dark',
    G: 'stone-light', // moustache, brows
    f: 'cream', // shirt
    F: 'sand',
    a: 'bark', // apron
    A: 'bark-dark',
    g: 'gold', // buckle
    q: 'brick', // ledger
    Q: 'plum',
    p: 'stone-dark', // trousers
    P: 'plum',
    b: 'bark-dark',
    d: 'ink',
  },

  down: {
    head: [
      '....oooooo....',
      '...ojjsssSo...',
      '..ojjsssssSo..',
      '.ojssssssssSo.',
      '.ossssssssSSo.',
      '.ossGGssGGsSo.',
      '.osssessesSSo.',
      '.oskssSSsskSo.',
      '.osGGGGGGGGSo.',
      '..oGGsmmsGGo..',
      '...osssssSo...',
      '....oossoo....',
    ],
    headBlink: [
      '....oooooo....',
      '...ojjsssSo...',
      '..ojjsssssSo..',
      '.ojssssssssSo.',
      '.ossssssssSSo.',
      '.ossGGssGGsSo.',
      '.ossssssssSSo.',
      '.oskssSSsskSo.',
      '.osGGGGGGGGSo.',
      '..oGGsmmsGGo..',
      '...osssssSo...',
      '....oossoo....',
    ],
    body: { rest: FRONT_BODY, a: FRONT_BODY, b: FRONT_BODY },
    legs: LEGS,
    bodyOverlap: 1,
  },

  up: {
    head: [
      '....oooooo....',
      '...ojjsssSo...',
      '..ojjsssssSo..',
      '.ojssssssssSo.',
      '.ossssssssSSo.',
      '.ossssssssSSo.',
      '.oGsssssssSGo.',
      '.oGGGGGGGGGGo.',
      '.oGGGGGGGGGGo.',
      '..oGGGGGGGGo..',
      '...osssssSo...',
      '....oossoo....',
    ],
    body: { rest: BACK_BODY, a: BACK_BODY, b: BACK_BODY },
    legs: LEGS,
    bodyOverlap: 1,
  },

  // Facing left; right-facing frames are mirrored from these.
  left: {
    head: [
      '.....ooooo....',
      '....ojjssSSo..',
      '...ojjssssSSo.',
      '..ojsssssssSo.',
      '..osssssssSSo.',
      '..oGGssssssSo.',
      '..oessssSssSo.',
      'osskssSSsssSo.',
      '.oGGGGGsssSo..',
      '..oGmssssSo...',
      '...ossssSo....',
      '.....osso.....',
    ],
    headBlink: [
      '.....ooooo....',
      '....ojjssSSo..',
      '...ojjssssSSo.',
      '..ojsssssssSo.',
      '..osssssssSSo.',
      '..oGGssssssSo.',
      '..osssssSssSo.',
      'osskssSSsssSo.',
      '.oGGGGGsssSo..',
      '..oGmssssSo...',
      '...ossssSo....',
      '.....osso.....',
    ],
    body: { rest: SIDE_BODY, a: SIDE_BODY, b: SIDE_BODY },
    // The near arm holds the ledger against his side.
    arm: {
      x: 2,
      y: 1,
      rest: ['....offo', '....offo', '....osso', '..oqqsSo', '..oqqQoo', '..ooooo.'],
      a: ['....offo', '....offo', '...osso.', '.oqqsSo.', '.oqqQoo.', '.ooooo..'],
      b: ['....offo', '....offo', '....osso', '...oqqsS', '...oqqQo', '...ooooo'],
    },
    legs: {
      stand: ['.....opppPo.....', '.....opppPo.....', '.....opppPo.....', '....obbbbdo.....', '....ooooooo.....'],
      a: ['.....opppPPo....', '....oppooPPo....', '...oppo..oPPo...', '..obbbo..oddo...', '..ooooo..oooo...'],
      b: ['.....oPPpppo....', '....oPPoopPo....', '...oPPo..oppo...', '..odddo..obbo...', '..ooooo..oooo...'],
      pass: ['.....opppPo.....', '.....oppPPo.....', '.....opppPo.....', '.....obbbdo.....', '.....oooooo.....'],
    },
    bodyOverlap: 1,
  },
};
