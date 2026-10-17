// Professional experience for the Guild Hall: one plaque per role (room for four), plus the
// records board's overview, and education for the résumé.
//
// Roles, dates, highlights and the employer's name confirmed by Vytautas on 2026-10-17.
import type { Accent } from './projects.ts';

export interface Role {
  /** Stable id: maps refer to it ("panel" property, "role:<id>"); the validator checks it exists. */
  id: string;
  title: string;
  organisation: string;
  /** e.g. "2022 – present". */
  period: string;
  location?: string;
  accent: Accent;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface Education {
  qualification: string;
  school: string;
  /** e.g. "Graduated Feb 2024". */
  period: string;
  note?: string;
}

export const EXPERIENCE_OVERVIEW = {
  title: 'Guild records',
  summary: 'At Nasdaq in Vilnius since 2020: first in client success, then in systems operations, and since January 2025 as a software developer. Along the way, while working, I finished a bachelor\'s in Software Systems. In my spare time I build and self-host my own apps.',
};

export const ROLES: Role[] = [
  {
    id: 'developer',
    title: 'Senior Software Developer',
    organisation: 'Nasdaq',
    period: 'Jan 2025 – present',
    location: 'Vilnius, Lithuania',
    accent: 'gold',
    summary: 'Mostly backend work, with some UI, after five years on the client and operations side of the same company.',
    highlights: [
      'Designing and building backend services where correctness and uptime matter',
      'Taking features end to end, from the backend through to the UI',
      'Working in a shared codebase: code reviews, design discussions, tests with every change',
    ],
    stack: ['Java', 'Spring Boot', 'Apache Kafka', 'TypeScript', 'AWS', 'Prometheus', 'Grafana', 'SonarQube', 'CI/CD'],
  },
  {
    id: 'operations',
    title: 'Senior Systems Operations Analyst',
    organisation: 'Nasdaq',
    period: 'Aug 2021 – Jan 2025',
    location: 'Vilnius, Lithuania',
    accent: 'denim',
    summary: 'Looking after production systems: their health, their incidents and the changes made to them.',
    highlights: [
      'Keeping production systems healthy: monitoring, incident response, finding root causes',
      'Linux administration, and scripting repetitive work away',
      'Running releases and changes to production safely',
    ],
    stack: ['Linux', 'System administration', 'Incident handling', 'Shell scripting', 'Log analysis'],
  },
  {
    id: 'client-success',
    title: 'Market Technology Client Success Analyst',
    organisation: 'Nasdaq',
    period: 'Feb 2020 – Aug 2021',
    location: 'Vilnius, Lithuania',
    accent: 'brick',
    summary: 'The link between clients using the company\'s market technology and the teams behind it.',
    highlights: [
      'Helping clients work with the company\'s market technology',
      'Turning a client\'s description of a problem into a technical issue a team can act on',
      'Clear communication with clients and internal teams',
    ],
    stack: [],
  },
  {
    id: 'independent',
    title: 'Independent software engineer',
    organisation: 'Personal projects',
    period: '2025 – present',
    accent: 'moss',
    summary: 'Designing, building and running my own apps end to end: an Android app and three web apps, most of them self-hosted on a Raspberry Pi. The Dungeon below the village has a case study for each.',
    highlights: [
      'A native Android app in Kotlin and Jetpack Compose, built for offline use and accessibility',
      'Web apps with Spring Boot, Flask, FastAPI and React, deployed with Docker and CI to a Raspberry Pi',
      'A control panel that watches the Pi and its apps, with phone alerts and backups',
    ],
    stack: ['Kotlin', 'Java', 'Spring Boot', 'Python', 'Flask', 'FastAPI', 'TypeScript', 'React', 'Docker'],
  },
];

export const EDUCATION: Education[] = [
  {
    qualification: 'Bachelor\'s in Software Systems',
    school: 'Vilnius University of Applied Sciences',
    period: 'Graduated Feb 2024',
    note: 'Studied while working.',
  },
];

export const roleById = (id: string): Role | undefined => ROLES.find((r) => r.id === id);
