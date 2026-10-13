// On-screen controls for touch screens: a direction pad (bottom left) and an action button
// (bottom right), in HTML over the canvas. The pad reads the thumb's position against its centre,
// so sliding round it changes direction without lifting; it snaps to 8 directions like the keys.
// Shown on coarse pointers (phones, tablets), or as soon as anyone touches the screen.

/** Inside this fraction of the pad's radius the thumb counts as centred: no movement. */
const DEADZONE = 0.25;

export class TouchControls {
  /** Current direction, each -1, 0 or 1 (like the arrow keys). */
  dx = 0;
  dy = 0;
  /** Called when the action button is pressed. */
  onAction: (() => void) | null = null;

  private readonly root: HTMLElement;
  private readonly pad: HTMLElement;
  private readonly knob: HTMLElement;
  private padPointer: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    root.classList.add('touch-controls');
    root.innerHTML = `
      <div class="touch-pad" role="group" aria-label="Movement pad">
        <span class="touch-pad__arrow touch-pad__arrow--up" aria-hidden="true">▲</span>
        <span class="touch-pad__arrow touch-pad__arrow--down" aria-hidden="true">▼</span>
        <span class="touch-pad__arrow touch-pad__arrow--left" aria-hidden="true">◀</span>
        <span class="touch-pad__arrow touch-pad__arrow--right" aria-hidden="true">▶</span>
        <span class="touch-pad__knob" aria-hidden="true"></span>
      </div>
      <button type="button" class="touch-action" aria-label="Talk, read or open">A</button>`;
    this.pad = root.querySelector('.touch-pad')!;
    this.knob = root.querySelector('.touch-pad__knob')!;

    this.pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.padPointer = e.pointerId;
      this.pad.setPointerCapture(e.pointerId);
      this.steer(e);
    });
    this.pad.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.padPointer) this.steer(e);
    });
    const release = (e: PointerEvent) => {
      if (e.pointerId !== this.padPointer) return;
      this.padPointer = null;
      this.set(0, 0);
    };
    this.pad.addEventListener('pointerup', release);
    this.pad.addEventListener('pointercancel', release);

    const action = root.querySelector<HTMLButtonElement>('.touch-action')!;
    action.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // no focus ring, no double-fire with click
      this.onAction?.();
    });
    // Keyboard or switch users who reach the button still get the action, once.
    action.addEventListener('click', (e) => {
      if (e.detail === 0) this.onAction?.();
    });
    root.addEventListener('contextmenu', (e) => e.preventDefault());

    const coarse = matchMedia('(pointer: coarse)');
    this.setVisible(coarse.matches);
    coarse.addEventListener('change', () => this.setVisible(coarse.matches));
    window.addEventListener('touchstart', () => this.setVisible(true), { once: true, passive: true });
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
    document.body.classList.toggle('has-touch-controls', visible);
    if (!visible) this.set(0, 0);
  }

  private steer(e: PointerEvent): void {
    const r = this.pad.getBoundingClientRect();
    const vx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const vy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    if (Math.hypot(vx, vy) < DEADZONE) return this.set(0, 0);
    // Snap to the nearest of 8 directions (45° sectors).
    const sector = Math.round(Math.atan2(vy, vx) / (Math.PI / 4));
    const angle = sector * (Math.PI / 4);
    this.set(Math.round(Math.cos(angle)), Math.round(Math.sin(angle)));
  }

  private set(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
    this.knob.style.transform = `translate(${dx * 28}%, ${dy * 28}%)`;
    this.pad.dataset.active = String(dx !== 0 || dy !== 0);
  }
}
