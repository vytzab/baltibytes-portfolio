// Skills for the Skill Tower, grouped into categories (one lectern each).
//
// DRAFT (2026-10-13, updated 2026-10-17 for the new project list): drawn from the stacks of the
// projects in projects.ts. Each skill lists the projects it was used in, so the tower shows
// evidence instead of self-ratings; skills from work have a note instead (the Guild Hall has the
// roles). Reviewed with Vytautas on 2026-10-17.
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
    summary: 'The languages I write, in my projects and at work.',
    accent: 'heather',
    skills: [
      { name: 'Kotlin', usedIn: ['ninelight'] },
      { name: 'TypeScript', usedIn: ['mealplanner', 'scoretracker', 'controlpanel'], note: 'Also at work, and this website.' },
      { name: 'Java', usedIn: ['mealplanner', 'fix'], note: 'Also at work.' },
      { name: 'Python', usedIn: ['scoretracker', 'controlpanel'] },
      { name: 'SQL', usedIn: ['mealplanner', 'scoretracker'] },
      { name: 'Shell scripting', usedIn: [], note: 'At work, in operations.' },
    ],
  },
  {
    id: 'mobile',
    title: 'Android',
    summary: 'Native Android apps, built to be fast, offline and accessible.',
    accent: 'moss',
    skills: [
      { name: 'Jetpack Compose & Material 3', usedIn: ['ninelight'] },
      { name: 'Room & DataStore', usedIn: ['ninelight'], note: 'On-device data, no account needed.' },
      { name: 'Hilt & Coroutines/Flow', usedIn: ['ninelight'] },
      { name: 'Accessibility (TalkBack, large fonts, reduced motion)', usedIn: ['ninelight'] },
      { name: 'Layouts for tablets, foldables and landscape', usedIn: ['ninelight'] },
    ],
  },
  {
    id: 'web',
    title: 'Web front end',
    summary: 'Single-page apps and installable web apps.',
    accent: 'denim',
    skills: [
      { name: 'React 19', usedIn: ['mealplanner', 'scoretracker', 'controlpanel'] },
      { name: 'Vite', usedIn: ['mealplanner', 'scoretracker', 'controlpanel'], note: 'Also this website.' },
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
      { name: 'Spring Boot & Spring Data JPA', usedIn: ['mealplanner'], note: 'Also at work.' },
      { name: 'Apache Kafka', usedIn: [], note: 'At work.' },
      { name: 'FIX protocol (QuickFIX/J)', usedIn: ['fix'] },
      { name: 'Flask & SQLAlchemy', usedIn: ['scoretracker'] },
      { name: 'FastAPI', usedIn: ['controlpanel'] },
      { name: 'Relational databases (MariaDB / MySQL)', usedIn: ['mealplanner', 'scoretracker', 'fix'], note: 'Also at work.' },
      { name: 'Schema migrations (Flyway, Alembic)', usedIn: ['mealplanner', 'scoretracker'] },
      { name: 'RESTful API design', usedIn: ['scoretracker', 'mealplanner'], note: 'Also at work.' },
      { name: 'OpenAPI / Swagger', usedIn: [], note: 'At work.' },
    ],
  },
  {
    id: 'ops',
    title: 'DevOps & hosting',
    summary: 'Running software and keeping it healthy: production systems at work, my own apps on a Raspberry Pi.',
    accent: 'brick',
    skills: [
      { name: 'Docker & Docker Compose', usedIn: ['mealplanner', 'scoretracker', 'controlpanel'] },
      { name: 'CI/CD with GitHub Actions', usedIn: ['mealplanner', 'scoretracker', 'controlpanel'], note: 'CI/CD at work too.' },
      { name: 'Linux & system administration', usedIn: ['controlpanel'], note: 'At work, in operations.' },
      { name: 'Raspberry Pi & nginx', usedIn: ['mealplanner', 'controlpanel'] },
      { name: 'Monitoring, alerts and backups', usedIn: ['controlpanel'] },
      { name: 'Observability (Prometheus, Grafana)', usedIn: [], note: 'At work.' },
      { name: 'Amazon Web Services (AWS)', usedIn: [], note: 'At work.' },
    ],
  },
  {
    id: 'practice',
    title: 'Practices',
    summary: 'How the work gets done.',
    accent: 'heather',
    skills: [
      { name: 'Object-oriented programming', usedIn: ['fix', 'mealplanner', 'ninelight'], note: 'Also at work.' },
      { name: 'Testable architecture (pure domain logic)', usedIn: ['ninelight', 'scoretracker'] },
      { name: 'Automated tests (JUnit, Vitest, pytest)', usedIn: ['mealplanner', 'ninelight', 'scoretracker', 'controlpanel'] },
      { name: 'Generated, reproducible art and sound', usedIn: ['ninelight'], note: 'And this website.' },
      { name: 'Incident handling and root-cause analysis', usedIn: [], note: 'At work, in operations.' },
      { name: 'Log analysis', usedIn: [], note: 'At work, in operations.' },
      { name: 'Secure coding practices', usedIn: [], note: 'At work.' },
      { name: 'Code quality with SonarQube', usedIn: [], note: 'At work.' },
      { name: 'Agile software development', usedIn: [], note: 'At work.' },
    ],
  },
];

export const skillCategoryById = (id: string): SkillCategory | undefined => SKILL_CATEGORIES.find((c) => c.id === id);
