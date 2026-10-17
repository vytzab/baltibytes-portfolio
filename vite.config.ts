import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderPortfolio } from './src/portfolio/render.ts';
import { renderResume } from './src/resume/render.ts';
import { CONTACT } from './src/content/contact.ts';
import { SHOW_RESUME } from './src/content/site.ts';

/**
 * Fills pages from src/content at build (and dev) time, so they need no JavaScript: the plain
 * version (portfolio.html, D3), the résumé (resume.html), and the home page's skip link and no-JS
 * message, which point to the plain version (and the résumé while it is published).
 */
function contentPages(): Plugin {
  const mail = `<a href="mailto:${CONTACT.email}">${CONTACT.email}</a>`;
  const skipLink = `<a class="skip-link" href="/portfolio.html">Skip the game: read it as a plain page</a>`;
  const noscriptAlternative = SHOW_RESUME
    ? `<a href="/portfolio.html">Read it as a plain page</a> or <a href="${CONTACT.resume.page}">see the résumé</a>, or write to ${mail}.`
    : `<a href="/portfolio.html">Read it as a plain page</a>, or write to ${mail}.`;
  return {
    name: 'baltibytes-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.path.endsWith('resume.html')) return html.replace('<!--resume-->', renderResume());
        if (ctx.path.endsWith('portfolio.html')) return html.replace('<!--portfolio-->', renderPortfolio());
        return html.replace('<!--skip-link-->', skipLink).replace('<!--noscript-alternative-->', noscriptAlternative);
      },
    },
  };
}

export default defineConfig({
  plugins: [contentPages()],
  build: {
    rollupOptions: {
      input: {
        // The site: the game, its plain version (D3), and the résumé when it's switched on
        // (SHOW_RESUME in src/content/site.ts). The art preview (art-preview.html) is a development tool:
        // `npm run dev` serves it (and the résumé), but neither is deployed unless listed here.
        main: resolve(import.meta.dirname, 'index.html'),
        portfolio: resolve(import.meta.dirname, 'portfolio.html'),
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
