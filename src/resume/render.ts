// The résumé, rendered to HTML at build time (vite.config.ts injects it into resume.html), so it
// works without JavaScript, prints cleanly and reads well with a screen reader. Everything comes
// from src/content: the same words the game shows.
import { ABOUT } from '../content/about.ts';
import { CONTACT, contactLinks } from '../content/contact.ts';
import { EDUCATION, ROLES } from '../content/experience.ts';
import { PROJECTS } from '../content/projects.ts';
import { SKILL_CATEGORIES } from '../content/skills.ts';

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** True while any content still has placeholder text: the page then says it's a draft. */
export function resumeIsDraft(): boolean {
  return JSON.stringify([ABOUT, CONTACT, ROLES, EDUCATION, PROJECTS, SKILL_CATEGORIES]).includes('TODO');
}

export function renderResume(): string {
  const contact = [
    `<li><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></li>`,
    ...contactLinks().map((l) => `<li><a href="${esc(l.url)}">${esc(l.text)}</a></li>`),
    `<li>${esc(CONTACT.location)}</li>`,
  ].join('');

  const roles = ROLES.map(
    (r) => `
      <article class="entry">
        <header>
          <h3>${esc(r.title)} <span class="at">· ${esc(r.organisation)}</span></h3>
          <p class="when">${esc(r.period)}${r.location ? ` · ${esc(r.location)}` : ''}</p>
        </header>
        <p>${esc(r.summary)}</p>
        <ul>${r.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </article>`,
  ).join('');

  const education = EDUCATION.map(
    (e) => `
      <article class="entry">
        <header>
          <h3>${esc(e.qualification)} <span class="at">· ${esc(e.school)}</span></h3>
          <p class="when">${esc(e.period)}</p>
        </header>
        ${e.note ? `<p>${esc(e.note)}</p>` : ''}
      </article>`,
  ).join('');

  const projects = PROJECTS.map(
    (p) => `
      <article class="entry">
        <header>
          <h3>${esc(p.title)} <span class="at">· ${esc(p.kind)}</span></h3>
          <p class="when">${esc(p.status)}</p>
        </header>
        <p>${esc(p.tagline)}</p>
        <p class="stack">${p.stack.map(esc).join(' · ')}</p>
      </article>`,
  ).join('');

  const skills = SKILL_CATEGORIES.map(
    (c) => `<div class="skill-group"><h3>${esc(c.title)}</h3><p>${c.skills.map((s) => esc(s.name)).join(' · ')}</p></div>`,
  ).join('');

  const draft = resumeIsDraft()
    ? '<p class="draft" role="note">Draft: some details below are still placeholders (marked TODO).</p>'
    : '';

  return `
    ${draft}
    <header class="top">
      <div>
        <h1>${esc(ABOUT.name)}</h1>
        <p class="tagline">${esc(ABOUT.tagline)}</p>
        <p class="availability">${esc(CONTACT.availability)}</p>
      </div>
      <ul class="contact" aria-label="Contact">${contact}</ul>
    </header>
    <section aria-labelledby="about-h"><h2 id="about-h">About</h2>${ABOUT.bio.map((b) => `<p>${esc(b)}</p>`).join('')}</section>
    <section aria-labelledby="exp-h"><h2 id="exp-h">Experience</h2>${roles}</section>
    <section aria-labelledby="edu-h"><h2 id="edu-h">Education</h2>${education}</section>
    <section aria-labelledby="proj-h"><h2 id="proj-h">Projects</h2>${projects}</section>
    <section aria-labelledby="skills-h"><h2 id="skills-h">Skills</h2><div class="skills">${skills}</div></section>`;
}
