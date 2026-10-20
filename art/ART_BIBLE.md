# Baltibytes art bible

The visual rules for every piece of art in the game. Anyone (the owner, a hired artist, or someone using an image-generation tool and cleaning up its output) should be able to make an asset that fits by following this page. The commands and file workflow are in [README.md](README.md).

Status: **v0, provisional.** The rules were tested in the art preview (`art-preview.html`): the terrain and props are placeholders; the player and guide (v2, 24 × 32) are the first real character art, as drafts awaiting approval. Rules marked *(tentative)* should be confirmed with more production art.

**Moving to 2× (in progress, decided 2026-10-20).** All art is being redrawn at twice the resolution (32 × 32 tiles, 48 × 64 characters) for more detail; see §11. Until the switch, the 1× rules in §1–§10 apply to everything in the game.

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
| Exit Portal | Contact | A stone ring with a heather and sea-light swirl, in the glade by the village gate; the one place a soft glow is allowed (§6). The current portal uses hard pixels only. |

## 2. Perspective and camera

- **Top-down three-quarter view** (the classic RPG view): the ground is seen from above, and anything that stands up (characters, walls, house fronts, signs) is seen from the front. Every asset uses this same angle. Don't mix in pure side views or isometric pieces.
- **Light comes from the top-left**, always. Shade on the bottom-right of forms.
- The camera follows the player, snapped to whole pixels. It always shows at least **240 × 144 game pixels (15 × 9 tiles)**; bigger screens see more of the world at the same pixel size rather than a stretched picture.
- Things are drawn at one scale. A tree is not drawn in more detail than the character next to it.

## 3. Sizes

| Asset | Size (px) | Rules |
|---|---|---|
| Tile | **16 × 16** | Ground and decoration tiles. Ground tiles tile seamlessly in every direction. |
| Character / NPC frame | **24 × 32** | Figure 26–29 px tall (player 26, guide 29 with her bun), about 12–16 px wide plus accessories; head about 14 × 14. Feet on the bottom row, body centred on the line between columns 11 and 12. Origin = bottom centre. Collision is separate: a 10 × 6 box at the feet, whatever the frame size. |
| Large creature or vehicle | 32 × 32 frames | Only when 24 × 32 truly can't fit it; feet on the bottom row. |
| Objects and props | Multiples of 8, footprint ideally a whole number of tiles | Signs, chests, lamps: usually 16 × 16 or 16 × 32. Trees 32 × 48 to 32 × 56. Buildings: multiples of 16 (the workshop is 80 × 80, its door 28 px tall so characters fit through it). |
| UI frames | 9-slice with **8 px** corners | `ui.dialogue-box` is 24 × 24 (8 px corners, 8 px stretchable edges). |
| UI icons | 8 × 8 or 16 × 16 | The "!" prompt is 9 × 9 (odd, so the "!" has a centre column). |
| Portraits *(tentative)* | 48 × 48 | For dialogue, if wanted. None exist yet. |

**Why 24 × 32 for characters** (changed from 16 × 24 on 2026-10-13). The 16 × 24 placeholders had a 20 px body: 4 rows of face, 1 px eyes, no room for layered clothes, and nothing could stick out of the silhouette. 24 × 32 is the smallest frame that fits what makes a character recognisable at ×3–×6: a 14 px head with 2 px eyes, glasses or a fringe; a jacket over a shirt; and accessories that leave the body outline, like a backpack in profile or a coat flaring at the hem. 16 × 32 was considered and rejected: a 16 px width can't hold a profile backpack or a flared coat. The figures are about 1.6–1.8 tiles tall, a usual cozy-RPG proportion; tiles, props and collision were not changed.

**Chibi proportions:** the head is about half the figure's height, so faces read at real size. Everyone shares this proportion; tell characters apart by silhouette (hair shape, accessories, garment outline), not by height alone.

### Tiles or props?

