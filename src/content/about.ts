// "About me" for the Starting Village. PLACEHOLDER TEXT: the owner replaces every line marked
// TODO with their own words. The game shows it through the guide, the notice board and the
// workshop door; the accessible HTML version will read the same data.

export interface About {
  name: string;
  /** One line, e.g. "Software engineer in Vilnius". */
  tagline: string;
  /** Short paragraphs for the notice board, each shown as one dialogue page. */
  bio: string[];
  /** What the workshop door says: what you're building or tinkering with now. */
  workshop: string[];
}

export const ABOUT: About = {
  name: 'Vytautas', // TODO: confirm how you want to be named
  tagline: 'Software engineer', // TODO
  bio: [
    'TODO: Who you are in one or two sentences.',
    'TODO: What you like to build, and how you like to work.',
    'TODO: Something human: where you are, what you do away from the keyboard.',
  ],
  workshop: [
    'The workshop is locked. Through the window: a desk, two monitors and a half-built keyboard.',
    'A sign hangs on the door: "Work in progress! This website is being built right now, so new places open soon. Thanks for visiting!"',
  ],
};
