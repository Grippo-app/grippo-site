import { describe, it, expect } from 'vitest'
import { mapLocaleCandidate, resolveFromParams, resolveFromLanguages } from './locale-resolver'

// ---------------------------------------------------------------------------
// mapLocaleCandidate
// ---------------------------------------------------------------------------

describe('mapLocaleCandidate', () => {
  // Ukrainian normalization
  it("'uk' → 'ua'", () => {
    expect(mapLocaleCandidate('uk')).toBe('ua')
  })

  it("'uk-UA' → 'ua'", () => {
    expect(mapLocaleCandidate('uk-UA')).toBe('ua')
  })

  // Base-locale extraction
  it("'ru-RU' → 'ru'", () => {
    expect(mapLocaleCandidate('ru-RU')).toBe('ru')
  })

  it("'en-US' → 'en'", () => {
    expect(mapLocaleCandidate('en-US')).toBe('en')
  })

  // Unsupported language
  it("'fr' → null", () => {
    expect(mapLocaleCandidate('fr')).toBeNull()
  })

  // Falsy inputs
  it('null → null', () => {
    expect(mapLocaleCandidate(null)).toBeNull()
  })

  it("'' → null", () => {
    expect(mapLocaleCandidate('')).toBeNull()
  })

  it('undefined → null', () => {
    expect(mapLocaleCandidate(undefined)).toBeNull()
  })

  // Extra edge cases
  it("exact match 'ua' → 'ua'", () => {
    expect(mapLocaleCandidate('ua')).toBe('ua')
  })

  it("exact match 'ru' → 'ru'", () => {
    expect(mapLocaleCandidate('ru')).toBe('ru')
  })

  it("exact match 'en' → 'en'", () => {
    expect(mapLocaleCandidate('en')).toBe('en')
  })

  it("case-insensitive: 'EN' → 'en'", () => {
    expect(mapLocaleCandidate('EN')).toBe('en')
  })

  it("underscore separator: 'en_US' → 'en'", () => {
    expect(mapLocaleCandidate('en_US')).toBe('en')
  })

  it("uk with underscore: 'uk_UA' → 'ua'", () => {
    expect(mapLocaleCandidate('uk_UA')).toBe('ua')
  })

  it('0 (number zero) → null', () => {
    expect(mapLocaleCandidate(0)).toBeNull()
  })

  it('false → null', () => {
    expect(mapLocaleCandidate(false)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// resolveFromParams
// ---------------------------------------------------------------------------

describe('resolveFromParams', () => {
  it("locale=ua → 'ua'", () => {
    expect(resolveFromParams(new URLSearchParams('locale=ua'))).toBe('ua')
  })

  it("lang=ru → 'ru'", () => {
    expect(resolveFromParams(new URLSearchParams('lang=ru'))).toBe('ru')
  })

  it("lng=en → 'en'", () => {
    expect(resolveFromParams(new URLSearchParams('lng=en'))).toBe('en')
  })

  it('foo=bar → null (no matching param)', () => {
    expect(resolveFromParams(new URLSearchParams('foo=bar'))).toBeNull()
  })

  it('empty params → null', () => {
    expect(resolveFromParams(new URLSearchParams(''))).toBeNull()
  })

  it('prefers locale over lang (first param wins)', () => {
    expect(resolveFromParams(new URLSearchParams('locale=en&lang=ru'))).toBe('en')
  })

  it('falls through to lang when locale is invalid', () => {
    expect(resolveFromParams(new URLSearchParams('locale=fr&lang=ru'))).toBe('ru')
  })

  it("lang=uk-UA → 'ua'", () => {
    expect(resolveFromParams(new URLSearchParams('lang=uk-UA'))).toBe('ua')
  })
})

// ---------------------------------------------------------------------------
// resolveFromLanguages
// ---------------------------------------------------------------------------

describe('resolveFromLanguages', () => {
  it("['fr', 'uk', 'en'] → 'ua' (uk maps to ua)", () => {
    expect(resolveFromLanguages(['fr', 'uk', 'en'])).toBe('ua')
  })

  it("['fr', 'de'] → 'en' (DEFAULT_LOCALE fallback)", () => {
    expect(resolveFromLanguages(['fr', 'de'])).toBe('en')
  })

  it('[] → DEFAULT_LOCALE (en)', () => {
    expect(resolveFromLanguages([])).toBe('en')
  })

  it("['ru-RU', 'en'] → 'ru' (first match)", () => {
    expect(resolveFromLanguages(['ru-RU', 'en'])).toBe('ru')
  })

  it("['en-US'] → 'en'", () => {
    expect(resolveFromLanguages(['en-US'])).toBe('en')
  })
})
