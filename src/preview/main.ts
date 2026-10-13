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
const scene = new ArtPreviewScene(new DialogueBox($('dialogue')), reduceMotion);

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
const placeholders = manifest.assets.filter((a) => a.status === 'placeholder').length;
$('art-status').textContent = placeholders > 0 ? `${placeholders} of ${manifest.assets.length} assets are placeholders` : 'All assets are production art';
$('zoom-out').addEventListener('click', () => setZoom((current?.zoom ?? 1) - 1));
$('zoom-in').addEventListener('click', () => setZoom((current?.zoom ?? 1) + 1));
$('zoom-fit').addEventListener('click', () => setZoom(null));
const grid = $<HTMLInputElement>('toggle-grid');
const collision = $<HTMLInputElement>('toggle-collision');
grid.addEventListener('change', () => scene.setGridVisible(grid.checked));
collision.addEventListener('change', () => scene.setCollisionVisible(collision.checked));

const gallery = $('gallery');
const galleryButton = $('toggle-gallery');
galleryButton.addEventListener('click', () => {
  const open = gallery.hidden;
  if (open && !gallery.hasChildNodes()) renderGallery(gallery);
  gallery.hidden = !open;
  galleryButton.setAttribute('aria-expanded', String(open));
});

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;
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
