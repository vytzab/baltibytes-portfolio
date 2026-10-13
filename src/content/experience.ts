// Professional experience for the Guild Hall: one plaque per role, plus the notice board's
// overview.
//
// PLACEHOLDER (2026-10-13): Claude does not know the owner's work history, so every role below
// except "Independent projects" is a TODO template. The owner replaces them with real roles,
// dates and achievements (and decides what may be public).
import type { Accent } from './projects.ts';

export interface Role {
  /** Stable id: maps refer to it ("experience" property); the validator checks it exists. */
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

export const EXPERIENCE_OVERVIEW = {
  title: 'Guild records',
  summary: 'TODO: two or three sentences about your career so far: where you have worked, what kind of engineering you do, what you are looking for next.',
};

export const ROLES: Role[] = [
  {
    id: 'role-current',
    title: 'TODO: Job title',
    organisation: 'TODO: Company',
    period: 'TODO: 20XX – present',
    accent: 'gold',
    summary: 'TODO: one or two sentences on the team, the product and your part in it.',
    highlights: ['TODO: an outcome you are proud of (with a number if you have one)', 'TODO: something you built or improved', 'TODO: how you worked with others'],
    stack: ['TODO'],
  },
  {
    id: 'role-previous',
    title: 'TODO: Job title',
    organisation: 'TODO: Company',
    period: 'TODO: 20XX – 20XX',
    accent: 'denim',
    summary: 'TODO: one or two sentences.',
    highlights: ['TODO', 'TODO'],
    stack: ['TODO'],
  },
  {
    id: 'independent',
    title: 'Independent software engineer',
    organisation: 'Personal projects',
    period: 'TODO: years',
    accent: 'moss',
    summary: 'Designing, building and shipping my own products end to end: two native Android apps, two web apps and a local AI video tool. The Dungeon below the village has a case study for each.',
    highlights: [
      'Android apps in Kotlin and Jetpack Compose, built for offline use and accessibility',
      'A self-hosted web app in daily household use, on a Raspberry Pi',
      'A local AI pipeline that keeps model output accurate with deterministic layout',
    ],
    stack: ['Kotlin', 'TypeScript', 'React', 'Java', 'Spring Boot', 'Python', 'Flask'],
  },
];

export const roleById = (id: string): Role | undefined => ROLES.find((r) => r.id === id);
