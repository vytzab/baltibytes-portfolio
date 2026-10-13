# Baltibytes art bible

The visual rules for every piece of art in the game. Anyone (the owner, a hired artist, or someone using an image-generation tool and cleaning up its output) should be able to make an asset that fits by following this page. The commands and file workflow are in [README.md](README.md).

Status: **v0, provisional.** The rules were tested with code-drawn placeholder art in the art preview (`art-preview.html`). Rules marked *(tentative)* should be confirmed with the first production art.

## 1. Direction and identity

**Cozy, warm and handcrafted.** A small world you'd like to spend an evening in: soft afternoon light, worn wood, linen, moss, a little sea breeze. It should feel lived-in and kind, never grim, and never busy.

- **Mood words:** warm, calm, tidy, tactile, hand-made, a bit whimsical.
- **Setting flavour:** a small Baltic-coast village. Timber houses, pine and birch, amber, linen, fishing nets, sand paths, cool sea against warm land. Use it as flavour only. No real places, flags or national symbols.
- **What it is not:** no grimdark, no neon, no gradients or glossy highlights, no photo textures, no copied or "inspired-by" characters, logos or tiles from existing games.
- **Original work only.** References are for mood and technique, never for tracing, colour-picking or copying a design.

The five locations share one palette and style; each has its own accent:

| Location | Content | Visual notes |
|---|---|---|
| Starting Village | About me | Warm wood, thatch, gardens, sand paths. The home base and the cosiest place. |
| Dungeon | Projects (quests) | Cool stone (stone ramp) lit by warm torches (gold ramp). Adventurous, not scary. |
| Skill Tower | Technical skills | Stone and heather (purple) accents, books, small floating glints. |
| Guild Hall | Experience | Brick, dark wood, banners, a noticeboard. |
| Exit Portal | Contact | A stone ring with a heather and sea-light glow; the one place a soft glow is allowed (§6). |

## 2. Perspective and camera

- **Top-down three-quarter view** (the classic RPG view): the ground is seen from above, and anything that stands up (characters, walls, house fronts, signs) is seen from the front. Every asset uses this same angle. Don't mix in pure side views or isometric pieces.
- **Light comes from the top-left**, always. Shade on the bottom-right of forms.
- The camera follows the player, snapped to whole pixels. It always shows at least **240 × 144 game pixels (15 × 9 tiles)**; bigger screens see more of the world at the same pixel size rather than a stretched picture.
- Things are drawn at one scale. A tree is not drawn in more detail than the character next to it.

## 3. Sizes

| Asset | Size (px) | Rules |
|---|---|---|
| Tile | **16 × 16** | Ground and decoration tiles. Ground tiles tile seamlessly in every direction. |
| Character / NPC frame | **16 × 24** | Body about 20 px tall, feet on the bottom row, horizontally centred, 4 px of headroom for hats and hair. Origin = bottom centre. |
| Large creature or vehicle | 32 × 32 frames | Only when 16 × 24 truly can't fit it; feet on the bottom row. |
| Objects and props | Multiples of 8, footprint ideally a whole number of tiles | Signs, chests, lamps: usually 16 × 16 or 16 × 32. Buildings: multiples of 16. |
| UI frames | 9-slice with **8 px** corners | `ui.dialogue-box` is 24 × 24 (8 px corners, 8 px stretchable edges). |
| UI icons | 8 × 8 or 16 × 16 | The "!" prompt is 9 × 9 (odd, so the "!" has a centre column). |
| Portraits *(tentative)* | 48 × 48 | For dialogue, if wanted. None exist yet. |

**Why 16 × 24 for characters.** Tested in the preview, 16 × 24 reads clearly at ×4–×6 zoom: the face, facing direction and walk cycle are easy to read. It's also only half a tile taller than a tile, so characters stay in scale with doors and fences. 16 × 32 made figures look tall next to 16 px props, and 16 × 16 left no room for expressive heads. Keep 16 × 24 unless the first production characters prove otherwise; changing it later only means new sheets and manifest entries.

## 4. Pixels and scaling

