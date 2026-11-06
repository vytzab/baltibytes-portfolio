// Ninelight's own pages (/ninelight/): what the app is, for players. The copy follows the Play
// listing (androidEduGame/docs/store-listing.md) and its rule: no claims that the games improve
// memory, intelligence or anything else (the app's plan D10). The privacy policy and the terms are
// Markdown beside this file: privacy.md is a copy of the policy for the version on Google Play
// (androidEduGame/PRIVACY.md once that version ships), terms.md is written here.

export const NINELIGHT = {
  name: 'Ninelight',
  // The badge's link. utm_source=website is Google Play's install referrer, so Play Console counts installs from here.
  playUrl: 'https://play.google.com/store/apps/details?id=com.vytzab.ninefold&referrer=utm_source%3Dwebsite',
  dailyBoardUrl: 'https://daily.baltibytes.com',
  email: 'baltibytes@gmail.com',
  headline: 'Short daily brain games across nine skills',
  lede: 'No subscription. No account. No ads. Your results stay on your phone.',
  platforms: 'For Android phones and tablets',
};

/** Store screenshots (framed, as on Google Play), with their captions as the alt text. */
export const SCREENSHOTS: Array<{ file: string; caption: string }> = [
  { file: '01-today', caption: 'A few minutes a day, picked for you' },
  { file: '02-games', caption: 'Games across nine skills' },
  { file: '03-map-walk', caption: 'Follow the route in your head' },
  { file: '07-progress', caption: 'Scores for every skill, compared only with you' },
];

/** The skills in the app's order; `id` names the icon in src/ninelight/skills/ (the app's skill ids). */
export const SKILLS: Array<{ id: string; name: string; games: string[] }> = [
  { id: 'memory', name: 'Memory', games: ['Sequence Recall', 'Card Pairs', 'Look Back'] },
  { id: 'attention', name: 'Attention', games: ['Odd One Out', 'Keep Watching', 'Centre Arrow'] },
  { id: 'processing-speed', name: 'Processing speed', games: ['Same or Different', 'Symbol Code', 'Sort Fast'] },
  { id: 'logic', name: 'Logic', games: ['What Comes Next', 'Find the Rule', "Who's Where"] },
  { id: 'numeracy', name: 'Numeracy', games: ['Quick Math', 'Estimate', 'Better Odds'] },
  { id: 'spatial-reasoning', name: 'Spatial reasoning', games: ['Rotate & Match', 'Fold the Cube', 'Map Walk'] },
  { id: 'language', name: 'Language', games: ['Word Unscramble', 'Word Links', 'Missing Letters'] },
  { id: 'executive-function', name: 'Executive function', games: ['Rule Switch', 'Stop Signal', 'Double Duty'] },
  { id: 'problem-solving', name: 'Problem solving', games: ['Tower Planner', 'Switchboard', 'Slide Home'] },
];

export interface Feature {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

/** The sections under the skills, in order. */
export const FEATURES: Feature[] = [
  {
    title: 'A daily workout, picked for you',
    paragraphs: [
      "Each day Ninelight picks a few games from different skills, favouring the ones you haven't played lately. A workout takes a few minutes. Play it, keep a streak going (one rest day a week won't break it), or pick any game you like.",
    ],
  },
  {
    title: 'A daily challenge for everyone',
    paragraphs: [
      'One game a day, with the same puzzles for every player. Your first try is the one that counts. If you like, join the worldwide daily leaderboard under a made-up name and see where your score places. Nothing is sent unless you choose to take part, and you can delete your scores at any time.',
    ],
  },
  {
    title: 'Difficulty that follows you',
    paragraphs: [
      'Every game has levels. Answer well and the next round gets harder; struggle and it eases off. A short demo shows each game being played, a practice round never counts, and relaxed timing gives games against the clock half as long again.',
    ],
  },
  {
    title: 'See your own progress',
    paragraphs: [
      'Every skill gets a score from 0 to 1000 based on the levels you reach. Follow each game on charts, collect personal records, earn achievements and reach a weekly goal. Your progress is compared only with your own history.',
    ],
  },
  {
    title: 'Free to play, one price for everything',
    paragraphs: [
      'Every day, three games are free to play, and every game has a free practice round. Ninelight Unlimited is a single one-time purchase, not a subscription:',
    ],
    bullets: [
      'every game, as often as you like',
      'a longer five-game daily workout and custom training',
      'your whole history, with trends and insights',
    ],
  },
  {
    title: 'Private by design',
    paragraphs: [],
    bullets: [
      'No account, no ads, no tracking and no analytics',
      'Works offline; only the optional daily leaderboard needs a connection',
      'Your results stay on your phone, and you can back them up to a file',
    ],
  },
  {
    title: 'Made for everyone',
    paragraphs: [],
    bullets: [
      'Light and dark themes, phones and tablets, upright or sideways',
      'Large text supported throughout, and several games playable with TalkBack',
      'Colour is never the only clue: shapes, symbols and words go with it',
      'In English and Lithuanian',
    ],
  },
];

/** Under the features, as on the Play listing. */
export const DISCLAIMER = 'Ninelight is a collection of games and challenges. It is not a medical product and makes no health claims.';
