import { describe, it, expect } from 'vitest'
import {
  isValidTab,
  resolveViewMode,
  resolveTabFromLocation,
  buildTabUrl,
  buildLandingUrl,
} from './router'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function p(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
}

function base(): URL {
  return new URL('https://example.com/')
}

// ---------------------------------------------------------------------------
// isValidTab
// ---------------------------------------------------------------------------

describe('isValidTab', () => {
  it('accepts valid tabs', () => {
    expect(isValidTab('privacy')).toBe(true)
    expect(isValidTab('terms')).toBe(true)
    expect(isValidTab('remove')).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isValidTab(null)).toBe(false)
    expect(isValidTab('')).toBe(false)
    expect(isValidTab('landing')).toBe(false)
    expect(isValidTab('unknown')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// resolveViewMode — full URL contract
// ---------------------------------------------------------------------------

describe('resolveViewMode', () => {
  // Policy tab via ?tab=
  it('?tab=privacy → POLICIES', () => {
    expect(resolveViewMode(p('?tab=privacy'), '')).toBe('policies')
  })

  it('?tab=terms → POLICIES', () => {
    expect(resolveViewMode(p('?tab=terms'), '')).toBe('policies')
  })

  it('?tab=remove → POLICIES', () => {
    expect(resolveViewMode(p('?tab=remove'), '')).toBe('policies')
  })

  // Policy tab via hash
  it('#privacy → POLICIES', () => {
    expect(resolveViewMode(p(''), 'privacy')).toBe('policies')
  })

  it('#terms → POLICIES', () => {
    expect(resolveViewMode(p(''), 'terms')).toBe('policies')
  })

  it('#remove → POLICIES', () => {
    expect(resolveViewMode(p(''), 'remove')).toBe('policies')
  })

  // Landing via ?tab= with landing-mode value
  it('?tab=landing → LANDING', () => {
    expect(resolveViewMode(p('?tab=landing'), '')).toBe('landing')
  })

  // Landing via ?view=
  it('?view=landing → LANDING', () => {
    expect(resolveViewMode(p('?view=landing'), '')).toBe('landing')
  })

  // Landing via ?page=
  it('?page=landing → LANDING', () => {
    expect(resolveViewMode(p('?page=landing'), '')).toBe('landing')
  })

  // Landing via ?landing=1
  it('?landing=1 → LANDING', () => {
    expect(resolveViewMode(p('?landing=1'), '')).toBe('landing')
  })

  // Landing via bare flag ?promo
  it('?promo (no value) → LANDING', () => {
    expect(resolveViewMode(p('?promo'), '')).toBe('landing')
  })

  // No params at all
  it('(no params) → LANDING', () => {
    expect(resolveViewMode(p(''), '')).toBe('landing')
  })

  // Extra: tab param takes priority over hash
  it('?tab=privacy with #terms → POLICIES (tab wins)', () => {
    expect(resolveViewMode(p('?tab=privacy'), 'terms')).toBe('policies')
  })

  // Non-policy hash does not trigger policies mode
  it('#landing → LANDING', () => {
    expect(resolveViewMode(p(''), 'landing')).toBe('landing')
  })
})

// ---------------------------------------------------------------------------
// resolveTabFromLocation
// ---------------------------------------------------------------------------

describe('resolveTabFromLocation', () => {
  it('returns tab from ?tab= param', () => {
    expect(resolveTabFromLocation(p('?tab=terms'), '')).toBe('terms')
  })

  it('returns tab from hash when no ?tab= param', () => {
    expect(resolveTabFromLocation(p(''), 'remove')).toBe('remove')
  })

  it('prefers ?tab= over hash', () => {
    expect(resolveTabFromLocation(p('?tab=terms'), 'privacy')).toBe('terms')
  })

  it('falls back to DEFAULT_TAB (privacy) when nothing valid', () => {
    expect(resolveTabFromLocation(p(''), '')).toBe('privacy')
    expect(resolveTabFromLocation(p('?tab=landing'), '')).toBe('privacy')
    expect(resolveTabFromLocation(p(''), 'landing')).toBe('privacy')
  })
})

// ---------------------------------------------------------------------------
// buildTabUrl
// ---------------------------------------------------------------------------

describe('buildTabUrl', () => {
  it('sets ?tab=tabId and hash=#tabId', () => {
    const url = buildTabUrl(base(), 'privacy', 'en', 'en')
    expect(url.searchParams.get('tab')).toBe('privacy')
    expect(url.hash).toBe('#privacy')
  })

  it('sets locale param when not default', () => {
    const url = buildTabUrl(base(), 'terms', 'ua', 'en')
    expect(url.searchParams.get('locale')).toBe('ua')
  })

  it('removes locale/lang/lng params when locale is default', () => {
    const start = new URL('https://example.com/?locale=ua&lang=ua&lng=ua')
    const url = buildTabUrl(start, 'privacy', 'en', 'en')
    expect(url.searchParams.get('locale')).toBeNull()
    expect(url.searchParams.get('lang')).toBeNull()
    expect(url.searchParams.get('lng')).toBeNull()
  })

  it('removes landing/promo cleanup params', () => {
    const start = new URL('https://example.com/?landing=1&promo&view=landing&page=landing&mode=landing')
    const url = buildTabUrl(start, 'terms', 'en', 'en')
    expect(url.searchParams.get('landing')).toBeNull()
    expect(url.searchParams.get('promo')).toBeNull()
    expect(url.searchParams.get('view')).toBeNull()
    expect(url.searchParams.get('page')).toBeNull()
    expect(url.searchParams.get('mode')).toBeNull()
  })

  it('does NOT remove non-landing view params', () => {
    // e.g. ?view=profile should be preserved since it's not a landing-mode value
    const start = new URL('https://example.com/?view=profile')
    const url = buildTabUrl(start, 'privacy', 'en', 'en')
    expect(url.searchParams.get('view')).toBe('profile')
  })

  it('does not call pushState (returns a plain URL object)', () => {
    // Just verifying it returns a URL, not undefined
    const url = buildTabUrl(base(), 'remove', 'en', 'en')
    expect(url).toBeInstanceOf(URL)
  })
})

// ---------------------------------------------------------------------------
// buildLandingUrl
// ---------------------------------------------------------------------------

describe('buildLandingUrl', () => {
  it('removes tab param', () => {
    const start = new URL('https://example.com/?tab=privacy')
    const url = buildLandingUrl(start, 'en', 'en')
    expect(url.searchParams.get('tab')).toBeNull()
  })

  it('removes all LANDING_CLEANUP_PARAMS', () => {
    const start = new URL('https://example.com/?landing=1&promo&view=landing&page=landing&mode=landing')
    const url = buildLandingUrl(start, 'en', 'en')
    expect(url.searchParams.get('landing')).toBeNull()
    expect(url.searchParams.get('promo')).toBeNull()
    expect(url.searchParams.get('view')).toBeNull()
    expect(url.searchParams.get('page')).toBeNull()
    expect(url.searchParams.get('mode')).toBeNull()
  })

  it('clears hash', () => {
    const start = new URL('https://example.com/#privacy')
    const url = buildLandingUrl(start, 'en', 'en')
    expect(url.hash).toBe('')
  })

  it('sets locale for non-default locale', () => {
    const url = buildLandingUrl(base(), 'ru', 'en')
    expect(url.searchParams.get('locale')).toBe('ru')
  })

  it('removes locale params for default locale', () => {
    const start = new URL('https://example.com/?locale=ru&lang=ru&lng=ru')
    const url = buildLandingUrl(start, 'en', 'en')
    expect(url.searchParams.get('locale')).toBeNull()
    expect(url.searchParams.get('lang')).toBeNull()
    expect(url.searchParams.get('lng')).toBeNull()
  })
})
