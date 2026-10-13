# Art pipeline

How art gets into the game: where files live, how they're described, checked and previewed, and how to add or replace them. The visual rules are in [ART_BIBLE.md](ART_BIBLE.md).

**Tools needed:** Node 22.18 or newer and npm. That's all for the pipeline itself. For drawing, any pixel-art editor that exports PNG works; free ones: [Pixelorama](https://pixelorama.org) (MIT), [LibreSprite](https://libresprite.github.io) (GPL), [GIMP](https://www.gimp.org). Maps: [Tiled](https://www.mapeditor.org) (free). Nothing in the pipeline is paid or online.

## Folders

| Folder | What's in it | Committed? |
|---|---|---|
| `src/assets/` | **Shipped art**: the files the game loads. Imported through Vite, so each gets a content-hashed URL in the build. | Yes |
| `src/assets/manifest.json` | One entry per asset file: id, path, size, frames, animations, transparency, palette, status, provenance. | Yes |
| `src/assets/characters/` | Player and NPC sprite sheets (`char.*`) | Yes |
| `src/assets/tiles/` | Tilesets (`tiles.*`) | Yes |
| `src/assets/maps/` | Tiled JSON maps (`map.*`) | Yes |
| `src/assets/objects/` | Interactive objects and props: signs, chests, doors (`obj.*`) | Yes |
| `src/assets/portraits/` | Dialogue portraits (`portrait.*`); none yet | Yes |
| `src/assets/ui/` | Frames, prompts, icons (`ui.*`) | Yes |
| `src/assets/effects/` | Shadows, sparkles, glows (`fx.*`) | Yes |
| `art/palettes/` | The palette (`.json` is the source of truth; `.gpl` and `.png` are generated for editors) | Yes |
| `art/source/` | Editor files for production art (`.aseprite`, `.pxo`, `.kra`), mirroring `src/assets/` folders. Create it when the first one exists. | Yes |
| `art/inbox/` | Scratch space for raw imports: tool outputs, sketches, downloads waiting for review | **No** (git-ignored) |
| `tools/art/` | The generator, the validator and their tests | Yes |
| `tools/art/placeholders/` | Code that draws the placeholder terrain, props, UI and map | Yes |
| `tools/art/village/` | The Starting Village: `tiles.ts` (village tileset: edges, cobbles, plants), `props.ts` (workshop, trees, arch, notice board, lamp, crates), `map.ts` (the village layout as text, written as Tiled JSON with edges chosen automatically) | Yes |
| `tools/art/dungeon/` | The Dungeon: `tiles.ts` (walls with faces and rimmed tops, flagstones, rug, cobwebs, a banner per project colour), `props.ts` (torch, quest chest, exit stairs, and the village's cellar entrance), `map.ts` (walls as `#`/`.` text; vaults follow `src/content/projects.ts`) | Yes |
| `tools/art/characters/` | The characters: `player.ts` and `guide.ts` hold every pixel as hand-drawn text grids (head, body, arm, legs per direction); `compose.ts` stacks them into 24 × 32 frames and sheets | Yes |
| `src/game/` | Engine code that uses assets by id: loader, `world.ts` (builds a map: layers, collision, entities, props, depth sorting), characters, dialogue, interaction, scaling, `rules.ts` (feet box and interaction range, shared with the validator) | Yes |
| `src/content/` | Text the game shows: `about.ts` (the village's About me) and `projects.ts` (the Dungeon's case studies). Both are drafts for the owner to check; the repo is public | Yes |
| `src/preview/` | The art preview page (`art-preview.html`) | Yes |

Folders under `src/assets/` are created when their first asset arrives.

## Commands

```bash
npm install                 # once, and whenever package-lock.json changes
npm run dev                 # dev server with hot reload; open http://localhost:5173/art-preview.html
npm run dev -- --host       # same, reachable from a phone on the same Wi-Fi (use the printed network URL)
npm run art:validate        # check the manifest against the files (also part of build and check)
npm run art:validate -- --no-placeholders   # also fail on placeholder or draft art (a future release gate)
npm run art:generate        # redraw all code-drawn art (characters, placeholders) + palette files
npm test                    # validator tests (deliberately broken fixtures)
npm run check               # type-check + validate + tests: run before every commit
npm run build               # validate + type-check + production build into dist/ (what Cloudflare runs)
npm run preview             # serve dist/ at http://localhost:4173 (art preview: /art-preview.html)
```

## The art preview

`art-preview.html` is a small map with the player, an NPC and a sign, built from the manifest. Use it to judge art in context:

- **Walk:** WASD or arrows. **Talk / read:** E, Space or Enter. **Close:** Esc.
- **Zoom:** `−` / `+` (or the keys `-` `+`), **Fit** (`0`) returns to the automatic zoom. Check new art at ×3 and at the default zoom.
- **Grid (G):** the 16 px tile grid. **Collision (C):** colliding tiles (rose) and physics boxes.
- **Map:** the picker switches between the Starting Village (default), the Dungeon and the small test area; `?map=map.dungeon` in the URL opens one directly. Walking through a portal (the village cellar, the dungeon stairs) changes map too, and the picker follows.
- **Case studies:** in the Dungeon, press E at a chest. Arrow keys switch sections, Esc closes. Opened chests stay open (stored in this browser only).
- **Assets:** every manifest entry with its image enlarged on a checkerboard (transparent areas show as checks) and its frame grid drawn over it, plus status, size, animations and provenance. Every animation also plays on grass at ×1 (one game pixel per CSS pixel) next to ×4, so you can judge it at native and enlarged size.
- The red badge counts placeholder and draft assets.
- It honours "reduce motion": the prompt stops bobbing.

## Manifest fields

```jsonc
{
  "id": "char.player",                    // permanent; <prefix>.<kebab-name>; prefix matches category
  "path": "characters/player.png",        // relative to src/assets/; folder matches category
  "category": "character",                // character | tileset | map | object | portrait | ui | effect
  "type": "spritesheet",                  // image | spritesheet | tilemap
  "status": "draft",                      // placeholder (stand-in) | draft (real art awaiting approval) | production
  "usage": "Player character…",           // where and how the game uses it
  "width": 64, "height": 192,             // image size in px (image, spritesheet)
  "grid": { "width": 16, "height": 24 },  // frame size (sheets) or tile size (tilesets, maps)
  "animations": [                         // spritesheets only; one row each (ART_BIBLE §7)
    { "name": "walk-down", "row": 4, "frames": 4, "fps": 8, "loop": true }
  ],
  "transparency": "transparent",          // opaque | transparent (every frame) | mixed
  "solid": [{ "x": 12, "y": 50, "width": 8, "height": 6 }], // props: collision boxes in image px (per frame)
  "softAlpha": false,                     // optional; true allows semi-transparent pixels (rare)
  "palette": "baltibytes-v0",             // optional; enforces palette colours
  "provenance": {
    "origin": "code-generated",           // code-generated | hand-drawn | ai-assisted | third-party
    "author": "…",
    "created": "2026-10-13",
    "license": "owner",                   // owner | CC0-1.0 | CC-BY-4.0 | OFL-1.1 | MIT
    "tool": "tools/art/generate-placeholders.ts", // required for code-generated and ai-assisted
    "source": "…",                        // https URL for third-party; source file otherwise
    "attribution": "…",                   // required for CC-BY-4.0
    "notes": "…"
  },
  "notes": "…"
}
```

## What the validator checks

- The manifest parses; ids are unique, well formed and use the category's prefix.
- Paths are plain relative paths inside `src/assets/` (no `..`, no absolute paths, no symlinks pointing out), in the category's folder, kebab-case, `.png` for images, `.json` for maps.
- Every listed file exists, and **every file in `src/assets/` is listed**.
- PNGs decode; their size matches the manifest; sheets are a whole number of frames; animations fit the sheet and none of their frames is empty.
- Transparency: `opaque` assets have no transparent pixels; every frame of a `transparent` asset has some (this catches art exported on a white background); no semi-transparent pixels unless `softAlpha`.
- Palette: every visible pixel is a palette colour, when `palette` is set.
- Provenance: origin, author, date and an accepted licence; tool for generated work; https source for third-party; attribution for CC-BY.
- Solid boxes: whole numbers, inside the image (or frame).
- Maps: orthogonal, finite, CSV layers, embedded tilesets named after a tileset id with matching size and image path, tile numbers within range, and `sprite` properties that name real assets.
- Map objects: entity types are `spawn`, `arrive`, `npc`, `sign`, `prop` (points inside the map; all but spawn and arrive need a `sprite`) and `portal` (rectangles with `to` and `arrive`); `collision` objects are rectangles inside the map. A `caseStudy` property must be a project id from `src/content/projects.ts`.
- Portals: `to` must be a map in the manifest and `arrive` an `arrive` object in that map.
- **Walkability:** the spawn (or, in a map you only enter through a portal, the first arrival) must be free; every arrival must be free and connected to it; every NPC, sign and prop with `dialogue` or `caseStudy` must be reachable, and every portal must be walkable into. The validator walks the player's 10 × 6 feet box from the spawn in 2 px steps against colliding tiles, collision rectangles, prop and sign `solid` boxes and NPC feet, the same rules the game uses (`src/game/world.ts`), so a misplaced tree can't trap the player or wall off the guide.

It **cannot** judge whether art is good, readable, on-model or consistent in style. That's what the preview and the checklist in ART_BIBLE §10 are for. Errors exit with code 1, so `npm run build` (and any future CI) stops.

## Workflows

### Add a new asset

1. Draw it following the art bible (size, palette, outline, light). Save the editor file in `art/source/<category>/`.
2. Export PNG to `src/assets/<category>/<name>.png` (sheets: one animation per row, no spacing).
3. Add its entry to `src/assets/manifest.json` (copy a similar entry; set `status`, sizes, `grid`, `animations`, `transparency`, `palette`, `provenance`).
4. `npm run art:validate` and fix what it reports.
5. Use it in code by **id** (`preloadAssets`, then the id as texture key; animations as `<id>:<name>`), or place it in a Tiled map with a `sprite` property.
6. Review in the art preview (`npm run dev` → `/art-preview.html`), on grass and path, at ×3 and default zoom, and in the Assets panel.
7. `npm run check` and `npm run build`, then commit (the PNG, the source file and the manifest change together).

### Change a character

Edit the grids in `tools/art/characters/<name>.ts` (one character per pixel; the `legend` at the top maps letters to palette colours), then `npm run art:generate` and look at the sheet in the Assets panel and the character in the scene. `compose.ts` refuses parts that change size between poses, so frames can't jump. To hand a character over to a pixel editor instead: export the sheet PNG, keep the 24 × 32 grid and row order, remove it from `generate-placeholders.ts`, and change its provenance to `hand-drawn`.

### Approve art

When the owner approves a draft (or placeholder), set its `status` to `production`. `npm run art:validate -- --no-placeholders` passes only when everything is production.

### Replace an asset (e.g. placeholder → production)

1. Keep the **id and path**. Overwrite the PNG with the new one.
2. If the size, frame size or animation rows changed, update `width`, `height`, `grid`, `animations` in the manifest. Keep animation **names** the same so game code doesn't change.
3. Update `status` (`draft` until the owner approves it, then `production`) and `provenance` (origin, author, date, licence, tool or source).
4. If the asset was code-generated, remove it from `tools/art/generate-placeholders.ts` so `npm run art:generate` doesn't overwrite it.
5. Validate, review in the preview, check, build, commit.

No game code changes are needed unless the asset gains new animations or a different role.

### Update metadata only

Edit the entry in `manifest.json`, then `npm run art:validate`. The id never changes; if a rename is unavoidable, search the code (`grep -r "old.id" src`) and maps for every use.

### Change or add a map

Both current maps are generated: edit the text layout in `tools/art/village/map.ts` (or `tools/art/placeholders/map.ts` for the test area) and run `npm run art:generate`. Path and pond edges are picked automatically; the generator stops with a message if a path or pond is only 1 tile wide somewhere.

To hand a map over to Tiled instead: remove its `writeMap` line from `generate-placeholders.ts`, then edit `src/assets/maps/<name>.json` in Tiled. Keep tilesets embedded and named after their ids, layers in CSV, `collides` as a tile property, entities as points in `entities`, blockers as rectangles in `collision`. Place edge tiles by hand (or set up a Tiled terrain set). Save, `npm run art:validate` (it checks walkability too), check in the preview.

### Add a prop

Draw it in `tools/art/village/props.ts` (or a pixel editor), add its manifest entry with `solid` boxes for its footprint, and place it in a map as a `prop` point at its feet with a `sprite` property (add `dialogue` to make it talk). Animated props are sprite sheets with an animation; the game plays the first one (frame 0 when motion is reduced).

### Before committing

```bash
npm run check   # types + asset validation + tests
npm run build   # what Cloudflare Pages will run
git status      # every new PNG has its manifest entry; no files in art/inbox are staged
```

## Future artwork

### Briefing an artist or an image-generation tool

Give them ART_BIBLE.md, the palette (`art/palettes/baltibytes-v0.png` and `.gpl`), a screenshot of the art preview and one or two existing sheets for scale. Then a brief like:

> **Asset:** `obj.chest` — a small wooden treasure chest for the Dungeon (projects as quests), closed and open.
> **Size:** 16 × 16 frames, 2 frames in one row (`closed`, `open`), PNG with transparent background.
> **View:** top-down three-quarter, light from the top-left, 1 px ink outline, no anti-aliasing, only the 30 palette colours (wood and gold ramps).
> **Mood:** cozy, worn, hand-made; reads clearly at 16 px. Original design, not based on any game.

For image-generation tools, add: "pixel art, 16×16 sprite, limited palette, hard edges, no anti-aliasing, no background". Expect to redraw. These tools rarely produce a real pixel grid or exact palette.

### Importing and cleaning up generated or scanned art (manual)

1. Save the raw output in `art/inbox/` (ignored by git). Note the tool, model and prompt.
2. Open it in a pixel editor. Find the true pixel size (generated "pixel art" is usually drawn with blocks of several screen pixels, often uneven).
3. Scale it down with **nearest-neighbour** to the target size (24 × 32 characters, 16 × 16 tiles …), or, better, redraw it on a new canvas at the target size using the output as a reference layer.
4. Convert to the palette: in Pixelorama/LibreSprite/GIMP load `baltibytes-v0.gpl` and switch to indexed colour with **no dithering**, then fix stray pixels by hand.
5. Remove the background (fully transparent, alpha 0) and any semi-transparent edge pixels; add the 1 px ink outline; check light direction.
6. Save the cleaned editor file in `art/source/`, export the PNG to `src/assets/`, add the manifest entry with `"origin": "ai-assisted"` (or `hand-drawn`), the tool, and the prompt in `notes`.

### Arranging frames into a sheet

Lay frames out in the editor as one animation per row (ART_BIBLE §7) and export one PNG: Pixelorama: *Export → Spritesheet*, by rows; LibreSprite/Aseprite: *Export Sprite Sheet*, layout "by rows", no padding. If the frames are separate files, place them on a canvas of `frames × frame width` by `rows × frame height` in any editor. Then set `grid` and `animations` in the manifest.

### Verifying

- **Transparency, size, frame grid, palette:** `npm run art:validate` reports the asset, the problem and the first pixel coordinates.
- **Scaling and readability:** the art preview, at several zoom levels, in the Assets panel (checkerboard background shows holes and stray pixels).
- **On a phone:** `npm run dev -- --host` and open the network URL.

### Recording provenance

Fill `provenance` for every file: who made it, when, how (`origin`, `tool`), from what (`source`) and under which licence. For third-party art, also add a line to the public README's credits section. The validator refuses unknown licences; add a new one to `LICENSES` in `src/game/assets/manifest.ts` only after checking it allows redistribution in a public repo.
