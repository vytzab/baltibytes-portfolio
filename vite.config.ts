import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderPortfolio } from './src/portfolio/render.ts';
import { esc, renderResume } from './src/resume/render.ts';
import { ABOUT } from './src/content/about.ts';
import { CONTACT } from './src/content/contact.ts';
import { SHOW_RESUME } from './src/content/site.ts';

const SITE = 'https://baltibytes.com';

/**
 * Each public page's title, description and canonical path. Cloudflare Pages serves `x.html` at
 * `/x` (and 308-redirects the .html form there), so canonical URLs and the sitemap use `/x`.
 */
const PAGES: Record<string, { title: string; description: string; path: string; index?: boolean }> = {
  'index.html': {
    title: `Baltibytes · ${ABOUT.name}, ${ABOUT.tagline.toLowerCase()}`,
    description: `The software engineering portfolio of ${ABOUT.name} as a small, cozy pixel-art RPG: walk the village, open the project vaults, read the skills and the guild records.`,
    path: '/',
  },
  'portfolio.html': {
    title: `${ABOUT.name} · ${ABOUT.tagline} · Baltibytes`,
    description: `Projects, skills, experience and contact of ${ABOUT.name}, ${ABOUT.tagline.toLowerCase()} in ${CONTACT.location.split(',')[0]}: the plain version of the baltibytes.com pixel-art portfolio.`,
    path: '/portfolio',
  },
  'resume.html': {
    title: `Résumé · ${ABOUT.name} · Baltibytes`,
    description: `Résumé of ${ABOUT.name}, ${ABOUT.tagline.toLowerCase()} in ${CONTACT.location.split(',')[0]}: experience, projects, skills and education.`,
    path: '/resume',
  },
  '404.html': { title: 'Lost in the woods · Baltibytes', description: 'There is no page at this address.', path: '/404', index: false },
};

/** Title, description, icons, canonical URL and link-preview tags (public/og-image.png, drawn by tools/art). */
function headFor(file: string): string {
  const page = PAGES[file];
  if (!page) return '';
  const url = `${SITE}${page.path}`;
  const meta = (attr: string, key: string, value: string) => `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return [
    `<title>${esc(page.title)}</title>`,
    meta('name', 'description', page.description),
    page.index === false ? meta('name', 'robots', 'noindex') : `<link rel="canonical" href="${url}" />`,
    '<link rel="icon" href="/favicon.ico" sizes="32x32" />',
    '<link rel="icon" href="/favicon.png" type="image/png" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Baltibytes'),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', `${SITE}/og-image.png`),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', 'A pixel-art village square: a notice board between two lamps, a workshop, a pond, and two characters talking.'),
    meta('name', 'twitter:card', 'summary_large_image'),
  ].join('\n    ');
}

/**
 * Fills pages from src/content at build (and dev) time, so they need no JavaScript: every page's
 * head tags, the plain version (portfolio.html, D3), the résumé (resume.html), the 404 page, the
 * home page's skip link and no-JS message (they point to the plain version, and the résumé while
 * it is published), and sitemap.xml.
 */
function contentPages(): Plugin {
  const mail = `<a href="mailto:${CONTACT.email}">${CONTACT.email}</a>`;
  const skipLink = `<a class="skip-link" href="/portfolio.html">Skip the game: read it as a plain page</a>`;
  const noscriptAlternative = SHOW_RESUME
    ? `<a href="/portfolio.html">Read it as a plain page</a> or <a href="${CONTACT.resume.page}">see the résumé</a>, or write to ${mail}.`
    : `<a href="/portfolio.html">Read it as a plain page</a>, or write to ${mail}.`;
  const sitemapPages = ['index.html', 'portfolio.html', ...(SHOW_RESUME ? ['resume.html'] : [])];
  return {
    name: 'baltibytes-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = ctx.path.replace(/^\//, '') || 'index.html';
        html = html.replace('<!--head-->', headFor(file));
        if (file === 'resume.html') return html.replace('<!--resume-->', renderResume());
        if (file === 'portfolio.html') return html.replace('<!--portfolio-->', renderPortfolio());
        if (file === '404.html') return html.replace('<!--404-resume-->', SHOW_RESUME ? `<li><a href="${CONTACT.resume.page}">The résumé</a></li>` : '');
        return html.replace('<!--skip-link-->', skipLink).replace('<!--noscript-alternative-->', noscriptAlternative);
      },
    },
    generateBundle() {
      const urls = sitemapPages.map((f) => `  <url><loc>${SITE}${PAGES[f]!.path}</loc></url>`).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [contentPages()],
  build: {
    rollupOptions: {
      input: {
        // The site: the game, its plain version (D3), the 404 page (Cloudflare Pages serves it
        // for unknown paths), and the résumé when it's switched on (SHOW_RESUME in
        // src/content/site.ts). The art preview (art-preview.html) is a development tool:
        // `npm run dev` serves it (and the résumé), but neither is deployed unless listed here.
        main: resolve(import.meta.dirname, 'index.html'),
        portfolio: resolve(import.meta.dirname, 'portfolio.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
        ...(SHOW_RESUME ? { resume: resolve(import.meta.dirname, 'resume.html') } : {}),
      },
    },
    // Never inline images as data: URIs. Every asset stays a hashed file that the manifest
    // loader can find and the browser can cache.
    assetsInlineLimit: 0,
    // Phaser alone is ~1.3 MB minified (~350 kB gzipped); that's expected, not a regression.
    chunkSizeWarningLimit: 1600,
  },
});
