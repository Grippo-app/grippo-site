import {
  type ShowcaseSlide,
  SHOWCASE_SLIDE_KEYS,
  SHOWCASE_IMAGE_CANDIDATES,
  FALLBACK_SHOWCASE_IMAGES,
} from './types'

// ---------------------------------------------------------------------------
// Pure function — independently testable
// ---------------------------------------------------------------------------

/**
 * Builds the ordered list of slides for a given locale.
 * Candidate order: localized paths → en fallback paths → FALLBACK_SHOWCASE_IMAGES.
 * Duplicates are removed with Set. Slides with zero candidates are omitted.
 */
export function getSlidesForLocale(locale: string): ShowcaseSlide[] {
  const DEFAULT_LOCALE = 'en'
  const localized = SHOWCASE_IMAGE_CANDIDATES[locale] ?? SHOWCASE_IMAGE_CANDIDATES[DEFAULT_LOCALE] ?? {}
  const defaultLocalized = SHOWCASE_IMAGE_CANDIDATES[DEFAULT_LOCALE] ?? {}

  return SHOWCASE_SLIDE_KEYS
    .map((key, index) => {
      const fallbackImage = FALLBACK_SHOWCASE_IMAGES[index % FALLBACK_SHOWCASE_IMAGES.length]
      const candidates = [
        ...(localized[key] ?? []),
        ...(defaultLocalized[key] ?? []),
        fallbackImage,
        ...FALLBACK_SHOWCASE_IMAGES,
      ].filter(Boolean)

      return {
        key,
        candidates: [...new Set(candidates)],
      }
    })
    .filter((slide) => slide.candidates.length > 0)
}

// ---------------------------------------------------------------------------
// ShowcaseCarousel
// ---------------------------------------------------------------------------

interface ShowcaseCarouselOptions {
  primary: HTMLImageElement
  secondary: HTMLImageElement
  stage: HTMLElement
  prevBtn: HTMLElement
  nextBtn: HTMLElement
  dotsContainer: HTMLElement
  /** Injected i18n lookup — keeps carousel decoupled from any i18n service */
  getAlt: (key: string) => string
}

/**
 * Autonomous carousel — no race conditions between autoplay and user input.
 *
 * Architecture decisions:
 *
 * 1. Single private `_transitionTo()` method owns all animation logic.
 *    Both `advance()` and `goTo()` delegate to it, eliminating duplication
 *    and ensuring the lock is always applied uniformly.
 *
 * 2. `_animating` boolean lock.
 *    Any call to `_transitionTo()` while a transition is in progress is
 *    silently dropped. This prevents the race condition where the autoplay
 *    timer and a user click both trigger an advance in the same frame.
 *
 * 3. `setTimeout` chain instead of `setInterval`.
 *    `setInterval` can have a callback already queued when `clearInterval`
 *    is called, causing a spurious advance after the timer was supposed to
 *    stop. A `setTimeout` chain schedules the *next* step only after the
 *    current animation fully completes, making the timing deterministic.
 *
 * 4. Separate `_autoplay` flag.
 *    `stop()` sets `_autoplay = false`. Transition cleanup checks this flag
 *    before re-arming the timer, so an externally-stopped carousel stays
 *    stopped even if cleanup runs after `stop()` was called.
 *
 * 5. `goTo()` uses shortest-path direction and a single `_transitionTo()`.
 *    The old while-loop called `advance()` multiple times synchronously,
 *    stacking conflicting async cleanup timeouts. Now a dot click always
 *    triggers exactly one animation to the target slide.
 */
export class ShowcaseCarousel {
  private readonly primary: HTMLImageElement
  private readonly secondary: HTMLImageElement
  private readonly stage: HTMLElement
  private readonly prevBtn: HTMLElement
  private readonly nextBtn: HTMLElement
  private readonly dotsContainer: HTMLElement
  private readonly getAlt: (key: string) => string

  private slides: ShowcaseSlide[] = []
  private index = 0
  private activeSlot = 0            // 0 = primary is visible, 1 = secondary is visible
  private dots: HTMLElement[] = []
  private timer: number | null = null

