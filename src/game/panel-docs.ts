// Turns content (projects, skills, experience) into documents for the info panel, by key:
// "project:<id>", "skills:<id>", "role:<id>" or "experience". Links between documents are keys
// too, so a skill can point at the projects that used it and the records board at each role.
import type { Accent } from '../content/projects.ts';
import { PROJECTS, projectById } from '../content/projects.ts';
import { skillCategoryById } from '../content/skills.ts';
import { EXPERIENCE_OVERVIEW, ROLES, roleById } from '../content/experience.ts';

export interface PanelItem {
  label: string;
  note?: string;
  /** Other documents this item leads to (shown as buttons). */
  links?: Array<{ label: string; key: string }>;
}

export interface PanelSection {
  /** Tab label (tabs only appear when a document has more than one section). */
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  items?: PanelItem[];
}

export interface PanelDoc {
  key: string;
  accent: Accent;
  /** Small line above the title. */
  kicker: string;
  title: string;
  tagline?: string;
  sections: PanelSection[];
  role?: string;
  chips?: string[];
  chipsLabel?: string;
  links?: Array<{ label: string; url: string }>;
  /** Shown when there are no links. */
  note?: string;
}

const projectTitle = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? id;

export function docFor(key: string): PanelDoc | undefined {
  const [kind, id = ''] = key.split(':') as [string, string?];

  if (kind === 'project') {
    const p = projectById(id);
    if (!p) return undefined;
    return {
      key,
      accent: p.accent,
      kicker: `${p.kind} · ${p.status}`,
      title: p.title,
      tagline: p.tagline,
      sections: p.sections,
      role: p.role,
      chips: p.stack,
      chipsLabel: 'Stack',
      links: p.links,
      note: 'Source is private; happy to walk through it on request.',
    };
  }

  if (kind === 'skills') {
    const cat = skillCategoryById(id);
    if (!cat) return undefined;
    return {
      key,
      accent: cat.accent,
      kicker: 'Skill Tower',
      title: cat.title,
      tagline: cat.summary,
      sections: [
        {
          title: 'Skills',
          items: cat.skills.map((s) => ({
            label: s.name,
            note: s.note,
            links: s.usedIn.map((pid) => ({ label: projectTitle(pid), key: `project:${pid}` })),
          })),
        },
      ],
    };
  }

  if (kind === 'role') {
    const r = roleById(id);
    if (!r) return undefined;
    return {
      key,
      accent: r.accent,
      kicker: [r.organisation, r.period, r.location].filter(Boolean).join(' · '),
      title: r.title,
      tagline: r.summary,
      sections: [{ title: 'Highlights', bullets: r.highlights }],
      chips: r.stack,
      chipsLabel: 'Stack',
    };
  }

  if (kind === 'experience') {
    return {
      key,
      accent: 'gold',
      kicker: 'Guild Hall',
      title: EXPERIENCE_OVERVIEW.title,
      tagline: EXPERIENCE_OVERVIEW.summary,
      sections: [
        {
          title: 'Roles',
          items: ROLES.map((r) => ({ label: `${r.title}, ${r.organisation}`, note: r.period, links: [{ label: 'Open', key: `role:${r.id}` }] })),
        },
      ],
    };
  }

  return undefined;
}
