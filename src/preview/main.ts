// Entry point of art-preview.html.
import '@fontsource/pixelify-sans/400.css';
import './preview.css';
import * as Phaser from 'phaser';
import { manifest } from '../game/assets/loader.ts';
import { DialogueBox } from '../game/dialogue-box.ts';
import { MAX_ZOOM, keepPixelPerfect, type PixelScale } from '../game/pixel-scale.ts';
import { ArtPreviewScene } from './ArtPreviewScene.ts';
import { renderGallery } from './gallery.ts';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const parent = $('game');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Which map to show: ?map=<id> in the URL, else the Starting Village.
const maps = manifest.assets.filter((a) => a.category === 'map').map((a) => a.id);
const requested = new URLSearchParams(location.search).get('map');
const initialMap = requested && maps.includes(requested) ? requested : 'map.village';
const scene = new ArtPreviewScene(new DialogueBox($('dialogue')), reduceMotion, initialMap);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  pixelArt: true,
  backgroundColor: '#2a1e2b',
  width: 240,
  height: 144,
  scale: { mode: Phaser.Scale.NONE },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene,
});

let zoomOverride: number | null = null;
let current: PixelScale | null = null;
let apply: () => PixelScale = () => current!;

game.events.once(Phaser.Core.Events.READY, () => {
  apply = keepPixelPerfect(game, parent, () => zoomOverride, (s) => {
    current = s;
    $('zoom').textContent = `×${s.zoom}${zoomOverride === null ? ' (fit)' : ''}`;
    $('view').textContent = `${s.width} × ${s.height} px · DPR ${window.devicePixelRatio}`;
  });
  apply();
});

function setZoom(z: number | null) {
  zoomOverride = z === null ? null : Math.max(1, Math.min(MAX_ZOOM, z));
  apply();
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
const mapNames: Record<string, string> = { 'map.village': 'Starting Village', 'map.art-preview': 'Test area' };
mapSelect.innerHTML = maps.map((id) => `<option value="${id}">${mapNames[id] ?? id}</option>`).join('');
mapSelect.value = initialMap;
mapSelect.addEventListener('change', () => {
  scene.showMap(mapSelect.value);
  const url = new URL(location.href);
  url.searchParams.set('map', mapSelect.value);
  history.replaceState(null, '', url);
  mapSelect.blur(); // give the keys back to the game
});

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