- **Tiles** for anything flat or knee-high that repeats: ground, paths, water, flowers, pebbles, fences, bushes, rocks. They go on the ground or decor layer, under every character.
- **Props** (objects placed by their feet) for anything a character can stand behind: trees, buildings, arches, lamps, notice boards, stacked crates. Props are depth-sorted with the characters by the y of their base, so a character north of a tree trunk disappears behind the crown and one south of it is drawn in front.
- **Collision is not painted.** A prop is solid only where its manifest `solid` boxes say: usually its footprint at the base (a trunk, two post feet, a building's walls and roof depth). Map-wide blockers (a forest edge, an invisible wall) are rectangles in the map's `collision` layer, so scenery can be moved without breaking where you can walk.
- Draw props with **room at the base for collision**: two posts need a gap of at least 16 px between their solid boxes for a character (10 px feet) to pass comfortably.

### Edges between surfaces

### Indoor floors

Stone buildings share the dungeon tileset's walls and banners. The Skill Tower keeps flagstones; the Guild Hall has warm floorboards (`tiles.interior`), and rugs mark where people gather (the tower's star rug, the hall's runner).

### Walls indoors

Indoors (the Dungeon), a wall with floor to its south shows its **face**: two tiles of brick, an upper course with a lit lip under the wall top and a lower course with a dark skirting where it meets the floor. Every other wall shows its **top**: dark, with an ink edge and a lit line on each side that meets floor (16 rim combinations). Walls need to be at least 2 tiles thick above any floor so the face fits. Banners, torches and anything else hung on a wall go on the lower face course. The dungeon map generator picks tops, faces and rims from a plain `#`/`.` layout.

### Paths and water

Paths and water never meet grass at a straight tile edge. Edge tiles show a ragged 2–4 px grass fringe (12 per surface: 4 sides, 4 outer corners, 4 inner corners), with a dark trodden rim on paths and a sand bank plus foam on water. The fringe is 3 px deep where it meets the next tile, so any edge tile joins any other. Surfaces must be at least 2 tiles wide wherever they have grass on both sides. The village map generator picks the right edge tile automatically and refuses layouts that would need anything else.

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
- **Reserved meanings:** `brick` marks what wants attention (the "!" prompt, a speaker's name), so keep big brick areas rare (small accents like headphone cups or a book cover are fine). `heather` is for magic, skills and guides (Skill Tower, portal, the guide's coat).
- **Character colour plans:** give each character one dominant garment hue no other character uses, plus one warm accent. Player: denim blue with a mustard backpack. Guide: heather coat with a gold scarf. Keeper (Dungeon): moss-green hooded cloak with a brick tunic and a gold lantern. Sage (Skill Tower): heather hat, teal robe, gold trim. Guildmaster (Guild Hall): cream shirt, leather apron, grey moustache. Courier (Exit Portal): flat cap, brick-red jacket, satchel. Each also has a silhouette of their own (cowlick, bun, hood point, hat brim, bald and broad). Avoid large green or sand garments, which vanish against grass and paths.
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
- **Timing:** idle 4 frames at 3 fps (still, still, a 1 px breath, a blink); walk 4 frames at 8 fps (contact, passing, contact with the other foot, passing). Pick fps per animation in the manifest.
- **Walk poses:** on contact frames the upper body dips 1 px (bent knees) and arms swing against the legs; feet never leave the bottom row and the head never shifts sideways within a direction. Side views swing the near arm forward and back. Secondary motion (a scarf tail, a coat hem) sways 1 px against the step.
- **Character parts:** characters are built from parts (head, body, near arm, legs) in `tools/art/characters/`, each part hand-drawn as a text grid, and stacked by `compose.ts`. A new character copies `player.ts` and redraws the grids; the layout above comes for free.
- Every frame used by an animation must contain something (the validator flags empty frames).
- **Ambient loops** (water, flags, torches) must look fine frozen on their first frame, which is what visitors who ask for reduced motion get.

## 8. Files and names

- **PNG**, 8-bit RGBA, transparent background where the manifest says `transparent`. No JPEG, WebP or SVG for art.
- **Names:** lowercase kebab-case (`npc-guide.png`, `dialogue-box.png`), in the folder for the category (`characters/`, `tiles/`, `maps/`, `objects/`, `portraits/`, `ui/`, `effects/`).
- **Ids:** `<prefix>.<name>`, where prefix is `char`, `tiles`, `map`, `obj`, `portrait`, `ui` or `fx`. An id is permanent once code uses it. Replace the file, keep the id.
- **Maps:** Tiled JSON with CSV layers and **embedded** tilesets; each tileset's name is its manifest id (`tiles.terrain`); a map may use several tilesets. Layers: `ground` and `decor` (tiles), `entities` (points at the feet: type `spawn`, `arrive` (named, where a portal from another map lets you out; optional `facing`), `npc`, `sign` or `prop`, with string properties `sprite`, a manifest id, and optionally `dialogue`, a text id, or `panel`, an info-panel document: `project:<id>`, `skills:<id>`, `role:<id>` or `experience`; plus `portal` rectangles with `to`, a map id, and `arrive`, an arrival name in that map), `collision` (solid rectangles). Tile collision is a boolean tile property `collides`.
- **Editor sources** (`.aseprite`, `.pxo`, `.kra`) live in `art/source/<category>/` with the same name as the PNG.

## 9. Originality and provenance

- Everything is original work made for this site, or third-party art whose licence allows use **and redistribution in a public repository** (CC0, CC-BY 4.0 with credit, OFL for fonts, MIT). "Free for personal use" or "no redistribution" packs can't be used.
- Every file in `src/assets/` has a manifest entry with its origin, author, date, licence and tool. The build fails without one.
- **Image-generation tools:** only if the owner approves for that asset; record the tool and the prompt in the manifest. Outputs need redrawing to the pixel grid and palette (see README §Future artwork). Their copyright status is unsettled, so prefer them for ideas and rough shapes, not finished art.
- Never feed other artists' or games' art into a tool as a style reference to copy.

## 10. Consistency checklist (per asset)

- [ ] Right size (§3), feet on the bottom row for anything that stands, in every frame
- [ ] Top-down three-quarter view, light from the top-left
- [ ] Only `baltibytes-v0` colours, with 3–4 per material
- [ ] 1 px `ink` outline (not on ground tiles); no anti-aliasing, alpha 0 or 255
- [ ] No painted ground shadow (the game adds `fx.shadow`)
- [ ] Props: `solid` boxes cover the footprint only, and leave passages at least 16 px wide
- [ ] Rows and names follow §7; every animated frame filled
- [ ] Looks right next to existing assets in the art preview, at ×3 and at the default zoom, on grass and on path
- [ ] Interactive? It has a shape cue, not just colour
- [ ] Manifest entry complete; `npm run art:validate` passes

## 11. Moving to 2× (v1, in progress)

Decided 2026-10-20: at 24 × 32 a face is about 10 × 5 pixels, too small for the detail wanted. Everything moves to twice the resolution together, on a branch, and ships in one switch, so the game never mixes pixel sizes (§4). Until then §1–§10 stay in force.

| Asset | 1× now | 2× |
|---|---|---|
| Tile | 16 × 16 | **32 × 32** |
| Character frame | 24 × 32 | **48 × 64**, figure about 58 px tall, head about 28 px; feet on row 63, body centred on the line between columns 23 and 24 |
| Feet collision box | 10 × 6 | 20 × 12 |
| Minimum view | 240 × 144 | 480 × 288 (still 15 × 9 tiles) |
| UI 9-slice corners | 8 px | 16 px |

Unchanged: the view and light (§2), the palette (§5), the 1 px ink outline and no anti-aliasing (§4, §6), and the sheet layout and timing (§7: 4 idle and 4 walk frames per direction).

- **How 2× art is made:** characters are painted in code by the assetGenerator repo (`../assetGenerator`, `designs/baltibytes/`). Parts are shapes with a material ramp, and the light, cast shadows and outlines follow §6 by rule. Faces, strands and buttons are placed pixel by pixel. Image-generation tools gave concepts only.
- **Player (v4, approved 2026-10-20):** an auburn side part with three small spikes on the crown, a cream oxford shirt tucked into grey trousers, a leather belt with a gold buckle, black shoes (`ink`, there is no black). No backpack or headphones any more. Silhouette: the spiky crown.
- **Guide (v3, approved 2026-10-20):** a silver bun, round gold glasses, a heather cardigan over a cream blouse and a grey skirt, a gold scarf, a leather satchel on a strap across her, and the red book with gold corners held in both hands. She doesn't swing her arms when she walks: the skirt hem sways and her shoes step out under it. Her eyes are kind closed arcs. Silhouette: the bun and the satchel.
- **Keeper (v3, approved 2026-10-20):** a moss-green cloak whose hood drapes onto his shoulders and rises to a tall point leaning back, with the dark inside of the hood framing his face; a bushy ginger beard, a brick-red tunic, a ring of keys on his belt, and a brass lantern hung from a tall wooden pole that stays upright as he walks. Silhouette: the hood point and the pole lantern.
- **Sage (v3, approved 2026-10-20):** a wide-brimmed pointed heather hat with a gold band and star, long straight dark hair, a teal robe with gold trim, small gold stars all over it and a zigzag hem, and a glowing orb held in both hands at her chest (hard pixels, no soft glow). Her robe reaches the ground, so the hem sways and her shoes step out under it. Silhouette: the hat's brim and cone.
- **Guildmaster (v3, approved 2026-10-20):** stout and the shortest of the cast; bald with a grey horseshoe of hair, spectacles pushed up on his head, a big grey walrus moustache and bushy brows, a cream shirt with the sleeves rolled up over strong forearms, a leather apron with a brass buckle whose straps cross on his back, and the guild's ledger held open in both hands. Silhouette: the bald dome and the barrel build.
- **Courier (v3, approved 2026-10-20):** blond curls and freckles under a brown tweed newsboy cap with a sealed letter tucked in its band, a brick-red jacket with gold buttons over a cream shirt, and a leather satchel on his left hip with a letter sticking out, its strap across his chest. His arms swing as he walks. Silhouette: the cap and the satchel.
- **Workshop (v2, approved 2026-10-20):** 160 × 160, the same footprint and 56 px arched door as now. Wooden shake roof over cream half-timber walls, a front gable over the door with a round window and crossed finial, the "</>" plaque, a lantern beside the door, a hanging gear sign off the right-hand corner, and a desk with two monitors seen through the right-hand window (the door dialogue mentions them).
- **Notice board (v2, approved 2026-10-20):** 64 × 64 on two posts with a 32 px gap. A shake roof with a crossed finial like the workshop gable, a cork board with a written page, a portrait of the player and a sea sketch, a lantern hung on the right, and a flower planter between the posts.
- **Held props and mirroring:** the right-facing rows are the left-facing ones mirrored (§7), so a prop held in one particular hand swaps hands when a character turns. Prefer props held in both hands or worn centrally; a one-handed prop goes on the near side in side views so it stays in front.
- **Side views:** behind the ear the hair covers the back of the head down to the nape; no bare skull shows under it.
- **Exception to §5:** the player's hair uses `brick` as its lit colour (auburn), although brick is reserved for attention; Vytautas chose it. Keep brick out of other characters' large areas.

