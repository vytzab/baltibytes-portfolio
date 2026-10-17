// The plain version of the site (D3), rendered to HTML at build time (vite.config.ts injects it
// into portfolio.html): everything the game says, as one semantic page that works without
// JavaScript and reads well with a screen reader or a search engine. Everything comes from
// src/content, so the game and this page can't drift apart.
import { ABOUT } from '../content/about.ts';
import { CONTACT, contactLinks } from '../content/contact.ts';
import { EDUCATION, EXPERIENCE_OVERVIEW, ROLES } from '../content/experience.ts';
import { PRIVATE_SOURCE_NOTE, PROJECTS, type Project } from '../content/projects.ts';
import { SHOW_RESUME } from '../content/site.ts';
import { SKILL_CATEGORIES } from '../content/skills.ts';
import { esc } from '../resume/render.ts';

const projectAnchor = (id: string) => `project-${id}`;
const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '');
const external = (url: string, label: string) => `<a href="${esc(url)}">${esc(label)}</a>`;

function project(p: Project): string {
  const sections = p.sections
    .map((s) => `<h4>${esc(s.title)}</h4>${s.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}${list((s.bullets ?? []).map(esc))}`)
    .join('');
  const links = p.links.map((l) => external(l.url, l.label));
  return `
      <article class="card" id="${projectAnchor(p.id)}" data-accent="${p.accent}" aria-labelledby="${projectAnchor(p.id)}-h">
        <h3 id="${projectAnchor(p.id)}-h">${esc(p.title)}</h3>
        <p class="meta">${esc(p.kind)} · ${esc(p.status)} · Role: ${esc(p.role)}</p>
        <p class="lead">${esc(p.tagline)}</p>
        ${sections}
        <p class="stack"><span class="label">Stack:</span> ${p.stack.map(esc).join(' · ')}</p>
        ${links.length ? `<p class="links">${links.join(' · ')}</p>` : ''}
        ${p.publicSource ? '' : `<p class="note">${esc(PRIVATE_SOURCE_NOTE)}</p>`}
      </article>`;
}

export function renderPortfolio(): string {
  const projectTitle = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? id;

  const skills = SKILL_CATEGORIES.map((cat) => {
    const items = cat.skills.map((s) => {
      const usedIn = s.usedIn.length
        ? `<span class="used">Used in ${s.usedIn.map((id) => `<a href="#${projectAnchor(id)}">${esc(projectTitle(id))}</a>`).join(', ')}.</span>`
        : '';
      const note = s.note ? `<span class="used">${esc(s.note)}</span>` : '';
      const details = [usedIn, note].filter(Boolean).join(' ');
      return `<strong>${esc(s.name)}</strong>${details ? ` · ${details}` : ''}`;
    });
    return `
      <section class="card" data-accent="${cat.accent}" aria-labelledby="skills-${cat.id}">
        <h3 id="skills-${cat.id}">${esc(cat.title)}</h3>
        <p class="lead">${esc(cat.summary)}</p>
        ${list(items)}
      </section>`;
  }).join('');

  const roles = ROLES.map(
    (r) => `
      <article class="card" data-accent="${r.accent}" aria-labelledby="role-${r.id}">
        <h3 id="role-${r.id}">${esc(r.title)} <span class="at">· ${esc(r.organisation)}</span></h3>
        <p class="meta">${esc(r.period)}${r.location ? ` · ${esc(r.location)}` : ''}</p>
        <p class="lead">${esc(r.summary)}</p>
        ${list(r.highlights.map(esc))}
        ${r.stack.length ? `<p class="stack"><span class="label">Stack:</span> ${r.stack.map(esc).join(' · ')}</p>` : ''}
      </article>`,
  ).join('');

  const education = EDUCATION.map(
    (e, i) => `
      <article class="card" aria-labelledby="edu-${i}">
        <h3 id="edu-${i}">${esc(e.qualification)} <span class="at">· ${esc(e.school)}</span></h3>
        <p class="meta">${esc(e.period)}</p>
        ${e.note ? `<p>${esc(e.note)}</p>` : ''}
      </article>`,
  ).join('');

  const contact = [
    `<li><span class="label">Email:</span> <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></li>`,
    ...contactLinks().map((l) => `<li><span class="label">${esc(l.label)}:</span> ${external(l.url, l.text)}</li>`),
    ...(SHOW_RESUME ? [`<li><span class="label">Résumé:</span> <a href="${esc(CONTACT.resume.page)}">one printable page</a></li>`] : []),
    `<li><span class="label">Based in:</span> ${esc(CONTACT.location)}</li>`,
  ].join('');

  return `
    <header class="top">
      <h1>${esc(ABOUT.name)}</h1>
      <p class="tagline">${esc(ABOUT.tagline)}</p>
      <p class="availability">${esc(CONTACT.availability)}</p>
      <nav aria-label="On this page">
        <ul class="toc">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section aria-labelledby="about">
        <h2 id="about">About</h2>
        ${ABOUT.bio.map((b) => `<p>${esc(b)}</p>`).join('')}
      </section>
      <section aria-labelledby="projects">
        <h2 id="projects">Projects</h2>
        ${PROJECTS.map(project).join('')}
      </section>
      <section aria-labelledby="skills">
        <h2 id="skills">Skills</h2>
        <p>Each skill names the projects it was used in; skills from work say so.</p>
        ${skills}
      </section>
      <section aria-labelledby="experience">
        <h2 id="experience">Experience</h2>
        <p>${esc(EXPERIENCE_OVERVIEW.summary)}</p>
        ${roles}
      </section>
      <section aria-labelledby="education">
        <h2 id="education">Education</h2>
        ${education}
      </section>
      <section aria-labelledby="contact">
        <h2 id="contact">Contact</h2>
        <ul class="contact">${contact}</ul>
      </section>
    </main>
    <footer>
      <p>This page carries the same content as the game at <a href="/">baltibytes.com</a>, where you can walk the village, open the project vaults and meet the people who keep them.</p>
    </footer>`;
}
