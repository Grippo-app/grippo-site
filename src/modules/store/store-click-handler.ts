import { type StoreType, STORE_EVENT_NAMES } from './types'

export interface StoreClickContext {
  link: HTMLAnchorElement
  locale: string
  manualPreferred: StoreType | null
  onPreferenceChange: (store: StoreType) => void
}

// ---------------------------------------------------------------------------
// Internal helpers (mirrors of script.js methods)
// ---------------------------------------------------------------------------

function inferStoreTypeFromHref(href: string): StoreType | null {
  if (!href) return null
  const normalized = String(href).toLowerCase()
  if (normalized.includes('play.google.com')) return 'google-play'
  if (normalized.includes('apps.apple.com')) return 'app-store'
  return null
}

function resolveStoreType(link: HTMLAnchorElement, manualPreferred: StoreType | null): StoreType | null {
  const declaredStore = (link as HTMLAnchorElement & { dataset: DOMStringMap }).dataset.store

  if (declaredStore === 'app-store' || declaredStore === 'google-play') {
    return declaredStore
  }

  const hrefStore = inferStoreTypeFromHref(link.href)
  if (hrefStore) return hrefStore

  if (declaredStore === 'auto') {
    return manualPreferred ?? 'app-store'
  }

  return null
}

function getStoreEventName(storeType: StoreType): string | null {
  return STORE_EVENT_NAMES[storeType] ?? null
}

function isModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

function getStoreClickSource(link: HTMLAnchorElement): string {
  if (link.classList.contains('mobile-store-primary') || link.classList.contains('mobile-store-secondary')) {
    return 'sticky'
  }
  if (link.classList.contains('cta-primary')) return 'cta'
  if (link.classList.contains('store-button')) return 'hero'
  return 'unknown'
}

type WindowWithGtag = Window & typeof globalThis & { gtag?: (...args: unknown[]) => void }

function trackEvent(
  eventName: string,
  params: Record<string, unknown>,
): boolean {
  const win = window as WindowWithGtag
  if (typeof win.gtag !== 'function') {
    return false
  }
  win.gtag('event', eventName, {
    transport_type: 'beacon',
    ...params,
  })
  return true
}

// ---------------------------------------------------------------------------
// Public handler — CRITICAL: operation order must not change
// ---------------------------------------------------------------------------

/**
 * Handles a click on a store link.
 *
 * Operation order (must not be changed):
 *  1. resolveStoreType(link) → no storeType → return
 *  2. Capture href = link.href BEFORE calling onPreferenceChange
 *  3. ctx.onPreferenceChange(storeType) — updates preference and links
 *  4. If target="_blank" or modifier-click → trackEvent and return (no preventDefault)
 *  5. event.preventDefault()
 *  6. If no gtag → location.assign(href) and return
 *  7. didNavigate = false guard + setTimeout(navigate, 300) fallback
 *  8. trackEvent with event_callback: () => { clearTimeout; navigate() }
 */
export function handleStoreClick(event: MouseEvent, ctx: StoreClickContext): void {
  const { link, locale, manualPreferred, onPreferenceChange } = ctx

  // Step 1: resolve store type — bail out if unknown
  const storeType = resolveStoreType(link, manualPreferred)
  const eventName = storeType ? getStoreEventName(storeType) : null

  if (!storeType || !eventName) {
    return
  }

  // Step 2: capture href BEFORE onPreferenceChange updates it
  const href = link.href
  const target = (link.getAttribute('target') ?? '').toLowerCase()
  const eventParams: Record<string, unknown> = {
    store: storeType,
    source: getStoreClickSource(link),
    locale,
    link_url: href,
  }

  // Step 3: notify caller to update preference and re-render links
  onPreferenceChange(storeType)

  // Step 4: modifier click or new-tab link — track and let browser handle
  if (target === '_blank' || isModifiedClick(event)) {
    trackEvent(eventName, eventParams)
    return
  }

  // Step 5: prevent default navigation so we can do tracked redirect
  event.preventDefault()

  // Step 6: no analytics available — navigate immediately
  if (typeof (window as WindowWithGtag).gtag !== 'function') {
    window.location.assign(href)
    return
  }

  // Step 7: didNavigate guard + 300ms fallback timeout
  let didNavigate = false
  const navigate = (): void => {
    if (didNavigate) return
    didNavigate = true
    window.location.assign(href)
  }

  const fallbackTimeout = window.setTimeout(navigate, 300)

  // Step 8: fire tracked event; callback clears timeout and navigates
  trackEvent(eventName, {
    ...eventParams,
    event_callback: () => {
      window.clearTimeout(fallbackTimeout)
      navigate()
    },
  })
}
