import { type StoreRating } from '../modules/store/store-ratings'

/**
 * Controls the store-rating DOM block.
 * Pure UI — no store detection, no URL building, no business logic.
 *
 * Expected DOM structure (data attributes are the stable contract):
 *   <div data-rating-display aria-label="...">
 *     <span data-rating-stars aria-hidden="true">★★★★★</span>
 *     <span data-rating-score>4.8 · App Store</span>
 *     ...
 *   </div>
 */
export class RatingDisplay {
  private constructor(
    private readonly root: HTMLElement,
    private readonly starsEl: HTMLElement,
    private readonly scoreEl: HTMLElement,
  ) {}

  update(rating: StoreRating): void {
    this.starsEl.textContent = '★'.repeat(rating.stars)
    this.scoreEl.textContent = `${rating.score} · ${rating.storeLabel}`
    this.root.setAttribute('aria-label', `${rating.storeLabel} rating`)
  }

  /**
   * Queries the DOM for the required elements and returns a RatingDisplay
   * instance, or null if the markup is absent (e.g. in jsdom tests).
   */
  static create(): RatingDisplay | null {
    const root = document.querySelector<HTMLElement>('[data-rating-display]')
    if (!root) return null

    const starsEl = root.querySelector<HTMLElement>('[data-rating-stars]')
    const scoreEl = root.querySelector<HTMLElement>('[data-rating-score]')
    if (!starsEl || !scoreEl) return null

    return new RatingDisplay(root, starsEl, scoreEl)
  }
}
