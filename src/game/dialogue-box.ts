// Dialogue drawn in HTML over the canvas, not inside it: text stays sharp at any zoom, scales with
// the browser's font settings and is read out by screen readers (aria-live). The pixel-art frame
// is the manifest's nine-slice image, applied as a CSS border-image.
import { assetUrl } from './assets/loader.ts';

export interface Dialogue {
  speaker: string;
  lines: readonly string[];
}

export class DialogueBox {
  private readonly root: HTMLElement;
  private readonly speakerEl: HTMLElement;
  private readonly textEl: HTMLElement;
  private dialogue: Dialogue | null = null;
  private index = 0;
  private onClose: (() => void) | null = null;

  constructor(root: HTMLElement, frameAssetId = 'ui.dialogue-box') {
    this.root = root;
    root.style.setProperty('--frame-image', `url("${assetUrl(frameAssetId)}")`);
    root.hidden = true;
    root.setAttribute('aria-live', 'polite');
    root.innerHTML = '<p class="dialogue__speaker"></p><p class="dialogue__text"></p><p class="dialogue__hint" aria-hidden="true">Space ▸</p>';
    this.speakerEl = root.querySelector('.dialogue__speaker')!;
    this.textEl = root.querySelector('.dialogue__text')!;
    root.addEventListener('click', () => this.advance());
  }

  get isOpen(): boolean {
    return this.dialogue !== null;
  }

  open(dialogue: Dialogue, onClose?: () => void): void {
    this.dialogue = dialogue;
    this.index = 0;
    this.onClose = onClose ?? null;
    this.root.hidden = false;
    this.render();
  }

  /** Next line, or close after the last one. */
  advance(): void {
    if (!this.dialogue) return;
    if (this.index < this.dialogue.lines.length - 1) {
      this.index++;
      this.render();
    } else this.close();
  }

  close(): void {
    if (!this.dialogue) return;
    this.dialogue = null;
    this.root.hidden = true;
    const done = this.onClose;
    this.onClose = null;
    done?.();
  }

  private render(): void {
    if (!this.dialogue) return;
    const last = this.index === this.dialogue.lines.length - 1;
    this.speakerEl.textContent = this.dialogue.speaker;
    this.textEl.textContent = this.dialogue.lines[this.index] ?? '';
    // Name the button the visitor actually has: the on-screen A on touch screens, Space otherwise.
    const key = document.body.classList.contains('has-touch-controls') ? 'A' : 'Space';
    this.root.querySelector('.dialogue__hint')!.textContent = `${key} ${last ? '✕' : '▸'}`;
  }
}
