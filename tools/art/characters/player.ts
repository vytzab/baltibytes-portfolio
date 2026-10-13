// The player: a friendly young engineer out exploring. Messy auburn hair with a cowlick,
// a denim jacket over a cream shirt, headphones resting round the neck (the one "techy" tell),
// a mustard backpack with a chest strap, charcoal trousers and brown boots.
// Every pixel is placed by hand. Light comes from the top-left: highlights left, shade right.
import type { CharacterArt } from './compose.ts';

export const PLAYER: CharacterArt = {
  id: 'char.player',
  legend: {
    o: 'ink', // outline
    e: 'ink', // eyes
    s: 'skin',
    S: 'skin-shade',
    k: 'blush',
    m: 'bark', // mouth
    h: 'bark', // hair
    H: 'bark-dark',
    j: 'wood', // hair highlight
    c: 'denim-light', // jacket
    C: 'denim',
    D: 'sea-deep',
    v: 'sea-light', // jacket highlight (lit edge)
    f: 'cream', // shirt
    F: 'sand',
    r: 'brick', // headphone ear cups
    n: 'stone-dark', // headphone band
    t: 'bark-dark', // pack straps
    g: 'gold', // backpack
    G: 'wood',
    y: 'gold-light',
    B: 'bark-dark', // belt
    p: 'stone-dark', // trousers
    P: 'plum',
    b: 'bark', // boots
    d: 'bark-dark',
  },

  down: {
    head: [
      '........oo....',
      '....oooojjo...',
      '...ohhhhjjhoo.',
      '..ohhjjhhhhho.',
      '.ohhjjhhhhhho.',
      '.ohjhhhhhhhHo.',
      '.ohhhhhhhhHHo.',
      '.oHhhssshhhHo.',
      '.oHsssssshhHo.',
      '.oHsesssseSHo.',
      '.ossesssseSSo.',
      '.oskssmmsskSo.',
      '..osssssssSo..',
      '...oossssoo...',
    ],
    headBlink: [
      '........oo....',
      '....oooojjo...',
      '...ohhhhjjhoo.',
      '..ohhjjhhhhho.',
      '.ohhjjhhhhhho.',
      '.ohjhhhhhhhHo.',
      '.ohhhhhhhhHHo.',
      '.oHhhssshhhHo.',
      '.oHsssssshhHo.',
      '.oHsssssssSHo.',
      '.ossesssseSSo.',
      '.oskssmmsskSo.',
      '..osssssssSo..',
      '...oossssoo...',
    ],
    body: {
      rest: [
        '....oorffroo....',
        '..oocvrffrcCoo..',
        '.ovcctcffctcCDo.',
        '.ovcotcffctoCDo.',
        '.ovcotcFFctoCDo.',
        '.ovcottggttoCDo.',
        '.osSoBBBBBBoSSo.',
        '..ooopppppPooo..',
        '................',
      ],
      // Left hand back (higher), right hand forward (lower), and the reverse.
      a: [
        '....oorffroo....',
        '..oocvrffrcCoo..',
        '.ovcctcffctcCDo.',
        '.ovcotcffctoCDo.',
        '.ovcotcFFctoCDo.',
        '.osSottggttoCDo.',
        '..oooBBBBBBoCDo.',
        '....opppppPoSSo.',
        '............oo..',
      ],
      b: [
        '....oorffroo....',
        '..oocvrffrcCoo..',
        '.ovcctcffctcCDo.',
        '.ovcotcffctoCDo.',
        '.ovcotcFFctoCDo.',
        '.ovcottggttoSSo.',
        '.ovcoBBBBBBooo..',
        '.osSopppppPo....',
        '..oo............',
      ],
    },
    legs: {
      stand: ['....opppppPo....', '....oppoopPo....', '....oppoopPo....', '...obbdoobbdo...', '...oooo..oooo...'],
      // Contact: one boot planted on the ground line, the other lifted behind it.
      a: ['....opppppPo....', '....oppoopPo....', '....oppoobdo....', '...obbdooooo....', '...oooo.........'],
      b: ['....opppppPo....', '....oppoopPo....', '....obdoopPo....', '....ooooobbdo...', '.........oooo...'],
    },
    bodyOverlap: 1,
  },

  up: {
    head: [
      '........oo....',
      '....oooojjo...',
      '...ohhhhjjhoo.',
      '..ohhjjhhhhho.',
      '.ohhjjhhhhhho.',
      '.ohjhhhhhhhHo.',
      '.ohhhhhhhhHHo.',
      '.ohhhhhhhhhHo.',
      '.ohhhhhhhhHHo.',
      '.oShhhhhhhHSo.',
      '.oShhHhhhHHSo.',
      '..ohHhhHhHHo..',
      '...oHHHHHHo...',
      '...oossssoo...',
    ],
    body: {
      rest: [
        '....oonnnnoo....',
        '..oocooooooCoo..',
        '.ovcoyygggGoCDo.',
        '.ovcoGGGGGGoCDo.',
        '.ovcoggyygGoCDo.',
        '.ovcogggggGoCDo.',
        '.osSoGGGGGGoSSo.',
        '..oooooooooooo..',
        '................',
      ],
      a: [
        '....oonnnnoo....',
        '..oocooooooCoo..',
        '.ovcoyygggGoCDo.',
        '.ovcoGGGGGGoCDo.',
        '.ovcoggyygGoCDo.',
        '.osSogggggGoCDo.',
        '..oooGGGGGGoCDo.',
        '....ooooooooSSo.',
        '............oo..',
      ],
      b: [
        '....oonnnnoo....',
        '..oocooooooCoo..',
        '.ovcoyygggGoCDo.',
        '.ovcoGGGGGGoCDo.',
        '.ovcoggyygGoCDo.',
        '.ovcogggggGoSSo.',
        '.ovcoGGGGGGooo..',
        '.osSoooooooo....',
        '..oo............',
      ],
    },
    legs: {
      stand: ['....opppppPo....', '....oppoopPo....', '....oppoopPo....', '...obbdoobbdo...', '...oooo..oooo...'],
      a: ['....opppppPo....', '....oppoopPo....', '....oppoobdo....', '...obbdooooo....', '...oooo.........'],
      b: ['....opppppPo....', '....oppoopPo....', '....obdoopPo....', '....ooooobbdo...', '.........oooo...'],
    },
    bodyOverlap: 1,
  },

  // Facing left; right-facing frames are mirrored from these.
  left: {
    head: [
      '........oo....',
      '.....ooojjo...',
      '....ohhhjjhoo.',
      '...ohhjjhhhhho',
      '..ohhjhhhhhhho',
      '..ohhhhhhhhhHo',
      '.ohhhhhhhhhHHo',
      '.oHhhhhhhhhHHo',
      '.ohsssssShhHHo',
      '.osessssShhHHo',
      'ossessssShhHo.',
      '.oksssssShHo..',
      '..omsssSSHo...',
      '...ooossoo....',
    ],
    headBlink: [
      '........oo....',
      '.....ooojjo...',
      '....ohhhjjhoo.',
      '...ohhjjhhhhho',
      '..ohhjhhhhhhho',
      '..ohhhhhhhhhHo',
      '.ohhhhhhhhhHHo',
      '.oHhhhhhhhhHHo',
      '.ohsssssShhHHo',
      '.osssssssShhHo',
      'ossessssShhHo.',
      '.oksssssShHo..',
      '..omsssSSHo...',
      '...ooossoo....',
    ],
    body: {
      rest: [
        '.....oofrroo....',
        '....ovcccCCoggo.',
        '....ovcccCCoyggo',
        '....ovcccCCogggo',
        '....ovcccCCottto',
        '....ovcccCCogGgo',
        '....oBBBBBBoGGGo',
        '....opppppPooooo',
        '................',
      ],
      a: [
        '.....oofrroo....',
        '....ovcccCCoggo.',
        '....ovcccCCoyggo',
        '....ovcccCCogggo',
        '....ovcccCCottto',
        '....ovcccCCogGgo',
        '....oBBBBBBoGGGo',
        '....opppppPooooo',
        '................',
      ],
      b: [
        '.....oofrroo....',
        '....ovcccCCoggo.',
        '....ovcccCCoyggo',
        '....ovcccCCogggo',
        '....ovcccCCottto',
        '....ovcccCCogGgo',
        '....oBBBBBBoGGGo',
        '....opppppPooooo',
        '................',
      ],
    },
    // The near arm swings forward (towards the facing side) and back.
    arm: {
      x: 3,
      y: 1,
      rest: ['...ocCo.', '...ocCo.', '...ocCo.', '...ocCo.', '...osSo.', '....oo..'],
      a: ['...ocCo.', '...ocCo.', '...ocCo.', '....ocCo', '....osSo', '.....oo.'],
      b: ['...ocCo.', '...ocCo.', '..ocCo..', '.ocCo...', '.osSo...', '..oo....'],
    },
    legs: {
      stand: ['.....opppPo.....', '.....opppPo.....', '.....opppPo.....', '....obbbbdo.....', '....ooooooo.....'],
      // Near leg (lit) forward / far leg (shaded) forward.
      a: ['.....opppPPo....', '....oppooPPo....', '...oppo..oPPo...', '..obbbo..oddo...', '..ooooo..oooo...'],
      b: ['.....oPPpppo....', '....oPPoopPo....', '...oPPo..oppo...', '..odddo..obbo...', '..ooooo..oooo...'],
      pass: ['.....opppPo.....', '.....oppPPo.....', '.....opppPo.....', '.....obbbdo.....', '.....oooooo.....'],
    },
    bodyOverlap: 1,
  },
};
