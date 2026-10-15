export interface ShowcaseSlide {
  key: string
  candidates: string[]
}

// Exact copies of constants from script.js
export const SHOWCASE_SLIDE_KEYS: readonly string[] = [
  'dashboard',
  'training',
  'exercises',
  'muscles',
]

export const SHOWCASE_IMAGE_CANDIDATES: Record<string, Record<string, string[]>> = {
  en: {
    dashboard: ['assets/screenshots/dashboard_en.webp', 'assets/screenshots/dashboard_en.png'],
    training: ['assets/screenshots/training_en.webp', 'assets/screenshots/training_en.png'],
    exercises: ['assets/screenshots/exercises_en.webp', 'assets/screenshots/exercises_en.png'],
    muscles: ['assets/screenshots/muscles_en.webp', 'assets/screenshots/muscles_en.png'],
  },
  ua: {
    dashboard: ['assets/screenshots/dashboard_ua.webp', 'assets/screenshots/dashboard_ua.png'],
    training: ['assets/screenshots/training_ua.webp', 'assets/screenshots/training_ua.png'],
    exercises: ['assets/screenshots/exercises_ua.webp', 'assets/screenshots/exercises_ua.png'],
    muscles: ['assets/screenshots/muscles_ua.webp', 'assets/screenshots/muscles_ua.png'],
  },
  ru: {
    dashboard: ['assets/screenshots/dashboard_ru.webp', 'assets/screenshots/dashboard_ru.png'],
    training: ['assets/screenshots/training_ru.webp', 'assets/screenshots/training_ru.png'],
    exercises: ['assets/screenshots/exercises_ru.webp', 'assets/screenshots/exercises_ru.png'],
    muscles: ['assets/screenshots/muscles_ru.webp', 'assets/screenshots/muscles_ru.png'],
  },
}

export const FALLBACK_SHOWCASE_IMAGES: readonly string[] = [
  'assets/account.management/screen_home.png',
  'assets/account.management/screen_profile.png',
  'assets/account.management/screen_settings.png',
]
