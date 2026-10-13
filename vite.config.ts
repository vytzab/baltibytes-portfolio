import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderResume } from './src/resume/render.ts';

/** Fills resume.html from src/content at build (and dev) time, so the page needs no JavaScript. */
function resumePage(): Plugin {
  return {
    name: 'baltibytes-resume',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return ctx.path.endsWith('resume.html') ? html.replace('<!--resume-->', renderResume()) : html;
      },
    },
  };
}

export default defineConfig({
  plugins: [resumePage()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // The art preview ships with every build so branch previews on Cloudflare show it too.
        artPreview: resolve(import.meta.dirname, 'art-preview.html'),
        resume: resolve(import.meta.dirname, 'resume.html'),
      },
    },
    // Never inline images as data: URIs. Every asset stays a hashed file that the manifest
    // loader can find and the browser can cache.
    assetsInlineLimit: 0,
    // Phaser alone is ~1.3 MB minified (~350 kB gzipped); that's expected, not a regression.
    chunkSizeWarningLimit: 1600,
  },
});
