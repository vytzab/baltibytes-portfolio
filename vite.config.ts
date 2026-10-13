import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // The art preview ships with every build so branch previews on Cloudflare show it too.
        artPreview: resolve(import.meta.dirname, 'art-preview.html'),
      },
    },
    // Never inline images as data: URIs. Every asset stays a hashed file that the manifest
    // loader can find and the browser can cache.
    assetsInlineLimit: 0,
    // Phaser alone is ~1.3 MB minified (~350 kB gzipped); that's expected, not a regression.
    chunkSizeWarningLimit: 1600,
  },
});
