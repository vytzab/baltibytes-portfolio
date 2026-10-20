// Pixel-perfect scaling. The zoom is a whole number of *device* pixels per game pixel, so every
// game pixel is the same size on screen, including on phones (devicePixelRatio 2 or 3).
// The game's own resolution grows or shrinks with the window instead of stretching.
import type * as Phaser from 'phaser';

/** Smallest area (game pixels) always visible: 15 × 9 tiles of 32 px. Sets the default zoom. */
export const MIN_VIEW = { width: 480, height: 288 } as const;
/** Art is 2× (ART_BIBLE §11), so 4 device pixels per game pixel is as big as the old ×8. */
export const MAX_ZOOM = 4;

export interface PixelScale {
  /** Device pixels per game pixel (whole number). */
  zoom: number;
  /** Game resolution in game pixels. */
  width: number;
  height: number;
  /** CSS pixels per game pixel; fractional when devicePixelRatio isn't 1. */
  cssPixel: number;
}

/** `zoomOverride` forces a zoom (the art preview's +/− buttons); null means fit to the window. */
export function computeScale(cssWidth: number, cssHeight: number, dpr: number, zoomOverride: number | null = null): PixelScale {
  const deviceWidth = Math.floor(cssWidth * dpr);
  const deviceHeight = Math.floor(cssHeight * dpr);
  const fit = Math.floor(Math.min(deviceWidth / MIN_VIEW.width, deviceHeight / MIN_VIEW.height));
  const zoom = Math.max(1, Math.min(MAX_ZOOM, zoomOverride ?? fit));
  return {
    zoom,
    width: Math.max(1, Math.floor(deviceWidth / zoom)),
    height: Math.max(1, Math.floor(deviceHeight / zoom)),
    cssPixel: zoom / dpr,
  };
}

/**
 * Keeps a game sized to its parent element. Returns `apply`, to call again after changing the
 * override. Also publishes `--px` (CSS pixels per game pixel) for HTML UI drawn over the game.
 */
export function keepPixelPerfect(game: Phaser.Game, parent: HTMLElement, getOverride: () => number | null, onChange?: (s: PixelScale) => void): () => PixelScale {
  const apply = () => {
    const s = computeScale(parent.clientWidth, parent.clientHeight, window.devicePixelRatio || 1, getOverride());
    game.scale.resize(s.width, s.height);
    game.scale.setZoom(s.cssPixel);
    document.documentElement.style.setProperty('--px', `${s.cssPixel}px`);
    onChange?.(s);
    return s;
  };
  new ResizeObserver(() => apply()).observe(parent);
  // Moving the window to a screen with another pixel ratio doesn't resize it; watch for that too.
  const watchDpr = () => matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => { apply(); watchDpr(); }, { once: true });
  watchDpr();
  return apply;
}
