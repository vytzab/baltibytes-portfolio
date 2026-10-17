// Site-wide switches.

/**
 * Publish the résumé: build /resume.html, offer it at the Exit Portal and point the home page's
 * skip link and no-JS message at it. On since 2026-10-17; turn it off to hide the page again
 * (`npm run dev` serves it either way, for editing).
 */
export const SHOW_RESUME = true;

/**
 * Places that are built but closed for now: their entrances are solid, and walking up to one
 * and pressing E shows this dialogue instead of going in. Map id → dialogue id (dialogue.ts).
 * Remove a line to open the place again; nothing else needs to change.
 */
export const LOCKED: Record<string, string> = {};
