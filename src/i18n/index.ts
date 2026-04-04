import { en } from './en'
import { ua } from './ua'
import { ru } from './ru'
import {
  type TranslationKey,
  type TranslationMap,
  type Locale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from './types'

const translations: Record<Locale, TranslationMap> = { en, ua, ru }

export class I18nService {
  private locale: Locale

  constructor(locale: Locale) {
    this.locale = locale
  }

  getTranslation(key: TranslationKey): string {
    const localized = translations[this.locale][key]
    if (localized) {
      return localized
    }
    return translations[DEFAULT_LOCALE][key] ?? ''
  }

  setLocale(locale: Locale): void {
    this.locale = locale
  }

  getLocale(): Locale {
    return this.locale
  }
}

export { type TranslationKey, type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE }
export type { TranslationMap }
