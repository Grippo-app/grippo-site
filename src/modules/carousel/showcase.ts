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

/** Keeps the current screen visible until the requested image is decoded. */
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
  private transitionTimer: number | null = null
  private locale: string | null = null

  private _animating = false
  private _autoplay = false
  private _requestVersion = 0
  private _pendingIndex: number | null = null
  private _queuedSlide: { index: number; direction: 1 | -1 } | null = null

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
    if (this.locale === locale && this.slides.length > 0) return

    this.locale = locale
    this._requestVersion++
    this._clearTimer()
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer)
    this.transitionTimer = null
    this._animating = false
    this._pendingIndex = null
    this._queuedSlide = null
    for (const [slot, image] of [this.primary, this.secondary].entries()) {
      image.onload = null
      image.onerror = null
      image.style.transition = 'none'
      image.style.transform = ''
      image.style.opacity = ''
      image.classList.toggle('is-active', slot === this.activeSlot)
      void image.offsetWidth
      image.style.transition = ''
    }

    this.slides = getSlidesForLocale(locale)
    if (this.slides.length === 0) return

    this.index = Math.min(this.index, this.slides.length - 1)
    this._renderDots(this.slides.length)
    this._transitionTo(this.index, 1)
  }

  start(): void {
    // Product exploration is manual so visitors can read each real screen.
    if (this.stage.dataset.autoplay === 'false') return
    if (!this.primary || !this.secondary || this.slides.length <= 1) {
      this._renderFrame()
      return
    }

    this._autoplay = true
    this._clearTimer()
    this._renderFrame()
    if (!this._animating && this._pendingIndex === null) this._scheduleNext()
  }

  stop(): void {
    this._autoplay = false
    this._clearTimer()
  }

  /** Advance from the latest requested screen, including rapid repeated clicks. */
  advance(direction: 1 | -1): void {
    if (this.slides.length <= 1) return
    const normalizedDir: 1 | -1 = direction >= 0 ? 1 : -1
    const currentIndex = this._queuedSlide?.index ?? this._pendingIndex ?? this.index
    const nextIndex = (currentIndex + normalizedDir + this.slides.length) % this.slides.length
    this._transitionTo(nextIndex, normalizedDir)
  }

  /** Jump directly to a screen; the latest selection replaces pending work. */
  goTo(nextIndex: number): void {
    if (
      !Number.isInteger(nextIndex) ||
      nextIndex < 0 ||
      nextIndex >= this.slides.length
    ) {
      return
    }

    if (nextIndex === this.index) {
      this._queuedSlide = null
      if (this._pendingIndex !== null && this._pendingIndex !== nextIndex) {
        this._requestVersion++
        this._pendingIndex = null
        this.stage.setAttribute('aria-busy', 'false')
        if (this._autoplay) this._scheduleNext()
      }
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

  private _transitionTo(nextIndex: number, direction: 1 | -1): void {
    if (this._animating) {
      this._queuedSlide = { index: nextIndex, direction }
      return
    }

    const requestVersion = ++this._requestVersion
    this._pendingIndex = nextIndex
    this._clearTimer()
    this.stage.setAttribute('aria-busy', 'true')

    const hiddenSlot = this.activeSlot === 0 ? 1 : 0
    const hiddenEl = hiddenSlot === 0 ? this.primary : this.secondary
    const visibleEl = hiddenSlot === 0 ? this.secondary : this.primary
    const nextSlide = this.slides[nextIndex]

    this._setImageWithFallback(hiddenEl, nextSlide.candidates, requestVersion, () => {
      this._pendingIndex = null
      this._animating = true
      hiddenEl.alt = this.getAlt(`showcase.alt.${nextSlide.key}`)
      this._animateTo(nextIndex, direction, hiddenSlot, hiddenEl, visibleEl)
    }, () => {
      this._pendingIndex = null
      this.stage.setAttribute('aria-busy', 'false')
      if (this._autoplay) this._scheduleNext()
    })
  }

  private _animateTo(
    nextIndex: number,
    direction: 1 | -1,
    hiddenSlot: number,
    hiddenEl: HTMLImageElement,
    visibleEl: HTMLImageElement,
  ): void {
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
    this.transitionTimer = window.setTimeout(() => {
      this.transitionTimer = null
      visibleEl.style.transition = 'none'
      visibleEl.style.transform = ''
      visibleEl.style.opacity = ''
      void visibleEl.offsetWidth
      visibleEl.style.transition = ''

      this._animating = false
      this.stage.setAttribute('aria-busy', 'false')
      const queuedSlide = this._queuedSlide
      this._queuedSlide = null
      if (queuedSlide && queuedSlide.index !== this.index) {
        this._transitionTo(queuedSlide.index, queuedSlide.direction)
      } else if (this._autoplay && this.timer === null) {
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
    this.primary.setAttribute('aria-hidden', String(this.activeSlot !== 0))
    this.secondary.setAttribute('aria-hidden', String(this.activeSlot !== 1))
    this.stage.closest('.app-explorer')?.querySelectorAll<HTMLElement>('[data-explorer-description]').forEach((description) => {
      description.hidden = description.dataset.explorerDescription !== this.slides[this.index]?.key
    })
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.index)
      dot.setAttribute('aria-current', i === this.index ? 'true' : 'false')
    })
  }

  private _renderDots(count: number): void {
    this.dotsContainer.innerHTML = ''
    this.dots = []

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button')
      dot.type = 'button'
      dot.className = 'phone-dot'
      dot.textContent = this.getAlt(`landing.explorer.${this.slides[i].key}`)
      dot.dataset.slide = this.slides[i].key
      dot.addEventListener('click', () => this.goTo(i))
      this.dotsContainer.appendChild(dot)
      this.dots.push(dot)
    }

    this._renderFrame()
  }

  private _setImageWithFallback(
    imageElement: HTMLImageElement,
    candidates: string[],
    requestVersion: number,
    onResolved: () => void,
    onFailed: () => void,
  ): void {
    let idx = 0
    let resolved = false
    const tryNext = (): void => {
      if (requestVersion !== this._requestVersion || resolved) return
      if (idx >= candidates.length) {
        imageElement.onload = null
        imageElement.onerror = null
        onFailed()
        return
      }
      imageElement.src = candidates[idx++]
    }

    imageElement.onerror = tryNext
    imageElement.onload = async () => {
      const source = imageElement.src
      try {
        if (typeof imageElement.decode === 'function') await imageElement.decode()
      } catch {
        if (requestVersion === this._requestVersion && imageElement.src === source) tryNext()
        return
      }
      if (requestVersion !== this._requestVersion || imageElement.src !== source || resolved) return
      resolved = true
      imageElement.onload = null
      imageElement.onerror = null
      onResolved()
    }

    // A requested screen must load even if the stage is outside the lazy-load margin.
    imageElement.loading = 'eager'
    tryNext()
  }
}
