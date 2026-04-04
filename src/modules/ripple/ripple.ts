/**
 * RippleEffect — click/touch ripple feedback for interactive elements.
 *
 * Architecture:
 * - Attaches a single `pointerdown` listener per element (fires before `click`,
 *   so there is no 300ms touch delay regardless of viewport meta settings).
 * - Injects a `<span class="ripple-wave">` absolutely-positioned at the pointer
 *   origin inside the target element.
 * - The span's entire lifecycle is CSS-driven via `@keyframes rippleExpand`.
 * - Removes itself on `animationend` (no timers → no leaks).
 * - Skips animation when `prefers-reduced-motion: reduce` is active.
 * - Works with both mouse and touch/stylus (PointerEvent API).
 */

const RIPPLE_CLASS = 'ripple-wave'

interface BoundEntry {
  el: HTMLElement
  handler: (event: PointerEvent) => void
}

export class RippleEffect {
  private readonly prefersReducedMotion: MediaQueryList
  private readonly bound: BoundEntry[] = []

  constructor(private readonly targets: readonly HTMLElement[]) {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  }

  /** Attach listeners to all target elements. Call once after DOM is ready. */
  setup(): void {
    for (const el of this.targets) {
      const handler = (event: PointerEvent) => this._fire(event, el)
      this.bound.push({ el, handler })
      el.addEventListener('pointerdown', handler)
    }
  }

  /** Remove all listeners. Safe to call multiple times. */
  destroy(): void {
    for (const { el, handler } of this.bound) {
      el.removeEventListener('pointerdown', handler)
    }
    this.bound.length = 0
  }

  private _fire(event: PointerEvent, el: HTMLElement): void {
    // Respect system motion preference
    if (this.prefersReducedMotion.matches) return
    // Only primary pointer (left mouse button or first touch point)
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const rect = el.getBoundingClientRect()

    // Diameter large enough to reach every corner from any click position
    const diameter = Math.max(rect.width, rect.height) * 2
    const radius = diameter / 2

    const wave = document.createElement('span')
    wave.className = RIPPLE_CLASS
    wave.style.cssText =
      `width:${diameter}px;` +
      `height:${diameter}px;` +
      `left:${event.clientX - rect.left - radius}px;` +
      `top:${event.clientY - rect.top - radius}px`

    el.appendChild(wave)

    // Self-cleanup: remove element exactly when CSS animation ends (no timers)
    wave.addEventListener('animationend', () => wave.remove(), { once: true })
  }
}
