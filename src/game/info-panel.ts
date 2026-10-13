// The info panel: an HTML dialog over the game (like the dialogue box, so text is sharp, zoomable
// and read by screen readers) that shows a document from panel-docs.ts: a project's case study,
// a skill category, a role, the experience overview. Tabs for multi-section documents (arrow
// keys move between them), links to other documents with a Back button, Esc or ✕ to close,
// focus kept inside while open and returned afterwards.
import { assetUrl } from './assets/loader.ts';
import { docFor, type PanelDoc } from './panel-docs.ts';

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export class InfoPanel {
  /** Called whenever a document is shown (e.g. to mark a project's chest as opened). */
  onShow: ((key: string) => void) | null = null;

  private readonly root: HTMLElement;
  private doc: PanelDoc | null = null;
  private history: string[] = [];
  private tab = 0;
  private onClose: (() => void) | null = null;
  private returnFocus: Element | null = null;

  constructor(root: HTMLElement, frameAssetId = 'ui.dialogue-box') {
    this.root = root;
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'info-panel-title');
    root.style.setProperty('--frame-image', `url("${assetUrl(frameAssetId)}")`);
    root.addEventListener('keydown', (e) => this.onKey(e));
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-close]')) return this.close();
      if (target.closest('[data-back]')) return this.back();
      const link = target.closest<HTMLElement>('[data-open]');
      if (link?.dataset.open) return this.navigate(link.dataset.open);
      const tab = target.closest<HTMLElement>('[data-tab]');
      if (tab) this.select(Number(tab.dataset.tab), true);
    });
  }

  get isOpen(): boolean {
    return this.doc !== null;
  }

  /** Opens a document by key; returns false if there is no such document. */
  open(key: string, onClose?: () => void): boolean {
    const doc = docFor(key);
    if (!doc) return false;
    this.history = [];
    this.onClose = onClose ?? null;
    this.returnFocus = document.activeElement;
    this.show(doc);
    this.root.hidden = false;
    this.focusFirst();
    return true;
  }

  close(): void {
    if (!this.doc) return;
    this.doc = null;
    this.history = [];
    this.root.hidden = true;
    this.root.innerHTML = '';
    if (this.returnFocus instanceof HTMLElement) this.returnFocus.focus();
    const done = this.onClose;
    this.onClose = null;
    done?.();
  }

  private navigate(key: string): void {
    const doc = docFor(key);
    if (!doc || !this.doc) return;
    this.history.push(this.doc.key);
    this.show(doc);
    this.focusFirst();
  }

  private back(): void {
    const key = this.history.pop();
    const doc = key ? docFor(key) : undefined;
    if (!doc) return;
    this.show(doc);
    this.focusFirst();
  }

  private show(doc: PanelDoc): void {
    this.doc = doc;
    this.tab = 0;
    this.render();
    this.onShow?.(doc.key);
  }

  private focusFirst(): void {
    const target = this.root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? this.root.querySelector<HTMLElement>('[data-back]') ?? this.root.querySelector<HTMLElement>('[data-close]');
    target?.focus();
  }

  private select(index: number, focus: boolean): void {
    if (!this.doc) return;
    const count = this.doc.sections.length;
    this.tab = (index + count) % count;
    this.render();
    if (focus) this.root.querySelector<HTMLElement>(`[data-tab="${this.tab}"]`)?.focus();
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.doc) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && (e.target as HTMLElement).getAttribute('role') === 'tab') {
      e.preventDefault();
      this.select(this.tab + (e.key === 'ArrowRight' ? 1 : -1), true);
    } else if (e.key === 'Tab') {
      // Keep focus inside the dialog.
      const focusable = [...this.root.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    // Keys used inside the panel never reach the game.
    e.stopPropagation();
  }

  private render(): void {
    const d = this.doc;
    if (!d) return;
    const section = d.sections[this.tab]!;
    const tabs =
      d.sections.length > 1
        ? `<div class="info-panel__tabs" role="tablist" aria-label="Sections">${d.sections
            .map((s, i) => `<button type="button" role="tab" id="ip-tab-${i}" data-tab="${i}" aria-selected="${i === this.tab}" aria-controls="ip-body" tabindex="${i === this.tab ? 0 : -1}">${escapeHtml(s.title)}</button>`)
            .join('')}</div>`
        : `<h3 class="info-panel__section-title">${escapeHtml(section.title)}</h3>`;
    const paragraphs = (section.paragraphs ?? []).map((t) => `<p>${escapeHtml(t)}</p>`).join('');
    const bullets = section.bullets?.length ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '';
    const items = section.items?.length
      ? `<ul class="info-panel__items">${section.items
          .map(
            (it) => `<li><span class="info-panel__item-label">${escapeHtml(it.label)}</span>${it.note ? ` <span class="info-panel__item-note">${escapeHtml(it.note)}</span>` : ''}${
              it.links?.length ? `<span class="info-panel__item-links">${it.links.map((l) => `<button type="button" data-open="${escapeHtml(l.key)}">${escapeHtml(l.label)}</button>`).join('')}</span>` : ''
            }</li>`,
          )
          .join('')}</ul>`
      : '';
    const links = d.links?.length
      ? `<p class="info-panel__links">${d.links.map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`).join(' · ')}</p>`
      : d.note
        ? `<p class="info-panel__links info-panel__muted">${escapeHtml(d.note)}</p>`
        : '';
    const chips = d.chips?.length ? `<ul class="info-panel__chips" aria-label="${escapeHtml(d.chipsLabel ?? 'Tags')}">${d.chips.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : '';
    const footer = d.role || chips || links ? `<footer class="info-panel__footer">${d.role ? `<p><strong>Role:</strong> ${escapeHtml(d.role)}</p>` : ''}${chips}${links}</footer>` : '';
    const back = this.history.length ? `<button type="button" class="info-panel__back" data-back>← Back</button>` : '';
    this.root.dataset.accent = d.accent;
    this.root.innerHTML = `
      <div class="info-panel__frame">
        <header class="info-panel__header">
          ${back}
          <p class="info-panel__kicker">${escapeHtml(d.kicker)}</p>
          <h2 id="info-panel-title">${escapeHtml(d.title)}</h2>
          ${d.tagline ? `<p class="info-panel__tagline">${escapeHtml(d.tagline)}</p>` : ''}
          <button type="button" class="info-panel__close" data-close aria-label="Close">✕</button>
        </header>
        ${tabs}
        <section id="ip-body" class="info-panel__body" ${d.sections.length > 1 ? `role="tabpanel" aria-labelledby="ip-tab-${this.tab}"` : ''}>
          ${paragraphs}${bullets}${items}
        </section>
        ${footer}
        <p class="info-panel__hint" aria-hidden="true">${d.sections.length > 1 ? '← → sections · ' : ''}Esc close</p>
      </div>`;
  }
}
