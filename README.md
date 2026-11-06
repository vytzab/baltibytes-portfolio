# baltibytes-portfolio

The software engineering portfolio behind [baltibytes.com](https://baltibytes.com), being built as a small, cozy, top-down pixel-art RPG: walk between five places (a village, a dungeon, a skill tower, a guild hall and a portal) and talk to the people there to learn about my work.

**Status:** live at baltibytes.com and growing. All five places are open: the village (about me), the Dungeon (projects), the Skill Tower (skills), the Guild Hall (experience) and the Exit Portal (contact). The art is still a draft.

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

## Plain version and résumé

Everything in the game is also on one plain page at `/portfolio.html`: the same content (`src/content`), rendered at build time, readable with a screen reader or without JavaScript. The home page's skip link goes there.


The résumé is a page at `/resume.html`, built from the same content as the game (`src/content`); it works without JavaScript and prints to PDF from the browser. It can be switched off in `src/content/site.ts` (`SHOW_RESUME`).

## Ninelight

[`/ninelight/`](https://baltibytes.com/ninelight/) is the home page of Ninelight, my Android brain-games app, with [what's new](https://baltibytes.com/ninelight/changelog) in each version, its [privacy policy](https://baltibytes.com/ninelight/privacy) and [terms of service](https://baltibytes.com/ninelight/terms). These pages use the app's own look rather than the portfolio's, and are built from `src/content/ninelight*` with no JavaScript.

## Art

All artwork is original. How it's made, checked and added: [art/README.md](art/README.md). The visual rules: [art/ART_BIBLE.md](art/ART_BIBLE.md). Every asset file is listed with its source and licence in [`src/assets/manifest.json`](src/assets/manifest.json).

## Credits

- [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) by The Pixelify Sans Project Authors, SIL Open Font License 1.1
- The "Get it on Google Play" badge on the Ninelight page is Google's, used under its [badge guidelines](https://play.google.com/intl/en_us/badges/). Google Play and the Google Play logo are trademarks of Google LLC.
- [Roboto](https://fonts.google.com/specimen/Roboto) by The Roboto Project Authors, SIL Open Font License 1.1 (the Ninelight pages)
- [Phaser](https://phaser.io), MIT

## Licence

Not chosen yet; until then, all rights reserved.
