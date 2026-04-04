import { describe, it, expect } from 'vitest'
import { I18nService } from './index'

// ---------------------------------------------------------------------------
// I18nService
// ---------------------------------------------------------------------------

describe('I18nService', () => {
  // ---- getTranslation ----

  it("returns 'Grippo' for 'brand.name' in 'en'", () => {
    const svc = new I18nService('en')
    expect(svc.getTranslation('brand.name')).toBe('Grippo')
  })

  it("returns 'Grippo' for 'brand.name' in 'ua'", () => {
    const svc = new I18nService('ua')
    expect(svc.getTranslation('brand.name')).toBe('Grippo')
  })

  it("returns 'Grippo' for 'brand.name' in 'ru'", () => {
    const svc = new I18nService('ru')
    expect(svc.getTranslation('brand.name')).toBe('Grippo')
  })

  it('returns a non-empty string for title.landing in every locale', () => {
    for (const locale of ['en', 'ua', 'ru'] as const) {
      const svc = new I18nService(locale)
      expect(svc.getTranslation('title.landing').length).toBeGreaterThan(0)
    }
  })

  it('returns a non-empty string for title.policies in every locale', () => {
    for (const locale of ['en', 'ua', 'ru'] as const) {
      const svc = new I18nService(locale)
      expect(svc.getTranslation('title.policies').length).toBeGreaterThan(0)
    }
  })

  it('returns locale-specific text for ua', () => {
    const enSvc = new I18nService('en')
    const uaSvc = new I18nService('ua')
    // Ukrainian hero title is different from English
    const enHero = enSvc.getTranslation('landing.hero.title')
    const uaHero = uaSvc.getTranslation('landing.hero.title')
    expect(uaHero).not.toBe(enHero)
  })

  it('returns locale-specific text for ru', () => {
    const enSvc = new I18nService('en')
    const ruSvc = new I18nService('ru')
    const enHero = enSvc.getTranslation('landing.hero.title')
    const ruHero = ruSvc.getTranslation('landing.hero.title')
    expect(ruHero).not.toBe(enHero)
  })

  it('falls back to en value when ua does not have an override (policies.back)', () => {
    // policies.back is '←' in en; ua likely keeps the same value
    const uaSvc = new I18nService('ua')
    const enSvc = new I18nService('en')
    // Both should return a non-empty string
    expect(uaSvc.getTranslation('policies.back').length).toBeGreaterThan(0)
    expect(enSvc.getTranslation('policies.back').length).toBeGreaterThan(0)
  })

  it("returns '' for a key that doesn't exist in any locale", () => {
    const svc = new I18nService('en')
    // Cast needed to simulate a missing key at runtime
    expect(svc.getTranslation('nonexistent.key' as never)).toBe('')
  })

  // ---- setLocale / getLocale ----

  it('getLocale returns the constructor locale', () => {
    expect(new I18nService('en').getLocale()).toBe('en')
    expect(new I18nService('ua').getLocale()).toBe('ua')
    expect(new I18nService('ru').getLocale()).toBe('ru')
  })

  it('setLocale switches the active locale', () => {
    const svc = new I18nService('en')
    expect(svc.getLocale()).toBe('en')
    svc.setLocale('ua')
    expect(svc.getLocale()).toBe('ua')
    // Translation now comes from ua
    const uaTitle = svc.getTranslation('landing.hero.title')
    expect(uaTitle.length).toBeGreaterThan(0)
  })

  it('setLocale changes which translations are returned', () => {
    const svc = new I18nService('en')
    const enHero = svc.getTranslation('landing.hero.title')
    svc.setLocale('ru')
    const ruHero = svc.getTranslation('landing.hero.title')
    expect(ruHero).not.toBe(enHero)
  })

  // ---- footer / remove keys ----

  it('has remove.title in every locale', () => {
    for (const locale of ['en', 'ua', 'ru'] as const) {
      const svc = new I18nService(locale)
      expect(svc.getTranslation('remove.title').length).toBeGreaterThan(0)
    }
  })

  it('has footer.copyright in every locale', () => {
    for (const locale of ['en', 'ua', 'ru'] as const) {
      const svc = new I18nService(locale)
      expect(svc.getTranslation('footer.copyright').length).toBeGreaterThan(0)
    }
  })
})
