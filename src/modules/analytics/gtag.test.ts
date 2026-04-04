import { describe, it, expect, vi, afterEach } from 'vitest'
import { isGtagAvailable, trackEvent } from './gtag'

afterEach(() => {
  vi.restoreAllMocks()
  // Clean up any gtag stub set on window
  delete (window as Window & { gtag?: unknown }).gtag
})

// ---------------------------------------------------------------------------
// isGtagAvailable
// ---------------------------------------------------------------------------

describe('isGtagAvailable', () => {
  it('returns false when window.gtag is undefined', () => {
    expect(isGtagAvailable()).toBe(false)
  })

  it('returns false when window.gtag is not a function', () => {
    // Cast through unknown to bypass the declared type — intentional test-only hack
    ;(window as unknown as Record<string, unknown>).gtag = 'not-a-function'
    expect(isGtagAvailable()).toBe(false)
  })

  it('returns true when window.gtag is a function', () => {
    window.gtag = vi.fn()
    expect(isGtagAvailable()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// trackEvent
// ---------------------------------------------------------------------------

describe('trackEvent', () => {
  it("returns false when window.gtag is not defined", () => {
    expect(trackEvent('test')).toBe(false)
  })

  it('returns true when gtag is available', () => {
    window.gtag = vi.fn()
    expect(trackEvent('test')).toBe(true)
  })

  it('calls window.gtag with event name and merged params', () => {
    const gtagMock = vi.fn()
    window.gtag = gtagMock
    trackEvent('appstore_click', { store: 'app-store', locale: 'en' })
    expect(gtagMock).toHaveBeenCalledWith('event', 'appstore_click', {
      transport_type: 'beacon',
      store: 'app-store',
      locale: 'en',
    })
  })

  it('merges transport_type: beacon by default', () => {
    const gtagMock = vi.fn()
    window.gtag = gtagMock
    trackEvent('test_event')
    expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
      transport_type: 'beacon',
    })
  })

  it('allows caller to override transport_type', () => {
    const gtagMock = vi.fn()
    window.gtag = gtagMock
    trackEvent('test_event', { transport_type: 'xhr' })
    expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
      transport_type: 'xhr',
    })
  })

  it('passes event_callback through to gtag', () => {
    const gtagMock = vi.fn()
    window.gtag = gtagMock
    const cb = vi.fn()
    trackEvent('nav_event', { event_callback: cb })
    const calledParams = gtagMock.mock.calls[0][2] as Record<string, unknown>
    expect(calledParams.event_callback).toBe(cb)
  })

  it('does not throw when gtag is undefined (no try/catch needed)', () => {
    expect(() => trackEvent('safe_call')).not.toThrow()
  })
})