  // --- Concurrency state ---
  private _animating = false        // true while a CSS transition is in flight
  private _autoplay = false         // true while autoplay is active

  private static readonly TRANSITION_MS = 550   // must match CSS transition duration
  private static readonly AUTO_ADVANCE_MS = 3800

  constructor(options: ShowcaseCarouselOptions) {
    this.primary = options.primary
    this.secondary = options.secondary
    this.stage = options.stage
    this.prevBtn = options.prevBtn
    this.nextBtn = options.nextBtn
    this.dotsContainer = options.dotsContainer
    this.getAlt = options.getAlt

    this.prevBtn.addEventListener('click', () => this.advance(-1))
    this.nextBtn.addEventListener('click', () => this.advance(1))
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  init(locale: string): void {
    this.slides = getSlidesForLocale(locale)
    if (this.slides.length === 0) return

    this.index = 0
    this.activeSlot = 0
    this._renderDots(this.slides.length)

    const firstSlide = this.slides[0]
    this._setImageWithFallback(this.primary, firstSlide.candidates)
    this.primary.alt = this.getAlt(`showcase.alt.${firstSlide.key}`)
    this.primary.classList.add('is-active')
    this.secondary.classList.remove('is-active')

    const secondSlide = this.slides[1] ?? firstSlide
    this._setImageWithFallback(this.secondary, secondSlide.candidates)
    this.secondary.alt = this.getAlt(`showcase.alt.${secondSlide.key}`)
  }

  start(): void {
    if (!this.primary || !this.secondary || this.slides.length <= 1) {
      this._renderFrame()
      return
    }

    this._autoplay = true
    this._clearTimer()
    this._renderFrame()
    this._scheduleNext()
  }

  stop(): void {
    this._autoplay = false
    this._clearTimer()
  }

  /**
   * Advance one step in the given direction.
   * Dropped silently if an animation is already in progress.
   */
  advance(direction: 1 | -1): void {
    if (this.slides.length <= 1) return
    const normalizedDir: 1 | -1 = direction >= 0 ? 1 : -1
    const nextIndex = (this.index + normalizedDir + this.slides.length) % this.slides.length
    this._transitionTo(nextIndex, normalizedDir)
  }

  /**
   * Jump directly to a specific slide index using the shortest visual path.
   * Dropped silently if an animation is already in progress.
   */
  goTo(nextIndex: number): void {
    if (
      !Number.isInteger(nextIndex) ||
      nextIndex < 0 ||
      nextIndex >= this.slides.length ||
      nextIndex === this.index
    ) {
      return
    }

    // Choose the shortest direction around the loop
    const fwd = (nextIndex - this.index + this.slides.length) % this.slides.length
    const bwd = (this.index - nextIndex + this.slides.length) % this.slides.length
    const dir: 1 | -1 = fwd <= bwd ? 1 : -1

    this._transitionTo(nextIndex, dir)
  }

  // -------------------------------------------------------------------------
  // Private: core transition (single authoritative animation method)
  // -------------------------------------------------------------------------

  /**
   * Runs the cross-fade/slide animation from the current slide to `nextIndex`.
   *
   * Guard: returns immediately if `_animating` is true.
   * This is the only place that sets `_animating`, clears the timer, and
   * re-arms autoplay — ensuring the lock and scheduling are always consistent.
   */
  private _transitionTo(nextIndex: number, direction: 1 | -1): void {
    if (this._animating) return   // ← single lock point; drops concurrent calls

    this._animating = true
    this._clearTimer()            // suspend autoplay during the transition

    const hiddenSlot = this.activeSlot === 0 ? 1 : 0
    const hiddenEl = hiddenSlot === 0 ? this.primary : this.secondary
    const visibleEl = hiddenSlot === 0 ? this.secondary : this.primary
    const nextSlide = this.slides[nextIndex]

    this._setImageWithFallback(hiddenEl, nextSlide.candidates)
    hiddenEl.alt = this.getAlt(`showcase.alt.${nextSlide.key}`)

    // ⚠️ Forced reflow pattern — must not be changed.
    // Reset the incoming slide to its off-screen start position without
    // animating (transition: none), then restore the transition so the
    // browser animates from there to the final position.
    hiddenEl.style.transition = 'none'
    hiddenEl.style.transform = `translateX(${direction * 10}%)`
    hiddenEl.style.opacity = '0'
    void hiddenEl.offsetWidth        // forced reflow
    hiddenEl.style.transition = ''
    hiddenEl.style.transform = ''
    hiddenEl.style.opacity = ''

    // Animate the outgoing slide off-screen in the opposite direction
    visibleEl.style.transform = `translateX(${-direction * 10}%)`
    visibleEl.style.opacity = '0'

    visibleEl.classList.remove('is-active')
    hiddenEl.classList.add('is-active')

    this.activeSlot = hiddenSlot
    this.index = nextIndex
    this._renderFrame()

    // Cleanup runs after the CSS transition completes.
    // `_animating` is released here — not before — so no new transition
    // can start until the outgoing slide's inline styles are fully reset.
    window.setTimeout(() => {
      visibleEl.style.transition = 'none'
      visibleEl.style.transform = ''
      visibleEl.style.opacity = ''
      void visibleEl.offsetWidth
      visibleEl.style.transition = ''

      this._animating = false   // ← release lock after full cleanup

      // Re-arm autoplay only when:
      //   a) autoplay is active, AND
      //   b) no timer is already pending (start() may have scheduled one
      //      if it was called externally while the transition was running)
      if (this._autoplay && this.timer === null) {
        this._scheduleNext()
      }
    }, ShowcaseCarousel.TRANSITION_MS + 50)
  }

  // -------------------------------------------------------------------------
  // Private: autoplay scheduling (setTimeout chain)
  // -------------------------------------------------------------------------

  /**
   * Schedules a single auto-advance step.
   * Called by `start()` and by transition cleanup when autoplay is active.
   *
   * Uses setTimeout (not setInterval) so the next step is only ever queued
   * after the current animation has fully completed. With setInterval, the
   * callback can already be in the microtask queue when clearInterval is
   * called, which was the source of the original race condition.
   */
  private _scheduleNext(): void {
    this.timer = window.setTimeout(() => {
      this.timer = null             // clear reference before stepping
      if (!this._autoplay) return   // respect stop() called during the wait
      const nextIndex = (this.index + 1) % this.slides.length
      this._transitionTo(nextIndex, 1)
    }, ShowcaseCarousel.AUTO_ADVANCE_MS)
  }

  private _clearTimer(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  // -------------------------------------------------------------------------
  // Private: rendering helpers
  // -------------------------------------------------------------------------

  private _renderFrame(): void {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.index)
      dot.setAttribute('aria-current', i === this.index ? 'true' : 'false')
    })
  }

  private _renderDots(count: number): void {
    this.dotsContainer.innerHTML = ''
    this.dots = []

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span')
      dot.className = 'phone-dot'
      dot.setAttribute('role', 'button')
      dot.setAttribute('tabindex', '0')
      dot.setAttribute('aria-label', `Go to screenshot ${i + 1}`)
      dot.addEventListener('click', () => this.goTo(i))
      dot.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.goTo(i)
        }
      })
      this.dotsContainer.appendChild(dot)
      this.dots.push(dot)
    }

    this._renderFrame()
  }

  private _setImageWithFallback(
    imageElement: HTMLImageElement,
    candidates: string[],
    onResolved?: (src: string) => void,
  ): void {
    if (!imageElement || candidates.length === 0) return

    let idx = 0
    const tryNext = (): void => {
      if (idx >= candidates.length) return
      imageElement.src = candidates[idx++]
    }

    imageElement.onerror = () => tryNext()
    imageElement.onload = () => {
      if (typeof onResolved === 'function') onResolved(imageElement.src)
    }

    tryNext()
  }
}
