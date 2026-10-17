// Projects for the Dungeon's case studies (and later the accessible HTML version). The Dungeon
// fills its vaults in this order.
//
// DRAFT: written by Claude from each project's own README (2026-10-13, refreshed 2026-10-17).
// Status, role and outcome were confirmed by Vytautas on 2026-10-17. Vytautas reviews any new
// claim first: all four repositories are private, and this repository is public.

/** Palette accent used for the project's vault banner and the case-study panel. */
export type Accent = 'brick' | 'denim' | 'moss' | 'gold' | 'heather';

export interface CaseStudySection {
  /** Short tab label. */
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Project {
  /** Stable id: maps refer to it ("panel" property); the validator checks it exists. */
  id: string;
  title: string;
  /** One line under the title. */
  tagline: string;
  /** What kind of thing it is, e.g. "Android app". */
  kind: string;
  status: string;
  /** The owner's role. */
  role: string;
  stack: string[];
  accent: Accent;
  sections: CaseStudySection[];
  links: Array<{ label: string; url: string }>;
}

export const PROJECTS: Project[] = [
  {
    id: 'mealplanner',
    title: 'MealPlanner',
    tagline: 'A self-hosted meal planner for a small household, running on a Raspberry Pi.',
    kind: 'Web app (PWA)',
    status: 'Being filled with recipes for daily use at home',
    role: 'Solo: backend, frontend, hosting on a Raspberry Pi',
    stack: ['Java 21', 'Spring Boot', 'Flyway', 'MariaDB', 'React 19', 'TypeScript', 'Tailwind', 'Zod', 'Docker'],
    accent: 'gold',
    sections: [
      {
        title: 'Overview',
        paragraphs: ['An ingredient catalog with nutrition data, recipes built from ingredients and other recipes, per-person and shared daily plans, a nutrition dashboard and a combined shopping list, used as an installable app on phones. The interface is in Lithuanian.'],
      },
      {
        title: 'Challenge',
        paragraphs: ['A real household tool has to be dependable on modest hardware: a Raspberry Pi, a schema that evolves safely, and a phone-friendly interface that installs like an app.'],
      },
      {
        title: 'Approach',
        paragraphs: ['A Spring Boot API with versioned Flyway migrations and a React single-page app built with Vite and shipped as a PWA, both running in Docker on the Pi.'],
        bullets: [
          'Forms validated with React Hook Form and Zod',
          'Backend tests on JUnit and Mockito with an in-memory database',
          'Linting (including accessibility rules), type checks and tests on every push; a merge to main builds, tests and deploys to the Pi',
        ],
      },
      {
        title: 'Outcome',
        paragraphs: ['The core is built and running on the Pi. I\'m now filling the catalog with ingredients and recipes so it can take over our meal planning at home.'],
        bullets: [
          'Evolving a real database schema safely with versioned migrations',
          'Running an app end to end: Docker, nightly backups, HTTPS for the installable app, automated deploys',
          'Keeping business rules in plain, tested code, apart from the UI',
        ],
      },
    ],
    links: [],
  },
  {
    id: 'ninelight',
    title: 'Ninelight',
    tagline: 'Short, focused brain games for Android, grouped by the kind of thinking they challenge.',
    kind: 'Android app',
    status: 'In development · not yet on Google Play',
    role: 'Solo: design, code, art, sound',
    stack: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Room', 'DataStore', 'Hilt', 'Coroutines', 'TypeScript', 'Cloudflare Workers'],
    accent: 'heather',
    sections: [
      {
        title: 'Overview',
        paragraphs: ['A daily workout of short games across nine skills (memory, attention, processing speed, logic, numeracy, spatial reasoning, language, executive function and problem solving), with difficulty that adapts and progress tracked per skill.'],
        bullets: [
          '27 games, three for every skill',
          'Adaptive difficulty and a streak that forgives a rest day',
          'A daily challenge with the same puzzles for everyone, and an optional leaderboard under a made-up name',
          'Play together on one phone, or challenge a friend with a code',
          'No account and no subscription: a free daily set and a one-time unlock',
        ],
      },
      {
        title: 'Challenge',
        paragraphs: [
          'Brain-training apps tend to sit behind subscriptions and accounts. The aim was the opposite: a polished daily habit that works fully on the device and offline, where only the optional leaderboard needs a connection.',
          'Twenty-seven games also means twenty-seven sets of rules, levels and scoring that have to feel consistent and fair.',
        ],
      },
      {
        title: 'Approach',
        paragraphs: ['Every game is a small, pure rules engine (a puzzle generator, a state machine and a scorer) with randomness and time passed in, so games are deterministic and unit-tested. The Compose layer only draws state and forwards taps.'],
        bullets: [
          'One shared play host gives every game its demo, practice round, timing, sound and haptics',
          'Icons, illustrations and sound effects are generated by scripts, so the look stays consistent',
          'Accessibility built in: TalkBack support where games allow it, large fonts, reduced motion, never colour alone',
          'Phones, tablets and foldables, plus a home-screen widget',
        ],
      },
      {
        title: 'Outcome',
        paragraphs: ['In closed testing on Google Play, working through the testing period required before a public release.'],
        bullets: [
          'A daily challenge leaderboard on a small serverless backend (a TypeScript Cloudflare Worker with a SQLite database), protected against cheating with signed requests and Google Play Integrity checks',
          'Monetisation without a subscription: a free daily set and a one-time unlock, bought through Google Play',
        ],
      },
    ],
    links: [{ label: 'Today\'s leaderboard', url: 'https://daily.baltibytes.com' }],
  },
  {
    id: 'scoretracker',
    title: 'ScoreTracker',
    tagline: 'A session-first platform for tracking games, matches and small tournaments.',
    kind: 'Web app',
    status: 'In use on a Raspberry Pi; more planned',
    role: 'Solo',
    stack: ['Python 3.12', 'Flask', 'SQLAlchemy 2', 'Alembic', 'MariaDB', 'React 19', 'TypeScript', 'Vite', 'Docker'],
    accent: 'denim',
    sections: [
      {
        title: 'Overview',
        paragraphs: ['Sessions, players and configurable game types: each game type sets its participant rules, scoring and winner modes and its own score fields, so new games need configuration, not code.'],
        bullets: ['Game instances with nested matches and participants', 'Manual tournaments with registration, matches and standings', 'A statistics dashboard'],
      },
      {
        title: 'Challenge',
        paragraphs: ['Supporting very different games (solo, team, best-of, points or placings) without a special case for each.'],
      },
      {
        title: 'Approach',
        paragraphs: ['A layered Flask backend (models, repositories, routes, services) with a generic scoring engine and a match validator driven by each game type, behind a consistent JSON response envelope with pagination.'],
        bullets: [
          'Documented API and database schema',
          'A React + TypeScript frontend with one central API client',
          'Backend tests, frontend lint, tests and build on every push; images are deployed to the Pi with Docker Compose only after they pass',
        ],
      },
      {
        title: 'Outcome',
        paragraphs: ['Running on the Pi with real data from our game nights. Next: tournament brackets, head-to-head statistics and a login.'],
      },
    ],
    links: [],
  },
  {
    id: 'controlpanel',
    title: 'Control Panel',
    tagline: 'One place to watch and look after every app on a home Raspberry Pi.',
    kind: 'Web app',
    status: 'In use on the Pi; more planned',
    role: 'Solo',
    stack: ['Python 3.12', 'FastAPI', 'React 19', 'TypeScript', 'Vite', 'Docker', 'nginx', 'GitHub Actions'],
    accent: 'moss',
    sections: [
      {
        title: 'Overview',
        paragraphs: ['A self-hosted panel for a Raspberry Pi that runs several web apps in Docker, MealPlanner and ScoreTracker among them.'],
        bullets: [
          'Every app with its status, health and running version, live logs, and start, stop and restart',
          'The Pi\'s health: disk, temperature and throttling, memory, network and time sync, with 24-hour charts',
          'Database backups: when each last ran, and a button to back up now',
          'Phone alerts when something goes wrong and when it recovers, and an activity log of every action',
        ],
      },
      {
        title: 'Challenge',
        paragraphs: ['A home server only stays dependable if someone notices when a disk fills up, a backup fails or a container keeps restarting. The panel needed that visibility and a few safe actions, without giving a web app free rein over the machine.'],
      },
      {
        title: 'Approach',
        paragraphs: ['A small, read-only health agent checks the Pi; a FastAPI backend behind a login reads Docker through a restricted socket proxy and records health history; a React frontend shows it all.'],
        bullets: [
          'Actions need a confirmation and are written to an audit log',
          'The Pi\'s shared infrastructure (MariaDB, nightly backups) is defined in the same repository',
          'CI builds an image per commit; updating or rolling back means changing one image tag',
          'Linted and tested with pytest',
        ],
      },
      {
        title: 'Outcome',
        paragraphs: ['Every app on the Pi, its health and its backups now sit on one page, and my phone tells me when something needs attention, and again when it recovers.'],
      },
    ],
    links: [],
  },
];

export const projectById = (id: string): Project | undefined => PROJECTS.find((p) => p.id === id);
