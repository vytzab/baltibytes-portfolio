# baltibytes-portfolio

The software engineering portfolio behind [baltibytes.com](https://baltibytes.com), being built as a small, cozy, top-down pixel-art RPG: walk between five places (a village, a dungeon, a skill tower, a guild hall and a portal) and talk to the people there to learn about my work.

**Status:** live at baltibytes.com and growing. The village, the Dungeon (projects), the Skill Tower, the Guild Hall and the Exit Portal (contact) are in; art and text are drafts.

## Stack

- [Vite](https://vite.dev) + TypeScript, static output only (no backend)
- [Phaser 4](https://phaser.io) for the game
- Hosted on Cloudflare Pages

## Running it

Needs Node 22.18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173 (the game; dev-only art tools at /art-preview.html)
npm run check      # type-check, asset validation, tests
npm run build      # production build into dist/
npm run preview    # serve the build at http://localhost:4173
```

## Résumé

A plain page at `/resume.html`, built from the same content as the game (`src/content`); it works without JavaScript and prints to PDF from the browser. Not published yet: it is switched off in `src/content/site.ts` (`SHOW_RESUME`) while its content is a draft.

## Art

All artwork is original. How it's made, checked and added: [art/README.md](art/README.md). The visual rules: [art/ART_BIBLE.md](art/ART_BIBLE.md). Every asset file is listed with its source and licence in [`src/assets/manifest.json`](src/assets/manifest.json).

## Credits

- [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) by The Pixelify Sans Project Authors, SIL Open Font License 1.1
- [Phaser](https://phaser.io), MIT

## Licence

Not chosen yet; until then, all rights reserved.
