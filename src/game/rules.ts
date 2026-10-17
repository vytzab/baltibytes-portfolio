// Gameplay sizes shared by the game and the Node asset validator (which checks that every map's
// spawn is free and every NPC, sign and prop with dialogue can be reached). Pure: no imports.

/** Collision box at a character's feet, so characters can walk "behind" the top of things. */
export const FEET = { width: 10, height: 6 } as const;

/** How close (game pixels, feet to feet) the player must be to interact: a bit over one tile. */
export const INTERACT_RANGE = 22;

/** The front of a prop's solid base: its bottom line, from the leftmost to the rightmost solid box. */
export interface FrontEdge {
  left: number;
  right: number;
}

/**
 * The front edge of a prop whose feet are at x, from its manifest solid boxes (relative to the
 * frame's top-left). Undefined when it has none: then reach is measured to its feet point.
 */
export function frontEdge(x: number, frameWidth: number, solid: ReadonlyArray<{ x: number; width: number }> | undefined): FrontEdge | undefined {
  if (!solid?.length) return undefined;
  const left = x - frameWidth / 2;
  return { left: left + Math.min(...solid.map((b) => b.x)), right: left + Math.max(...solid.map((b) => b.x + b.width)) };
}

/**
 * Distance from the player's feet to something they can use. Wide props (the portal, the
 * workshop) measure to their front edge, so they work from anywhere along the front or beside
 * them, not only from the middle; behind them stays out of reach because the edge is at the bottom.
 */
export function reachDistance(px: number, py: number, target: { x: number; y: number; front?: FrontEdge }): number {
  if (!target.front) return Math.hypot(px - target.x, py - target.y);
  const dx = px < target.front.left ? target.front.left - px : px > target.front.right ? px - target.front.right : 0;
  return Math.hypot(dx, py - target.y);
}
