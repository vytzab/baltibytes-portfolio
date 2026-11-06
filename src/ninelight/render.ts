// Ninelight's pages (/ninelight/), filled at build time like the plain portfolio page, so they need
// no JavaScript. They wear the app's brand, not the portfolio's (docs/DESIGN_SYSTEM.md → Ninelight
// pages).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ABOUT } from '../content/about.ts';
import { DISCLAIMER, FEATURES, NINELIGHT, SCREENSHOTS, SKILLS } from '../content/ninelight.ts';
import { esc } from '../resume/render.ts';

/** Bold and links, the only inline Markdown the policies use. Anything else fails the build. */
function inline(text: string): string {
  const html = esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  if (/[*`]/.test(html)) throw new Error(`Unsupported Markdown (only **bold** and [links](url)): ${text}`);
  return html;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * The small Markdown subset of the privacy policy and the terms: `#`–`###` headings, paragraphs,
 * `- ` lists, **bold** and [links](url). Lines inside a paragraph become line breaks (the policies'
 * App/Developer/Contact block). Anything else (numbered lists, tables, quotes, code, nesting, HTML)
 * throws, so a pasted-in policy can't silently render wrong.
 */
export function markdownToHtml(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, '\n').trim().split(/\n[ \t]*\n/);
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trimEnd());
      const heading = /^(#{1,3}) (.+)$/.exec(lines[0]!);
      if (heading && lines.length === 1) {
        const level = heading[1]!.length;
        const id = level === 1 ? '' : ` id="${slug(heading[2]!)}"`;
        return `<h${level}${id}>${inline(heading[2]!)}</h${level}>`;
      }
      if (lines.every((l) => l.startsWith('- '))) {
        return `<ul>\n${lines.map((l) => `  <li>${inline(l.slice(2))}</li>`).join('\n')}\n</ul>`;
      }
      for (const l of lines) {
        if (/^(\s|#|>|\d+[.)] |\||```|- |\* |\+ |<)/.test(l)) throw new Error(`Unsupported Markdown block starting at: ${l}`);
      }
      return `<p>${lines.map(inline).join('<br />\n')}</p>`;
    })
    .join('\n');
}

const IMG = '/src/ninelight/img';

/** The bar at the top: the lockup, swapped for the dark one in dark mode (emerald name → lime). */
function header(): string {
  return `<header class="nl-bar">
      <a class="nl-brand" href="/ninelight/">
        <picture>
          <source srcset="${IMG}/lockup-dark.png" media="(prefers-color-scheme: dark)" />
          <img src="${IMG}/lockup-light.png" alt="Ninelight" width="168" height="56" />
        </picture>
      </a>
    </header>`;
}

function footer(): string {
  return `<footer class="nl-footer">
      <nav aria-label="Ninelight">
        <ul>
          <li><a href="/ninelight/">About Ninelight</a></li>
          <li><a href="/ninelight/changelog.html">What's new</a></li>
          <li><a href="/ninelight/privacy.html">Privacy policy</a></li>
          <li><a href="/ninelight/terms.html">Terms of service</a></li>
          <li><a href="mailto:${esc(NINELIGHT.email)}">${esc(NINELIGHT.email)}</a></li>
        </ul>
      </nav>
      <p>Made by ${esc(ABOUT.name)} · <a href="/">baltibytes.com</a></p>
    </footer>`;
}

/** A skill icon from the app's brand (white-on-tint in the app): its colours become the tile's text colour. */
function skillIcon(root: string, id: string): string {
  return readFileSync(join(root, 'src/ninelight/skills', `${id}.svg`), 'utf8')
    .trim()
    .replace(/#[0-9a-fA-F]{6}\b/g, 'currentColor')
    .replace(/ width="\d+" height="\d+"/, '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
}

function page(main: string): string {
  return `${header()}
    <main class="nl-main">
      ${main}
    </main>
    ${footer()}`;
}

/** /ninelight/: what the app is, the Play link, screenshots, the skills and what's free. */
export function renderNinelightHome(root: string): string {
  const shots = SCREENSHOTS.map(
    (s) => `<li><img src="${IMG}/${s.file}.webp" alt="${esc(s.caption)}" width="540" height="1080" loading="lazy" /></li>`,
  ).join('\n        ');
  const skills = SKILLS.map(
    (s) => `<li class="nl-skill" data-skill="${s.id}">
          <span class="nl-skill-icon">${skillIcon(root, s.id)}</span>
          <span><span class="nl-skill-name">${esc(s.name)}</span><span class="nl-skill-games">${s.games.map(esc).join(' · ')}</span></span>
        </li>`,
  ).join('\n        ');
  const features = FEATURES.map((f) => {
    const paragraphs = f.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
    const bullets = f.bullets ? `<ul>${f.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
    return `<section class="nl-card"><h2>${esc(f.title)}</h2>${paragraphs}${bullets}</section>`;
  }).join('\n      ');
  return page(`<section class="nl-hero">
        <h1>${esc(NINELIGHT.headline)}</h1>
        <p class="nl-lede">${esc(NINELIGHT.lede)}</p>
        <p><a class="nl-button" href="${esc(NINELIGHT.playUrl)}">Get it on Google Play</a></p>
        <p class="nl-note">${esc(NINELIGHT.platforms)}</p>
      </section>
      <ul class="nl-shots" aria-label="Screenshots">
        ${shots}
      </ul>
      <section class="nl-card">
        <h2>Games across nine skills</h2>
        <ul class="nl-skills">
        ${skills}
        </ul>
      </section>
      ${features}
      <p class="nl-note">The daily leaderboard is also on the web: <a href="${esc(NINELIGHT.dailyBoardUrl)}">${esc(NINELIGHT.dailyBoardUrl.replace('https://', ''))}</a>.</p>
      <p class="nl-note">${esc(DISCLAIMER)}</p>`);
}

/** /ninelight/privacy, /ninelight/terms and /ninelight/changelog: the Markdown beside the content file, on one card. */
export function renderNinelightDoc(root: string, doc: 'privacy' | 'terms' | 'changelog'): string {
  const markdown = readFileSync(join(root, 'src/content/ninelight', `${doc}.md`), 'utf8');
  return page(`<article class="nl-card nl-legal">
        ${markdownToHtml(markdown)}
      </article>`);
}