- **One pixel size everywhere.** A game pixel is always drawn as an exact whole number of screen pixels (the zoom, ×1 to ×8, worked out from the screen's real device pixels). No asset is ever scaled by a fraction, rotated, or drawn at a different pixel size from its neighbours.
- **Nearest-neighbour only:** no smoothing anywhere (Phaser `pixelArt: true`, CSS `image-rendering: pixelated`).
- **Positions are whole pixels** (camera and sprites round to the pixel grid).
- **No anti-aliasing in the art:** every pixel is fully opaque or fully transparent (alpha 0 or 255). Edges are made with pixel placement, not blur.
- **Text is not drawn in pixels.** Dialogue and UI text is HTML over the game (crisp, resizable, read by screen readers), in Pixelify Sans, framed by pixel-art 9-slices.

## 5. Palette

All art uses one palette: **`baltibytes-v0`**, 30 colours, in [`palettes/baltibytes-v0.json`](palettes/baltibytes-v0.json) (also `.gpl` for editors and a `.png` swatch).

- **Only palette colours.** The validator checks every visible pixel of assets that declare `"palette": "baltibytes-v0"`. It can confirm colours are *in* the palette, not that they're used *well*.
- **Ramps** (dark → light) to shade with:
  - wood: `ink` → `plum` → `bark-dark` → `bark` → `wood` → `sand` → `cream` → `paper`
  - foliage: `moss-dark` → `moss` → `grass` → `grass-light` → `leaf-light`
  - water: `sea-deep` → `sea` → `sea-light` → `foam`
  - stone: `stone-dark` → `stone` → `stone-light` → `cream`
  - skin: `bark` → `skin-shade` → `skin` (and `blush` for cheeks); use `skin-shade` as a base too, for a range of skin tones
  - cloth: `denim` → `denim-light`, `brick` → `rose` → `blush`, `heather`, `gold` → `gold-light`
- **3–4 colours per material** is plenty for a 16 px object.
- **No pure black or white.** `ink` (deep plum) is the darkest colour, `paper` the lightest.
- **Reserved meanings:** `brick` marks what wants attention (the "!" prompt, a speaker's name), so keep big brick areas rare. `heather` is for magic and skills (Skill Tower, portal).
- **Changing the palette:** propose it, update the JSON, rerun `npm run art:generate` (for the .gpl/.png), bump the id when it's a breaking change (`baltibytes-v1`) and update assets' `palette` fields.

## 6. Outlines, light, shadow and contrast

- **Outlines:** 1 px `ink` around characters, NPCs, objects, props and UI frames, so they stand out from the ground. **Ground tiles have no outline.** Inside a sprite, separate parts with a darker colour from the part's own ramp, not with `ink`.
- **Light:** from the top-left. The highlight goes on top/left edges, one step lighter on the ramp; shade goes on bottom/right edges, one step darker.
- **Ground shadows:** characters and free-standing objects get the shared `fx.shadow` ellipse under their feet, which the game draws at 25 % opacity. It's the only translucency in the game. Don't paint shadows into sprites.
- **No gradients, glows or dithering** unless a specific asset needs it and the art bible is updated first. The portal glow is the planned exception (`softAlpha` in the manifest).
- **Contrast:** a character must be readable on grass, path, stone and water. Check it in the preview on each. Interactive things get a **shape** cue (the "!" bubble, or later an outline on approach), never colour alone.

## 7. Sprite sheets and animation

- **One animation per row,** frames left to right starting at column 0, every frame the same size, no gaps or padding (margin 0, spacing 0).
- **Character rows**, in this order: `idle-down`, `idle-left`, `idle-right`, `idle-up`, `walk-down`, `walk-left`, `walk-right`, `walk-up`. NPCs that don't walk have only the four idle rows. Store right-facing rows explicitly, even when they're mirrors, so asymmetric details (a bag on one shoulder) stay possible.
- **Animation names** are `state-direction` in kebab-case. Later states (`talk-down`, `wave-down`, `sit-left` …) follow the same pattern. In code the key is `<asset id>:<name>`, e.g. `char.player:walk-left`.
- **Timing:** idle 4 frames at 3 fps (a blink on the last frame); walk 4 frames at 8 fps (contact, passing, contact with the other foot, passing). Pick fps per animation in the manifest.
- Every frame used by an animation must contain something (the validator flags empty frames).
- **Ambient loops** (water, flags, torches) must look fine frozen on their first frame, which is what visitors who ask for reduced motion get.

## 8. Files and names

- **PNG**, 8-bit RGBA, transparent background where the manifest says `transparent`. No JPEG, WebP or SVG for art.
- **Names:** lowercase kebab-case (`npc-guide.png`, `dialogue-box.png`), in the folder for the category (`characters/`, `tiles/`, `maps/`, `objects/`, `portraits/`, `ui/`, `effects/`).
- **Ids:** `<prefix>.<name>`, where prefix is `char`, `tiles`, `map`, `obj`, `portrait`, `ui` or `fx`. An id is permanent once code uses it. Replace the file, keep the id.
- **Maps:** Tiled JSON with CSV layers and **embedded** tilesets; each tileset's name is its manifest id (`tiles.terrain`); collision is a boolean tile property `collides`. Objects that place things are points at the feet position with string properties `sprite` (a manifest id) and `dialogue` (a text id).
- **Editor sources** (`.aseprite`, `.pxo`, `.kra`) live in `art/source/<category>/` with the same name as the PNG.

## 9. Originality and provenance

- Everything is original work made for this site, or third-party art whose licence allows use **and redistribution in a public repository** (CC0, CC-BY 4.0 with credit, OFL for fonts, MIT). "Free for personal use" or "no redistribution" packs can't be used.
- Every file in `src/assets/` has a manifest entry with its origin, author, date, licence and tool. The build fails without one.
- **Image-generation tools:** only if the owner approves for that asset; record the tool and the prompt in the manifest. Outputs need redrawing to the pixel grid and palette (see README §Future artwork). Their copyright status is unsettled, so prefer them for ideas and rough shapes, not finished art.
- Never feed other artists' or games' art into a tool as a style reference to copy.

## 10. Consistency checklist (per asset)

- [ ] Right size (§3), feet on the bottom row for anything that stands
- [ ] Top-down three-quarter view, light from the top-left
- [ ] Only `baltibytes-v0` colours, with 3–4 per material
- [ ] 1 px `ink` outline (not on ground tiles); no anti-aliasing, alpha 0 or 255
- [ ] No painted ground shadow (the game adds `fx.shadow`)
- [ ] Rows and names follow §7; every animated frame filled
- [ ] Looks right next to existing assets in the art preview, at ×3 and at the default zoom, on grass and on path
- [ ] Interactive? It has a shape cue, not just colour
- [ ] Manifest entry complete; `npm run art:validate` passes
