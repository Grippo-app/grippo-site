/**
 * Animates a KPI counter element from 0 to its data-kpi-target value.
 *
 * Reads:
 *  - data-kpi-target  — numeric end value
 *  - data-kpi-suffix  — string appended after the number (e.g. '%', '+')
 *
 * Animation: cubic ease-out over 1100 ms via requestAnimationFrame.
 * No dependencies on ViewMode or any other project module.
 */
export function animateCounter(el: HTMLElement): void {
  // codestyle: early-return-null-guard
  if (!el) return

  const target = Number(el.dataset.kpiTarget ?? '0')
  const suffix = el.dataset.kpiSuffix ?? ''
  const duration = 1100
  const start = performance.now()

  const tick = (now: number): void => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)   // cubic ease-out
    el.textContent = `${Math.round(target * eased)}${suffix}`

    if (progress < 1) {
      window.requestAnimationFrame(tick)
    }
  }

  window.requestAnimationFrame(tick)
}

// ---------------------------------------------------------------------------

/**
 * Observes KPI counter elements and fires animateCounter once when the
 * nearest .kpi-grid ancestor scrolls into view (threshold: 0.35).
 * Disconnects immediately after triggering so the animation runs only once.
 */
export class KpiObserver {
  private readonly elements: HTMLElement[]
  private observer: IntersectionObserver | null = null

  constructor(elements: HTMLElement[]) {
    this.elements = elements
  }

  observe(): void {
    // codestyle: early-return-null-guard
    if (this.elements.length === 0) return

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.elements.forEach((el) => animateCounter(el))
          this.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    const target = this.elements[0].closest('.kpi-grid')
    if (target) {
      this.observer.observe(target)
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
