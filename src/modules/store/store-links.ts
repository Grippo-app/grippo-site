import { type StoreType, type StoreUrls } from './types'
import { DEFAULT_LOCALE } from '../locale/types'

// Exact copy of STORE_LINKS from script.js
const STORE_LINKS: Record<'appStore' | 'googlePlay', Record<string, string>> = {
  appStore: {
    en: 'https://apps.apple.com/us/app/grippo/id6758158216',
    ua: 'https://apps.apple.com/ua/app/grippo/id6758158216',
    ru: 'https://apps.apple.com/ru/app/grippo/id6758158216',
  },
  googlePlay: {
    en: 'https://play.google.com/store/apps/details?id=com.grippo.android&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_en',
    ua: 'https://play.google.com/store/apps/details?id=com.grippo.android&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_ua',
    ru: 'https://play.google.com/store/apps/details?id=com.grippo.android&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_ru',
  },
}

/**
 * Returns the App Store and Google Play URLs for a given locale,
 * falling back to DEFAULT_LOCALE if the locale is not found.
 */
export function getStoreUrls(locale: string): StoreUrls {
  const safeLocale = locale in STORE_LINKS.appStore ? locale : DEFAULT_LOCALE
  return {
    appStoreUrl: STORE_LINKS.appStore[safeLocale] ?? STORE_LINKS.appStore[DEFAULT_LOCALE],
    googlePlayUrl: STORE_LINKS.googlePlay[safeLocale] ?? STORE_LINKS.googlePlay[DEFAULT_LOCALE],
  }
}

/**
 * Returns the URL for the preferred store from a StoreUrls object.
 */
export function getAutoUrl(preferred: StoreType, urls: StoreUrls): string {
  return preferred === 'google-play' ? urls.googlePlayUrl : urls.appStoreUrl
}
