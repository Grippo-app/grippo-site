/**
 * Scroll-reveal animation for landing page elements.
 * No dependencies on ViewMode or other project modules.
 */
export class RevealObserver {
  private observer: IntersectionObserver | null = null

  constructor(private readonly targets: HTMLElement[]) {}

  setup(): void {
    // codestyle: early-return-null-guard
    if (this.targets.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.targets.forEach((target, index) => {
      target.classList.add('reveal-item')

      // Only set --reveal-delay if it hasn't already been declared via the
      // style attribute in HTML (e.g. style="--reveal-delay:0ms" on bento cards).
      if (!target.getAttribute('style')?.includes('--reveal-delay')) {
        target.style.setProperty('--reveal-delay', `${Math.min(index * 60, 360)}ms`)
      }

      if (reduceMotion) {
        target.classList.add('is-visible')
      }
    })

    if (reduceMotion) return

    // Disconnect any previously created observer before creating a new one
    if (this.observer) {
      this.observer.disconnect()
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          this.observer?.unobserve(entry.target)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    this.targets.forEach((target) => this.observer!.observe(target))
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
