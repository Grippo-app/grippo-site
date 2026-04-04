import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_PARAMS } from './types'

/**
 * Maps an arbitrary locale candidate to a supported Locale, or null.
 *
 * Rules (matching script.js logic exactly):
 *  - falsy / non-string → null
 *  - lowercase + trim, split on [-_] to get base
 *  - 'uk', 'uk-ua', or any 'uk-*' → 'ua'
 *  - exact match in SUPPORTED_LOCALES → return as-is
 *  - base matches SUPPORTED_LOCALES → return base
 *  - otherwise → null
 *
 * No DOM, no window, no side-effects.
 */
export function mapLocaleCandidate(input: unknown): Locale | null {
  if (!input) return null

  const normalized = String(input).toLowerCase().trim()
  if (!normalized) return null

  const baseLocale = normalized.split(/[-_]/)[0]

  // Ukrainian language code mapping
  if (normalized === 'uk' || normalized === 'uk-ua' || baseLocale === 'uk') {
    return 'ua'
  }

  if ((SUPPORTED_LOCALES as ReadonlySet<string>).has(normalized)) {
    return normalized as Locale
  }

  if ((SUPPORTED_LOCALES as ReadonlySet<string>).has(baseLocale)) {
    return baseLocale as Locale
  }

  return null
}

/**
 * Iterates LOCALE_PARAMS in order and returns the first valid Locale found
 * in the URLSearchParams, or null if none match.
 *
 * No DOM, no window, no side-effects.
 */
export function resolveFromParams(params: URLSearchParams): Locale | null {
  for (const key of LOCALE_PARAMS) {
    const raw = params.get(key)
    if (raw !== null) {
      const locale = mapLocaleCandidate(raw)
      if (locale !== null) return locale
    }
  }
  return null
}

/**
 * Iterates an array of language candidates (e.g. navigator.languages) and
 * returns the first valid Locale, falling back to DEFAULT_LOCALE.
 *
 * No DOM, no window, no side-effects — caller supplies the array.
 */
export function resolveFromLanguages(languages: readonly string[]): Locale {
  for (const candidate of languages) {
    const locale = mapLocaleCandidate(candidate)
    if (locale !== null) return locale
  }
  return DEFAULT_LOCALE
}
