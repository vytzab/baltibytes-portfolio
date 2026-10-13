// The asset list beside the preview: every manifest entry with its status, size, frames and
// provenance, and each image enlarged with its frame grid drawn over it.
import { assetUrl, manifest } from '../game/assets/loader.ts';
import type { AssetEntry } from '../game/assets/manifest.ts';

/** Enlarge small images more, so a 9 px prompt and a 192 px sheet are both inspectable. */
function galleryScale(entry: AssetEntry): number {
  const longest = Math.max(entry.width ?? 1, entry.height ?? 1);
  return Math.max(2, Math.min(8, Math.floor(384 / longest)));
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
}
