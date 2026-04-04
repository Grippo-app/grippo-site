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
 * Autonomous carousel class.
 * Has no knowledge of i18n internals or the store module —
 * alt text is provided via the `getAlt` callback.
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

  constructor(options: ShowcaseCarouselOptions) {
    this.primary = options.primary
    this.secondary = options.secondary
    this.stage = options.stage
    this.prevBtn = options.prevBtn
    this.nextBtn = options.nextBtn
    this.dotsContainer = options.dotsContainer
    this.getAlt = options.getAlt

    this.prevBtn.addEventListener('click', () => this.advance(-1, true))
    this.nextBtn.addEventListener('click', () => this.advance(1, true))
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

    this.stop()
    this._renderFrame()

    this.timer = window.setInterval(() => {
      this.advance(1, false)
    }, 3800)
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Moves the carousel by one step in the given direction.
   * @param direction  1 = forward, -1 = backward
   * @param restartTimer  whether to restart the auto-advance timer
   */
  advance(direction: 1 | -1, restartTimer = false): void {
    if (this.slides.length <= 1) return

    const normalizedDirection: 1 | -1 = direction >= 0 ? 1 : -1
    const nextIndex =
      (this.index + normalizedDirection + this.slides.length) % this.slides.length

    const hiddenSlot = this.activeSlot === 0 ? 1 : 0
    const hiddenEl = hiddenSlot === 0 ? this.primary : this.secondary
    const visibleEl = hiddenSlot === 0 ? this.secondary : this.primary
    const nextSlide = this.slides[nextIndex]

    this._setImageWithFallback(hiddenEl, nextSlide.candidates)
    hiddenEl.alt = this.getAlt(`showcase.alt.${nextSlide.key}`)

    // ⚠️ Forced reflow pattern — must not be changed
    hiddenEl.style.transition = 'none'
    hiddenEl.style.transform = `translateX(${normalizedDirection * 10}%)`
    hiddenEl.style.opacity = '0'
    void hiddenEl.offsetWidth        // forced reflow
    hiddenEl.style.transition = ''
    hiddenEl.style.transform = ''
    hiddenEl.style.opacity = ''

    // Animate outgoing slide out in the opposite direction
    visibleEl.style.transform = `translateX(${-normalizedDirection * 10}%)`
    visibleEl.style.opacity = '0'

    visibleEl.classList.remove('is-active')
    hiddenEl.classList.add('is-active')

    this.activeSlot = hiddenSlot
    this.index = nextIndex
    this._renderFrame()

    // ⚠️ setTimeout cleanup — must not be removed (600ms cleanup for inline styles)
    setTimeout(() => {
      visibleEl.style.transition = 'none'
      visibleEl.style.transform = ''
      visibleEl.style.opacity = ''
      void visibleEl.offsetWidth
      visibleEl.style.transition = ''
    }, 600)

    if (restartTimer) {
      this.start()
    }
  }

  goTo(nextIndex: number): void {
    if (
      !Number.isInteger(nextIndex) ||
      nextIndex < 0 ||
      nextIndex >= this.slides.length ||
      nextIndex === this.index
    ) {
      return
    }

    const direction: 1 | -1 = nextIndex > this.index ? 1 : -1
    this.advance(direction, true)
    while (this.index !== nextIndex) {
      this.advance(direction, false)
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
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
