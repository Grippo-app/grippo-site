import { type StoreType, PREFERRED_STORE_KEY } from './types'

/**
 * Returns a known store preference in priority order:
 *   1. manualPreferred argument (explicit user choice passed from caller)
 *   2. Stored preference from localStorage (readStored)
 *   3. UA sniffing (Android → google-play, iPhone/iPad → app-store)
 * Returns null when the device and visitor preference are unknown.
 */
export function detectKnownPreferred(manualPreferred: StoreType | null): StoreType | null {
  if (manualPreferred) {
    return manualPreferred
  }

  const remembered = readStored()
  if (remembered) {
    return remembered
  }

  const ua = (navigator.userAgent || '').toLowerCase()
  const platform = (navigator.platform || '').toLowerCase()
  const hasTouch = navigator.maxTouchPoints > 1

  const isAndroid = ua.includes('android')
  const isIphone = ua.includes('iphone') || ua.includes('ipod')
  const isIpad = ua.includes('ipad') || (platform.includes('mac') && hasTouch)

  if (isAndroid) {
    return 'google-play'
  }

  if (isIphone || isIpad) {
    return 'app-store'
  }

  return null
}

/** Supplies a default for controls that always need one primary store. */
export function detectPreferred(manualPreferred: StoreType | null): StoreType {
  return detectKnownPreferred(manualPreferred) ?? 'app-store'
}

/**
 * Reads the stored store preference from localStorage.
 * Returns null on errors (private browsing, permissions) or invalid values.
 */
export function readStored(): StoreType | null {
  try {
    const value = window.localStorage.getItem(PREFERRED_STORE_KEY)
    if (value === 'app-store' || value === 'google-play') {
      return value
    }
  } catch {
    // Ignore storage access issues in private browsing or restricted environments.
  }

  return null
}

/**
 * Persists the store preference to localStorage.
 * Silently swallows errors (private browsing, permissions, quota exceeded).
 */
export function writeStored(store: StoreType): void {
  try {
    window.localStorage.setItem(PREFERRED_STORE_KEY, store)
  } catch {
    // Ignore storage access issues in private browsing or restricted environments.
  }
}
