// Skills for the Skill Tower, grouped into categories (one lectern each).
//
// DRAFT (2026-10-13): drawn from the stacks of the projects in projects.ts. Each skill lists the
// projects it was used in, so the tower shows evidence instead of self-ratings. The owner adds,
// removes or rewords anything, adds skills from work experience, and fills the TODO lines.
import type { Accent } from './projects.ts';

export interface Skill {
  name: string;
  /** Project ids (projects.ts) where it was used; shown as links to their case studies. */
  usedIn: string[];
  /** Optional one-line note. */
  note?: string;
}

export interface SkillCategory {
  /** Stable id: maps refer to it ("skills" property); the validator checks it exists. */
  id: string;
  title: string;
  /** One line under the title. */
  summary: string;
  accent: Accent;
  skills: Skill[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    summary: 'The languages the projects are written in.',
    accent: 'heather',
    skills: [
      { name: 'Kotlin', usedIn: ['ninelight', 'portio'] },
      { name: 'TypeScript', usedIn: ['mealplanner', 'scoretracker'], note: 'Also this website.' },
      { name: 'Java', usedIn: ['mealplanner'] },
      { name: 'Python', usedIn: ['scoretracker', 'video-studio'] },
      { name: 'SQL', usedIn: ['mealplanner', 'scoretracker'] },
    ],
  },
  {
    id: 'mobile',
    title: 'Android',
    summary: 'Native Android apps, built to be fast, offline and accessible.',
    accent: 'moss',
    skills: [
      { name: 'Jetpack Compose & Material 3', usedIn: ['ninelight', 'portio'] },
      { name: 'Room & DataStore', usedIn: ['ninelight', 'portio'], note: 'On-device data, no account needed.' },
      { name: 'Hilt & Coroutines/Flow', usedIn: ['ninelight', 'portio'] },
      { name: 'Accessibility (TalkBack, large fonts, reduced motion)', usedIn: ['ninelight'] },
      { name: 'Layouts for tablets, foldables and landscape', usedIn: ['portio', 'ninelight'] },
    ],
  },
  {
    id: 'web',
    title: 'Web front end',
    summary: 'Single-page apps and installable web apps.',
    accent: 'denim',
    skills: [
      { name: 'React 19', usedIn: ['mealplanner', 'scoretracker'] },
      { name: 'Vite', usedIn: ['mealplanner', 'scoretracker'], note: 'Also this website.' },
      { name: 'Progressive web apps', usedIn: ['mealplanner'] },
      { name: 'Tailwind, React Hook Form, Zod', usedIn: ['mealplanner'] },
      { name: 'Phaser (2D games)', usedIn: [], note: 'This website.' },
    ],
  },
  {
    id: 'backend',
    title: 'Back end & data',
    summary: 'APIs, databases and the schemas between them.',
    accent: 'gold',
    skills: [
      { name: 'Spring Boot & Spring Data JPA', usedIn: ['mealplanner'] },
      { name: 'Flask & SQLAlchemy', usedIn: ['scoretracker'] },
      { name: 'MariaDB / MySQL', usedIn: ['mealplanner', 'scoretracker'] },
      { name: 'Schema migrations (Flyway, Alembic)', usedIn: ['mealplanner', 'scoretracker'] },
      { name: 'REST API design', usedIn: ['scoretracker', 'mealplanner'] },
    ],
  },
  {
    id: 'ai',
    title: 'AI & media',
    summary: 'Local AI pipelines that stay accurate and run on your own machine.',
    accent: 'brick',
    skills: [
      { name: 'Local LLMs with Ollama', usedIn: ['video-studio'] },
      { name: 'Text-to-speech (Kokoro)', usedIn: ['video-studio'] },
      { name: 'Deterministic layout around model output', usedIn: ['video-studio'] },
      { name: 'Video rendering with ffmpeg', usedIn: ['video-studio'] },
    ],
  },
  {
    id: 'practice',
    title: 'Practices',
    summary: 'How the work gets done.',
    accent: 'heather',
    skills: [
      { name: 'Testable architecture (pure domain logic)', usedIn: ['ninelight', 'scoretracker'] },
      { name: 'Automated tests (JUnit, Vitest, pytest)', usedIn: ['mealplanner', 'video-studio', 'ninelight'] },
      { name: 'Self-hosting (Raspberry Pi, nginx)', usedIn: ['mealplanner'] },
      { name: 'Generated, reproducible art and sound', usedIn: ['ninelight'], note: 'And this website.' },
      { name: 'TODO: anything from work (code review, mentoring, CI/CD, …)', usedIn: [] },
    ],
  },
];

export const skillCategoryById = (id: string): SkillCategory | undefined => SKILL_CATEGORIES.find((c) => c.id === id);
