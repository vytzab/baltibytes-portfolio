// Gameplay sizes shared by the game and the Node asset validator (which checks that every map's
// spawn is free and every NPC, sign and prop with dialogue can be reached). Pure: no imports.

/** Collision box at a character's feet, so characters can walk "behind" the top of things. */
export const FEET = { width: 10, height: 6 } as const;

/** How close (game pixels, feet to feet) the player must be to interact: a bit over one tile. */
export const INTERACT_RANGE = 22;
