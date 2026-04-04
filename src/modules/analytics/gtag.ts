import { type AnalyticsParams } from './types'

// Declare window.gtag as the single authoritative access point for the global.
// No other module in the project should reference window.gtag directly.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Returns true if the gtag global is available and callable.
 *
 * Codestyle: typeof-check-for-optional-browser-globals
 * Uses `typeof` — never try/catch — for optional browser global detection.
 */
export function isGtagAvailable(): boolean {
  return typeof window.gtag === 'function'
}

/**
 * Fires a gtag analytics event.
 * Returns false if gtag is not available (e.g. blocked by ad-blocker, SSR).
 * Returns true after successfully dispatching the event.
 *
 * Always merges `transport_type: 'beacon'` as the default transport.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}): boolean {
  if (!isGtagAvailable()) return false

  window.gtag!('event', name, { transport_type: 'beacon', ...params })

  return true
}
