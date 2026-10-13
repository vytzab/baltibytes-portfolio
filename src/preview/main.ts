// Entry point of art-preview.html: the game plus a development toolbar (map picker, zoom, grid and
// collision overlays, asset list). Only served by `npm run dev`; the production build leaves it out.
import '@fontsource/pixelify-sans/400.css';
import '../game/game.css';
import './preview.css';
import { manifest } from '../game/assets/loader.ts';
import { startGame } from '../game/boot.ts';
import { MAX_ZOOM, type PixelScale } from '../game/pixel-scale.ts';
import { renderGallery } from './gallery.ts';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// Which map to show: ?map=<id> in the URL, else the Starting Village.
const maps = manifest.assets.filter((a) => a.category === 'map').map((a) => a.id);
const requested = new URLSearchParams(location.search).get('map');
const initialMap = requested && maps.includes(requested) ? requested : 'map.village';

let zoomOverride: number | null = null;
let current: PixelScale | null = null;
const { scene, rescale } = startGame({
  ids: { game: 'game', dialogue: 'dialogue', panel: 'info-panel', touch: 'touch-controls' },
  mapId: initialMap,
  zoomOverride: () => zoomOverride,
  onScale: (s) => {
    current = s;
    $('zoom').textContent = `×${s.zoom}${zoomOverride === null ? ' (fit)' : ''}`;
    $('view').textContent = `${s.width} × ${s.height} px · DPR ${window.devicePixelRatio}`;
  },
});

function setZoom(z: number | null) {
  zoomOverride = z === null ? null : Math.max(1, Math.min(MAX_ZOOM, z));
  rescale();
}

// Toolbar
const count = (status: string) => manifest.assets.filter((a) => a.status === status).length;
const placeholders = count('placeholder');
const drafts = count('draft');
$('art-status').textContent =
  placeholders + drafts === 0
    ? 'All assets are production art'
    : [placeholders && `${placeholders} placeholder`, drafts && `${drafts} draft`].filter(Boolean).join(' · ') + ` of ${manifest.assets.length} assets`;
$('zoom-out').addEventListener('click', () => setZoom((current?.zoom ?? 1) - 1));
$('zoom-in').addEventListener('click', () => setZoom((current?.zoom ?? 1) + 1));
$('zoom-fit').addEventListener('click', () => setZoom(null));
const grid = $<HTMLInputElement>('toggle-grid');
const collision = $<HTMLInputElement>('toggle-collision');
grid.addEventListener('change', () => scene.setGridVisible(grid.checked));
collision.addEventListener('change', () => scene.setCollisionVisible(collision.checked));
// Overlays survive a map change: reapply them every time the scene is (re)created.
scene.onCreated = () => {
  scene.setGridVisible(grid.checked);
  scene.setCollisionVisible(collision.checked);
};

const mapSelect = $<HTMLSelectElement>('map-select');
const mapNames: Record<string, string> = {
  'map.village': 'Starting Village',
  'map.dungeon': 'Dungeon',
  'map.tower': 'Skill Tower',
  'map.guildhall': 'Guild Hall',
  'map.art-preview': 'Test area',
};
mapSelect.innerHTML = maps.map((id) => `<option value="${id}">${mapNames[id] ?? id}</option>`).join('');
mapSelect.value = initialMap;
const rememberMap = (id: string) => {
  const url = new URL(location.href);
  url.searchParams.set('map', id);
  history.replaceState(null, '', url);
};
mapSelect.addEventListener('change', () => {
  scene.showMap(mapSelect.value);
  rememberMap(mapSelect.value);
  mapSelect.blur(); // give the keys back to the game
});
// Walking through a portal changes the map too: keep the picker and the URL in step.
scene.onMapChanged = (id) => {
  mapSelect.value = id;
  rememberMap(id);
};

const gallery = $('gallery');
const galleryButton = $('toggle-gallery');
galleryButton.addEventListener('click', () => {
  const open = gallery.hidden;
  if (open && !gallery.hasChildNodes()) renderGallery(gallery);
  gallery.hidden = !open;
  galleryButton.setAttribute('aria-expanded', String(open));
});

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!$('info-panel').hidden) return; // the info panel has the keyboard
  const toggle = (box: HTMLInputElement) => {
    box.checked = !box.checked;
    box.dispatchEvent(new Event('change'));
  };
  if (e.key === 'g' || e.key === 'G') toggle(grid);
  else if (e.key === 'c' || e.key === 'C') toggle(collision);
  else if (e.key === '+' || e.key === '=') setZoom((current?.zoom ?? 1) + 1);
  else if (e.key === '-') setZoom((current?.zoom ?? 1) - 1);
  else if (e.key === '0') setZoom(null);
});
