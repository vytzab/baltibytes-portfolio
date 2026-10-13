import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderResume } from './src/resume/render.ts';
import { CONTACT } from './src/content/contact.ts';
import { SHOW_RESUME } from './src/content/site.ts';

/**
 * Fills pages from src/content at build (and dev) time, so they need no JavaScript: the résumé
 * (resume.html), and the contact address in the home page's skip link and no-JS message.
 */
function contentPages(): Plugin {
  return {
    name: 'baltibytes-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.path.endsWith('resume.html')) return html.replace('<!--resume-->', renderResume());
        return html.replaceAll('%CONTACT_EMAIL%', CONTACT.email);
      },
    },
  };
}

export default defineConfig({
  plugins: [contentPages()],
  build: {
    rollupOptions: {
      input: {
        // The site: the game, and the résumé when it's switched on (SHOW_RESUME in
        // src/content/site.ts). The art preview (art-preview.html) is a development tool:
        // `npm run dev` serves it (and the résumé), but neither is deployed unless listed here.
        main: resolve(import.meta.dirname, 'index.html'),
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
