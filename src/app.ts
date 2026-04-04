import { type TranslationKey, type Locale, I18nService, DEFAULT_LOCALE } from './i18n/index'
import { type ViewMode, type TabId, TAB_PARAM } from './modules/router/types'
import { type StoreType } from './modules/store/types'
import { ShowcaseCarousel } from './modules/carousel/showcase'
import { KpiObserver } from './modules/kpi/counter'
import { RevealObserver } from './modules/reveal/reveal-observer'
import { resolveFromParams, resolveFromLanguages } from './modules/locale/locale-resolver'
import {
  resolveViewMode,
  resolveTabFromLocation,
  buildTabUrl,
  buildLandingUrl,
} from './modules/router/router'
import { getStoreUrls, getAutoUrl } from './modules/store/store-links'
import { detectPreferred, writeStored } from './modules/store/store-detector'
import { handleStoreClick } from './modules/store/store-click-handler'
import { RippleEffect } from './modules/ripple/ripple'
import { MobileBar } from './ui/mobile-bar'
import { PolicyTabs } from './ui/tabs'

/**
 * App — thin orchestrator.
 * Creates modules, wires them together, handles window events.
 * Contains no business logic — delegates everything to modules.
 */
export class App {
  // Module instances
  private i18n!: I18nService
  private carousel: ShowcaseCarousel | null = null
  private kpiObserver!: KpiObserver
  private revealObserver!: RevealObserver
  private rippleEffect!: RippleEffect
  private mobileBar: MobileBar | null = null
  private tabs!: PolicyTabs

  // State
  private _locale!: Locale
  private _manualPreferred: StoreType | null = null
  private _currentMode: ViewMode = 'landing'
  private _kpiObserved = false
  private _scrollRafPending = false
  private _resizeRafPending = false

  // DOM refs
  private landingPage!: HTMLElement
  private policyPage!: HTMLElement
  private landingHero: HTMLElement | null = null

  // ---------------------------------------------------------------------------
  // Public entry point
  // ---------------------------------------------------------------------------

  init(): void {
    // Guard: cannot operate without both view containers
    const landingPage = document.getElementById('landingPage')
    const policyPage = document.getElementById('policyPage')
    if (!landingPage || !policyPage) return

    this.landingPage = landingPage
    this.policyPage = policyPage
    this.landingHero = document.querySelector('.landing-hero')

    // 1. Resolve locale
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.replace('#', '')
    const languages: readonly string[] = Array.isArray(navigator.languages)
      ? navigator.languages
      : []
    this._locale = resolveFromParams(params) ?? resolveFromLanguages(languages)

    // 2. Mark initial view on <html> so CSS can hide/show pages before JS runs
    document.documentElement.setAttribute('data-initial-view', resolveViewMode(params, hash))

    // 3. Create I18nService and translate DOM
    this.i18n = new I18nService(this._locale)
    this._applyI18n()

    // 4. Signal that translations are applied — CSS can fade in content
    document.body.classList.add('i18n-ready')

    // 5. Wire up modules ---------------------------------------------------

    // Reveal: scroll-in animations for sections
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    this.revealObserver = new RevealObserver(revealTargets)
    this.revealObserver.setup()

    // KPI counters
    const kpiEls = Array.from(document.querySelectorAll<HTMLElement>('[data-kpi-target]'))
    this.kpiObserver = new KpiObserver(kpiEls)

    // Showcase carousel
    const primary = document.getElementById('phoneShotPrimary') as HTMLImageElement | null
    const secondary = document.getElementById('phoneShotSecondary') as HTMLImageElement | null
    const stage = document.querySelector<HTMLElement>('.phone-stage')
    const prevBtn = document.getElementById('phonePrev')
    const nextBtn = document.getElementById('phoneNext')
    const dotsContainer = document.getElementById('phoneDots')
    if (primary && secondary && stage && prevBtn && nextBtn && dotsContainer) {
      this.carousel = new ShowcaseCarousel({
        primary,
        secondary,
        stage,
        prevBtn,
        nextBtn,
        dotsContainer,
        getAlt: (key) => this.i18n.getTranslation(key as TranslationKey),
      })
      // Restart autoplay when cursor leaves the stage (mirrors script.js behaviour)
      stage.addEventListener('mouseleave', () => this.carousel?.start())
    }

    // Policy tabs
    const tabButtons = Array.from(document.querySelectorAll<HTMLElement>('.tab-button'))
    const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-tab-panel]'))
    this.tabs = new PolicyTabs(tabButtons, panels)
    this.tabs.bindEvents((tabId) => {
      const url = buildTabUrl(
        new URL(window.location.href),
        tabId as TabId,
        this._locale,
        DEFAULT_LOCALE,
      )
      window.history.pushState({ tab: tabId }, '', url)
      this.tabs.setActive(tabId)
      this.tabs.ensureActiveVisible()
    })

