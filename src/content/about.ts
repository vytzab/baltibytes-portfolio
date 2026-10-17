// "About me" for the Starting Village, in the owner's words (approved 2026-10-17). The game shows
// it through the guide, the notice board and the workshop door; the résumé and the accessible
// HTML version read the same data.

export interface About {
  /** Full name, for the notice board and the résumé heading. */
  name: string;
  /** What characters call the owner in conversation. */
  firstName: string;
  /** One line, e.g. "Software engineer in Vilnius". */
  tagline: string;
  /** Short paragraphs for the notice board, each shown as one dialogue page. */
  bio: string[];
  /** What the workshop door says: what you're building or tinkering with now. */
  workshop: string[];
}

export const ABOUT: About = {
  name: 'Vytautas Zabielskas',
  firstName: 'Vytautas',
  tagline: 'Software engineer',
  bio: [
    "I'm a software engineer based in Vilnius. I work mostly on the backend and step into the UI when a feature needs it.",
    "I joined my company in operations in 2021 and moved into engineering in January 2025, so I know the systems I build from the user's side too. Along the way I finished a bachelor's in Software Systems at Vilnius University of Applied Sciences.",
    'In my spare time I build apps that make everyday life a little easier, from brain games for Android to a meal planner that runs on a Raspberry Pi at home. I care about clean architecture, good tests and a bit of polish, and I like shipping things people actually use.',
    "Away from the keyboard I box and play chess, and I'm a big basketball and football fan, though I only watch those. Thanks for walking around my village!",
  ],
  workshop: [
    'The workshop is locked. Through the window: a desk, two monitors and a half-built keyboard.',
    'A sign hangs on the door: "Work in progress! This website is being built right now, so new places open soon. Thanks for visiting!"',
  ],
};
