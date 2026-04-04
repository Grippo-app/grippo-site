import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readStored, writeStored, detectPreferred } from './store-detector'
import { PREFERRED_STORE_KEY } from './types'

// ---------------------------------------------------------------------------
// readStored
// ---------------------------------------------------------------------------

describe('readStored', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: storage is not available')
    })
    expect(readStored()).toBeNull()
    vi.restoreAllMocks()
  })

  it("returns 'app-store' when localStorage contains 'app-store'", () => {
    localStorage.setItem(PREFERRED_STORE_KEY, 'app-store')
    expect(readStored()).toBe('app-store')
  })

  it("returns 'google-play' when localStorage contains 'google-play'", () => {
    localStorage.setItem(PREFERRED_STORE_KEY, 'google-play')
    expect(readStored()).toBe('google-play')
  })

  it('returns null when localStorage contains an invalid value', () => {
    localStorage.setItem(PREFERRED_STORE_KEY, 'itunes')
    expect(readStored()).toBeNull()
  })

  it('returns null when localStorage is empty', () => {
    expect(readStored()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// writeStored
// ---------------------------------------------------------------------------

describe('writeStored', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists value to localStorage', () => {
    writeStored('google-play')
    expect(localStorage.getItem(PREFERRED_STORE_KEY)).toBe('google-play')
  })

  it('does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => writeStored('app-store')).not.toThrow()
    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------------------
// detectPreferred
// ---------------------------------------------------------------------------

describe('detectPreferred', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns manualPreferred 'google-play' when provided", () => {
    expect(detectPreferred('google-play')).toBe('google-play')
  })

  it("returns manualPreferred 'app-store' when provided", () => {
    expect(detectPreferred('app-store')).toBe('app-store')
  })

  it('returns stored value when manualPreferred is null and localStorage has a value', () => {
    localStorage.setItem(PREFERRED_STORE_KEY, 'google-play')
    expect(detectPreferred(null)).toBe('google-play')
  })

  it("detects Android UA → 'google-play'", () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
      platform: '',
      maxTouchPoints: 5,
      languages: [],
      language: 'en',
    })
    expect(detectPreferred(null)).toBe('google-play')
  })

  it("detects iPhone UA → 'app-store'", () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
      languages: [],
      language: 'en',
    })
    expect(detectPreferred(null)).toBe('app-store')
  })

  it("detects iPad UA → 'app-store'", () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      platform: 'iPad',
      maxTouchPoints: 5,
      languages: [],
      language: 'en',
    })
    expect(detectPreferred(null)).toBe('app-store')
  })

  it("falls back to 'app-store' for unknown desktop UA", () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      maxTouchPoints: 0,
      languages: [],
      language: 'en',
    })
    expect(detectPreferred(null)).toBe('app-store')
  })
})
