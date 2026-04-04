import { describe, it, expect } from 'vitest'
import { getStoreUrls, getAutoUrl } from './store-links'

// ---------------------------------------------------------------------------
// getStoreUrls
// ---------------------------------------------------------------------------

describe('getStoreUrls', () => {
  it("returns en App Store URL for 'en'", () => {
    const urls = getStoreUrls('en')
    expect(urls.appStoreUrl).toContain('apps.apple.com/us/')
  })

  it("returns ua App Store URL for 'ua'", () => {
    const urls = getStoreUrls('ua')
    expect(urls.appStoreUrl).toContain('apps.apple.com/ua/')
  })

  it("returns ru App Store URL for 'ru'", () => {
    const urls = getStoreUrls('ru')
    expect(urls.appStoreUrl).toContain('apps.apple.com/ru/')
  })

  it("returns en Google Play URL for 'en'", () => {
    const urls = getStoreUrls('en')
    expect(urls.googlePlayUrl).toContain('utm_content=android_en')
  })

  it("returns ua Google Play URL for 'ua'", () => {
    const urls = getStoreUrls('ua')
    expect(urls.googlePlayUrl).toContain('utm_content=android_ua')
  })

  it("returns ru Google Play URL for 'ru'", () => {
    const urls = getStoreUrls('ru')
    expect(urls.googlePlayUrl).toContain('utm_content=android_ru')
  })

  it("falls back to 'en' URLs for an unknown locale", () => {
    const enUrls = getStoreUrls('en')
    const unknownUrls = getStoreUrls('zz')
    expect(unknownUrls.appStoreUrl).toBe(enUrls.appStoreUrl)
    expect(unknownUrls.googlePlayUrl).toBe(enUrls.googlePlayUrl)
  })

  it('returns non-empty strings for all supported locales', () => {
    for (const locale of ['en', 'ua', 'ru']) {
      const urls = getStoreUrls(locale)
      expect(urls.appStoreUrl.length).toBeGreaterThan(0)
      expect(urls.googlePlayUrl.length).toBeGreaterThan(0)
    }
  })

  it('App Store URL contains the Grippo app id', () => {
    const urls = getStoreUrls('en')
    expect(urls.appStoreUrl).toContain('id6758158216')
  })

  it('Google Play URL contains the Grippo package id', () => {
    const urls = getStoreUrls('en')
    expect(urls.googlePlayUrl).toContain('com.grippo.android')
  })
})

// ---------------------------------------------------------------------------
// getAutoUrl
// ---------------------------------------------------------------------------

describe('getAutoUrl', () => {
  const urls = getStoreUrls('en')

  it("returns googlePlayUrl when preferred is 'google-play'", () => {
    expect(getAutoUrl('google-play', urls)).toBe(urls.googlePlayUrl)
  })

  it("returns appStoreUrl when preferred is 'app-store'", () => {
    expect(getAutoUrl('app-store', urls)).toBe(urls.appStoreUrl)
  })

  it('works with ua urls for google-play', () => {
    const uaUrls = getStoreUrls('ua')
    expect(getAutoUrl('google-play', uaUrls)).toBe(uaUrls.googlePlayUrl)
  })

  it('works with ru urls for app-store', () => {
    const ruUrls = getStoreUrls('ru')
    expect(getAutoUrl('app-store', ruUrls)).toBe(ruUrls.appStoreUrl)
  })
})
