// Site-wide switches.

/**
 * Publish the résumé: build /resume.html and offer it at the Exit Portal. Off while its content is
 * still a draft (`npm run dev` still serves the page for editing).
 */
export const SHOW_RESUME = false;

/**
 * Places that are built but closed for now: their entrances are solid, and walking up to one
 * and pressing E shows this dialogue instead of going in. Map id → dialogue id (dialogue.ts).
 * Remove a line to open the place again; nothing else needs to change.
 */
export const LOCKED: Record<string, string> = {
  'map.dungeon': 'locked-dungeon',
  'map.tower': 'locked-tower',
  'map.guildhall': 'locked-guildhall',
};
