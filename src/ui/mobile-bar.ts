import { type StoreType, type StoreUrls } from '../modules/store/types'

export interface MobileBarUpdateConfig {
  primaryStore: StoreType
  urls: StoreUrls
  getLabel: (key: string) => string
}

/**
 * Controls the sticky mobile store bar DOM.
 * Pure UI — no routing, no URL building, no business logic.
 */
export class MobileBar {
  private disabled = false

  constructor(
    private readonly bar: HTMLElement,
    private readonly primary: HTMLAnchorElement,
    private readonly secondary: HTMLAnchorElement,
  ) {
    // Disable if any required element is missing (e.g. when running in jsdom)
    if (!bar || !primary || !secondary) {
      this.disabled = true
    }
  }

  update(config: MobileBarUpdateConfig): void {
    // codestyle: early-return-null-guard
    if (this.disabled) return

    const { primaryStore, urls, getLabel } = config

    const normalizedPrimary: StoreType = primaryStore === 'google-play' ? 'google-play' : 'app-store'
    const secondaryStore: StoreType = normalizedPrimary === 'google-play' ? 'app-store' : 'google-play'
    const primaryHref = normalizedPrimary === 'google-play' ? urls.googlePlayUrl : urls.appStoreUrl
    const secondaryHref = secondaryStore === 'google-play' ? urls.googlePlayUrl : urls.appStoreUrl
    const secondaryLabelKey =
      secondaryStore === 'google-play'
        ? 'landing.store.googlePlay.title'
        : 'landing.store.appStore.title'

    this.primary.dataset.store = normalizedPrimary
    this.primary.setAttribute('href', primaryHref)

    // Update only the label text — never set textContent on the anchor itself,
    // to preserve icon and sub-text DOM structure.
    const primaryLabel = this.primary.querySelector('.msb-label')
    if (primaryLabel) {
      primaryLabel.textContent = getLabel('landing.mobileCta.primary')
    }

    this.secondary.dataset.store = secondaryStore
    this.secondary.setAttribute('href', secondaryHref)

    // Update only the label text — never set textContent on the anchor itself.
    const secondaryLabel = this.secondary.querySelector('.msb-label')
    if (secondaryLabel) {
      secondaryLabel.textContent = getLabel(secondaryLabelKey)
    }
  }

  setVisible(visible: boolean): void {
    // codestyle: early-return-null-guard
    if (this.disabled) return
    this.bar.classList.toggle('is-visible', visible)
  }

  /**
   * Queries the DOM for the required elements and returns a MobileBar instance,
   * or null if any element is missing.
   */
  static create(): MobileBar | null {
    const bar = document.getElementById('mobileStoreBar')
    const primary = document.getElementById('mobileStorePrimary')
    const secondary = document.getElementById('mobileStoreSecondary')

    if (!bar || !primary || !secondary) return null

    return new MobileBar(
      bar,
      primary as HTMLAnchorElement,
      secondary as HTMLAnchorElement,
    )
  }
}
