import {
  type ViewMode,
  type TabId,
  VALID_TABS,
  DEFAULT_TAB,
  TAB_PARAM,
  LANDING_TAB_VALUES,
  LANDING_MODE_VALUES,
  MODE_VALUE_PARAMS,
  MODE_FLAG_PARAMS,
  LANDING_CLEANUP_PARAMS,
  TRUTHY_VALUES,
} from './types'

/**
 * Returns true if tabId is one of the valid policy tabs.
 */
export function isValidTab(tabId: string | null): tabId is TabId {
  if (!tabId) return false
  return (VALID_TABS as ReadonlySet<string>).has(tabId)
}

/**
 * Resolves the view mode from URLSearchParams and the current hash string.
 * hash should be the raw hash without the '#' prefix.
 * No DOM access — pure function.
 */
export function resolveViewMode(params: URLSearchParams, hash: string): ViewMode {
  const tabParam = params.get(TAB_PARAM)
  const normalizedTabParam = tabParam ? tabParam.toLowerCase() : null

  // Legal/account deep links always have priority over landing mode params.
  if (isValidTab(tabParam)) {
    return 'policies'
  }

  if (isValidTab(hash)) {
    return 'policies'
  }

  if (normalizedTabParam && LANDING_TAB_VALUES.has(normalizedTabParam)) {
    return 'landing'
  }

  const hasLandingModeValue = MODE_VALUE_PARAMS
    .map((key) => params.get(key))
    .filter(Boolean)
    .map((value) => (value as string).toLowerCase())
    .some((value) => LANDING_MODE_VALUES.has(value))

  if (hasLandingModeValue) {
    return 'landing'
  }

  const hasLandingFlag = MODE_FLAG_PARAMS.some((key) => {
    const raw = params.get(key)
    // A flag param is considered truthy if present (even empty) and its value is in TRUTHY_VALUES
    if (raw === null) return false
    return TRUTHY_VALUES.has(raw.toLowerCase())
  })

  if (hasLandingFlag) {
    return 'landing'
  }

  return 'landing'
}

/**
 * Resolves the active tab from URLSearchParams and the current hash string.
 * hash should be the raw hash without the '#' prefix.
 * No DOM access — pure function.
 */
export function resolveTabFromLocation(params: URLSearchParams, hash: string): TabId {
  const tabParam = params.get(TAB_PARAM)

  if (isValidTab(tabParam)) {
    return tabParam
  }

  if (isValidTab(hash)) {
    return hash
  }

  return DEFAULT_TAB
}

/**
 * Builds a URL that navigates to a specific policy tab.
 * - Sets ?tab=tabId
 * - Sets or removes the locale param (omits default locale)
 * - Removes LANDING_CLEANUP_PARAMS that had landing-mode values
 * - Sets hash=#tabId
 * Does NOT call pushState — the caller is responsible for that.
 */
export function buildTabUrl(
  current: URL,
  tabId: TabId,
  locale: string,
  defaultLocale: string,
): URL {
  const url = new URL(current.toString())

  url.searchParams.set(TAB_PARAM, tabId)

  if (locale !== defaultLocale) {
    url.searchParams.set('locale', locale)
  } else {
    url.searchParams.delete('locale')
    url.searchParams.delete('lang')
    url.searchParams.delete('lng')
  }

  LANDING_CLEANUP_PARAMS.forEach((key) => {
    const value = url.searchParams.get(key)
    if (value === null) return

    if (key === 'landing' || key === 'promo') {
      url.searchParams.delete(key)
      return
    }

    if (LANDING_MODE_VALUES.has(value.toLowerCase())) {
      url.searchParams.delete(key)
    }
  })

  url.hash = tabId

  return url
}

/**
 * Builds a URL that navigates back to the landing page.
 * - Removes all policy/landing routing params
 * - Sets or removes the locale param
 * - Clears the hash
 * Does NOT call pushState — the caller is responsible for that.
 */
export function buildLandingUrl(
  current: URL,
  locale: string,
  defaultLocale: string,
): URL {
  const url = new URL(current.toString())

  url.searchParams.delete(TAB_PARAM)

  LANDING_CLEANUP_PARAMS.forEach((key) => {
    url.searchParams.delete(key)
  })

  if (locale !== defaultLocale) {
    url.searchParams.set('locale', locale)
  } else {
    url.searchParams.delete('locale')
    url.searchParams.delete('lang')
    url.searchParams.delete('lng')
  }

  url.hash = ''

  return url
}