    // Sticky mobile store bar
    this.mobileBar = MobileBar.create()

    // Ripple feedback — query every interactive button/link after all modules
    // have rendered their DOM so nothing is missed.
    const rippleTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.store-button, .cta-primary, .mobile-store-primary, .mobile-store-secondary, .phone-arrow, .topnav-back, .tab-button',
      ),
    )
    this.rippleEffect = new RippleEffect(rippleTargets)
    this.rippleEffect.setup()

    // 6. Window-level events
    this._bindWindowEvents()

    // 7. Store link click tracking & preference handling
    this._bindStoreLinks()

    // 8. Sync view to current URL
    this._syncFromLocation(false)

    // 9. Show/hide mobile bar based on initial scroll position
    this._updateMobileBarVisibility()
  }

  // ---------------------------------------------------------------------------
  // Private: view synchronisation
  // ---------------------------------------------------------------------------

  private _syncFromLocation(push: boolean): void {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.replace('#', '')

    // Re-resolve locale in case it changed (e.g. after popstate)
    const languages: readonly string[] = Array.isArray(navigator.languages)
      ? navigator.languages
      : []
    const newLocale = resolveFromParams(params) ?? resolveFromLanguages(languages)
    if (newLocale !== this._locale) {
      this._locale = newLocale
      this.i18n.setLocale(newLocale)
      this._applyI18n()
    }

    const mode = resolveViewMode(params, hash)
    this._setViewMode(mode)

    if (mode === 'policies') {
      const tabId = resolveTabFromLocation(params, hash)
      if (push) {
        const url = buildTabUrl(
          new URL(window.location.href),
          tabId,
          this._locale,
          DEFAULT_LOCALE,
        )
        window.history.pushState({ tab: tabId }, '', url)
      }
      this.tabs.setActive(tabId)
      this.tabs.ensureActiveVisible()
    }
  }

  private _setViewMode(mode: ViewMode): void {
    this._currentMode = mode
    const isLanding = mode === 'landing'

    this.landingPage.hidden = !isLanding
    this.policyPage.hidden = isLanding

    document.title = isLanding
      ? this.i18n.getTranslation('title.landing')
      : this.i18n.getTranslation('title.policies')

    if (isLanding) {
      // Re-initialise carousel with (possibly updated) locale each time landing is shown
      this.carousel?.init(this._locale)
      this.carousel?.start()
      // KPI animation fires only once — guard prevents re-observing
      if (!this._kpiObserved) {
        this._kpiObserved = true
        this.kpiObserver.observe()
      }
    } else {
      this.carousel?.stop()
    }

    this._updateMobileBarVisibility()

    // Reveal policy panels that have scroll-in animation pending
    window.requestAnimationFrame(() => this.tabs.ensureActiveVisible())
  }

  // ---------------------------------------------------------------------------
  // Private: i18n application
  // ---------------------------------------------------------------------------

  private _applyI18n(): void {
    // html[lang] — use ISO 639-1 'uk' for Ukrainian (locale id is 'ua')
    document.documentElement.lang = this._locale === 'ua' ? 'uk' : this._locale

    // Text content via data-i18n attribute
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n
      if (!key) return
      const value = this.i18n.getTranslation(key as TranslationKey)
      if (value) el.textContent = value
    })

    // Aria-label via data-i18n-aria-label attribute
    document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((el) => {
      const key = el.dataset.i18nAriaLabel
      if (!key) return
      const value = this.i18n.getTranslation(key as TranslationKey)
      if (value) el.setAttribute('aria-label', value)
    })

    // Tab navigation links — clean URL with ?tab=X and optional ?locale=
    const origin = window.location.origin
    const pathname = window.location.pathname
    document.querySelectorAll<HTMLAnchorElement>('[data-tab-link]').forEach((link) => {
      const tab = link.dataset.tabLink
      if (!tab) return
      const url = new URL(pathname, origin)
      url.searchParams.set(TAB_PARAM, tab)
      if (this._locale !== DEFAULT_LOCALE) url.searchParams.set('locale', this._locale)
      link.href = `${url.pathname}${url.search}`
    })

    // Landing links — go back to landing (cleans all routing params + hash)
    document.querySelectorAll<HTMLAnchorElement>('[data-landing-link]').forEach((link) => {
      const url = buildLandingUrl(new URL(pathname, origin), this._locale, DEFAULT_LOCALE)
      link.href = `${url.pathname}${url.search}`
    })

    this._updateStoreLinks()
  }

  // ---------------------------------------------------------------------------
  // Private: store links
  // ---------------------------------------------------------------------------

  private _updateStoreLinks(): void {
    const urls = getStoreUrls(this._locale)
    const preferred = detectPreferred(this._manualPreferred)

    document.querySelectorAll<HTMLAnchorElement>('[data-store]').forEach((link) => {
      const store = link.dataset.store
      if (store === 'app-store') {
        link.href = urls.appStoreUrl
      } else if (store === 'google-play') {
        link.href = urls.googlePlayUrl
      } else if (store === 'auto') {
        link.href = getAutoUrl(preferred, urls)
      }
    })

    this.mobileBar?.update({
      primaryStore: preferred,
      urls,
      getLabel: (key) => this.i18n.getTranslation(key as TranslationKey),
    })
  }

  // ---------------------------------------------------------------------------
  // Private: mobile bar visibility
  // ---------------------------------------------------------------------------

  private _updateMobileBarVisibility(): void {
    const isLanding = this._currentMode === 'landing'
    const isMobile = window.matchMedia('(max-width: 720px)').matches
    const heroBottom = this.landingHero?.getBoundingClientRect().bottom ?? 0
    const revealThreshold = Math.max(220, window.innerHeight * 0.72)
    const shouldShow = isLanding && isMobile && heroBottom < revealThreshold
    this.mobileBar?.setVisible(shouldShow)
  }

  // ---------------------------------------------------------------------------
  // Private: event binding
  // ---------------------------------------------------------------------------

  private _bindWindowEvents(): void {
    window.addEventListener('popstate', () => {
      this._syncFromLocation(false)
    })

    window.addEventListener('hashchange', () => {
      this._syncFromLocation(false)
    })

    // Throttle scroll updates to one rAF frame to avoid forced layout on every pixel
    window.addEventListener('scroll', () => {
      if (this._scrollRafPending) return
      this._scrollRafPending = true
      window.requestAnimationFrame(() => {
        this._scrollRafPending = false
        this._updateMobileBarVisibility()
      })
    }, { passive: true })

    // Throttle resize updates to batch rapid resize events
    window.addEventListener('resize', () => {
      if (this._resizeRafPending) return
      this._resizeRafPending = true
      window.requestAnimationFrame(() => {
        this._resizeRafPending = false
        this._updateMobileBarVisibility()
      })
    })
  }

  private _bindStoreLinks(): void {
    document.querySelectorAll<HTMLAnchorElement>('[data-store]').forEach((link) => {
      link.addEventListener('click', (event: MouseEvent) => {
        handleStoreClick(event, {
          link,
          locale: this._locale,
          manualPreferred: this._manualPreferred,
          onPreferenceChange: (store: StoreType) => {
            this._manualPreferred = store
            writeStored(store)
            this._updateStoreLinks()
            this._updateMobileBarVisibility()
          },
        })
      })
    })
  }
}
