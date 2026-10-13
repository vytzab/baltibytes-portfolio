// The asset list beside the preview: every manifest entry with its status, size, frames and
// provenance, and each image enlarged with its frame grid drawn over it.
import { assetUrl, manifest } from '../game/assets/loader.ts';
import type { AssetEntry } from '../game/assets/manifest.ts';

/** Enlarge small images more, so a 9 px prompt and a 192 px sheet are both inspectable. */
function galleryScale(entry: AssetEntry): number {
  const longest = Math.max(entry.width ?? 1, entry.height ?? 1);
  return Math.max(2, Math.min(8, Math.floor(384 / longest)));
}

/** Each animation playing at native size (×1) and enlarged, side by side. */
function animationPlayers(entry: AssetEntry): string {
  if (!entry.animations?.length || !entry.grid) return '';
  const { width, height } = entry.grid;
  const players = entry.animations.map((a) => {
    const canvas = (scale: number) =>
      `<canvas data-anim="${escapeHtml(entry.id)}" data-row="${a.row}" data-frames="${a.frames}" data-fps="${a.fps}" data-scale="${scale}" width="${width * scale}" height="${height * scale}"></canvas>`;
    return `<figure class="anim">${canvas(1)}${canvas(4)}<figcaption>${escapeHtml(a.name)}</figcaption></figure>`;
  });
  return `<div class="anims" aria-label="Animations of ${escapeHtml(entry.id)}, at ×1 and ×4">${players.join('')}</div>`;
}

/** Drives every animation canvas from one requestAnimationFrame loop while the panel is open. */
function playAnimations(root: HTMLElement): void {
  const canvases = [...root.querySelectorAll<HTMLCanvasElement>('canvas[data-anim]')];
  const images = new Map<string, HTMLImageElement>();
  for (const id of new Set(canvases.map((c) => c.dataset.anim!))) {
    const img = new Image();
    img.src = assetUrl(id);
    images.set(id, img);
  }
  const lastFrame = new WeakMap<HTMLCanvasElement, number>();
  const tick = (now: number) => {
    if (!root.hidden) {
      for (const canvas of canvases) {
        const img = images.get(canvas.dataset.anim!)!;
        if (!img.complete) continue;
        const scale = Number(canvas.dataset.scale);
        const fw = canvas.width / scale;
        const fh = canvas.height / scale;
        const frame = Math.floor((now / 1000) * Number(canvas.dataset.fps)) % Number(canvas.dataset.frames);
        if (lastFrame.get(canvas) === frame) continue;
        lastFrame.set(canvas, frame);
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, frame * fw, Number(canvas.dataset.row) * fh, fw, fh, 0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function row(term: string, value: string | undefined): string {
  return value ? `<dt>${term}</dt><dd>${escapeHtml(value)}</dd>` : '';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

export function renderGallery(root: HTMLElement): void {
  const cards = manifest.assets.map((entry) => {
    const p = entry.provenance;
    const size = entry.width ? `${entry.width} × ${entry.height} px` : undefined;
    const grid = entry.grid ? `${entry.grid.width} × ${entry.grid.height} px ${entry.category === 'character' || entry.animations ? 'frames' : 'tiles'}` : undefined;
    const animations = entry.animations?.map((a) => `${a.name} (${a.frames} @ ${a.fps} fps)`).join(', ');
    let picture = '';
    let shown: string | undefined;
    if (entry.type !== 'tilemap') {
      const scale = galleryScale(entry);
      shown = `×${scale}`;
      const style = [
        `--w:${(entry.width ?? 0) * scale}px`,
        `--h:${(entry.height ?? 0) * scale}px`,
        `--gw:${(entry.grid?.width ?? entry.width ?? 0) * scale}px`,
        `--gh:${(entry.grid?.height ?? entry.height ?? 0) * scale}px`,
      ].join(';');
      picture = `<div class="sheet" style="${style}"><img src="${assetUrl(entry.id)}" alt="" width="${(entry.width ?? 0) * scale}" height="${(entry.height ?? 0) * scale}"></div>`;
    }
    return `<article class="card">
      <h3>${escapeHtml(entry.id)} <span class="status status--${entry.status}">${entry.status}</span></h3>
      ${picture}
      ${animationPlayers(entry)}
      <dl>
        ${row('File', `src/assets/${entry.path}`)}
        ${row('Use', entry.usage)}
        ${row('Size', size && shown ? `${size}, shown ${shown}` : size)}
        ${row('Grid', grid)}
        ${row('Animations', animations)}
        ${row('Transparency', entry.transparency)}
        ${row('Palette', entry.palette)}
        ${row('Origin', `${p.origin}, ${p.author}, ${p.created}`)}
        ${row('Licence', p.license === 'owner' ? 'owner (original work for this site)' : p.license)}
        ${row('Source', p.source)}
        ${row('Notes', entry.notes)}
      </dl>
    </article>`;
  });
  root.innerHTML = `<h2>Assets (${manifest.assets.length})</h2>${cards.join('')}`;
  playAnimations(root);
}
