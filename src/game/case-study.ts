// The case-study panel: an HTML dialog over the game (like the dialogue box, so text is sharp,
// zoomable and read by screen readers). Tabs for the sections, arrow keys to move between them,
// Esc or the close button to leave, focus kept inside while open and returned afterwards.
import { assetUrl } from './assets/loader.ts';
import type { Project } from '../content/projects.ts';

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export class CaseStudyPanel {
  private readonly root: HTMLElement;
  private project: Project | null = null;
  private tab = 0;
  private onClose: (() => void) | null = null;
  private returnFocus: Element | null = null;

  constructor(root: HTMLElement, frameAssetId = 'ui.dialogue-box') {
    this.root = root;
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'case-study-title');
    root.style.setProperty('--frame-image', `url("${assetUrl(frameAssetId)}")`);
    root.addEventListener('keydown', (e) => this.onKey(e));
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-close]')) this.close();
      const tab = target.closest<HTMLElement>('[data-tab]');
      if (tab) this.select(Number(tab.dataset.tab), true);
    });
  }

  get isOpen(): boolean {
    return this.project !== null;
  }

  open(project: Project, onClose?: () => void): void {
    this.project = project;
    this.tab = 0;
    this.onClose = onClose ?? null;
    this.returnFocus = document.activeElement;
    this.render();
    this.root.hidden = false;
    this.root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }

  close(): void {
    if (!this.project) return;
    this.project = null;
    this.root.hidden = true;
    this.root.innerHTML = '';
    if (this.returnFocus instanceof HTMLElement) this.returnFocus.focus();
    const done = this.onClose;
    this.onClose = null;
    done?.();
  }

  private select(index: number, focus: boolean): void {
    if (!this.project) return;
    const count = this.project.sections.length;
    this.tab = (index + count) % count;
    this.render();
    if (focus) this.root.querySelector<HTMLElement>(`[data-tab="${this.tab}"]`)?.focus();
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.project) return;
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
    const p = this.project;
    if (!p) return;
    const section = p.sections[this.tab]!;
    const tabs = p.sections
      .map((s, i) => `<button type="button" role="tab" id="cs-tab-${i}" data-tab="${i}" aria-selected="${i === this.tab}" aria-controls="cs-panel" tabindex="${i === this.tab ? 0 : -1}">${escapeHtml(s.title)}</button>`)
      .join('');
    const bullets = section.bullets?.length ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '';
    const links = p.links.length
      ? `<p class="case-study__links">${p.links.map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`).join(' · ')}</p>`
      : '<p class="case-study__links case-study__muted">Source is private; happy to walk through it on request.</p>';
    this.root.dataset.accent = p.accent;
    this.root.innerHTML = `
      <div class="case-study__frame">
        <header class="case-study__header">
          <p class="case-study__kind">${escapeHtml(p.kind)} · ${escapeHtml(p.status)}</p>
          <h2 id="case-study-title">${escapeHtml(p.title)}</h2>
          <p class="case-study__tagline">${escapeHtml(p.tagline)}</p>
          <button type="button" class="case-study__close" data-close aria-label="Close case study">✕</button>
        </header>
        <div class="case-study__tabs" role="tablist" aria-label="Sections">${tabs}</div>
        <section id="cs-panel" class="case-study__body" role="tabpanel" aria-labelledby="cs-tab-${this.tab}">
          ${section.paragraphs.map((t) => `<p>${escapeHtml(t)}</p>`).join('')}
          ${bullets}
        </section>
        <footer class="case-study__footer">
          <p class="case-study__role"><strong>Role:</strong> ${escapeHtml(p.role)}</p>
          <ul class="case-study__stack" aria-label="Stack">${p.stack.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
          ${links}
          <p class="case-study__hint" aria-hidden="true">← → sections · Esc close</p>
        </footer>
      </div>`;
  }
}
