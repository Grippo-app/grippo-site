# Grippo Site — Refactoring Plan

## Обзор архитектуры (справка)

Текущее состояние: `index.html` + `script.js` (1313 строк, один God-класс `GrippoSiteController` из 40+ методов) + `styles.css` (1366 строк, монолит).

Цель: Vite + TypeScript + Vitest, модульная структура, SOLID, zero visual changes.

**Публичные URL не меняются никогда:**
- `?tab=privacy` / `?tab=terms` / `?tab=remove` → страница политик
- `?locale=ua` / `?lang=ua` / `?lng=ua` → украинский язык
- `#privacy` / `#terms` / `#remove` → то же что `?tab=`
- без параметров → лендинг

**Порядок выполнения:** 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14

---

## Целевая структура файлов

```
grippo-site/
├── src/
│   ├── main.ts
│   ├── app.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── index.css
│   │   └── components/
│   │       ├── nav.css
│   │       ├── hero.css
│   │       ├── phone-showcase.css
│   │       ├── store-button.css
│   │       ├── kpi.css
│   │       ├── bento.css
│   │       ├── audience.css
│   │       ├── cta.css
│   │       ├── mobile-bar.css
│   │       ├── footer.css
│   │       ├── policies.css
│   │       └── animations.css
│   ├── i18n/
│   │   ├── types.ts
│   │   ├── en.ts
│   │   ├── ua.ts
│   │   ├── ru.ts
│   │   └── index.ts
│   ├── modules/
│   │   ├── router/
│   │   │   ├── types.ts
│   │   │   ├── router.ts
│   │   │   └── router.test.ts
│   │   ├── locale/
│   │   │   ├── types.ts
│   │   │   ├── locale-resolver.ts
│   │   │   └── locale-resolver.test.ts
│   │   ├── store/
│   │   │   ├── types.ts
│   │   │   ├── store-detector.ts
│   │   │   ├── store-links.ts
│   │   │   ├── store-click-handler.ts
│   │   │   └── store-detector.test.ts
│   │   ├── analytics/
│   │   │   ├── types.ts
│   │   │   └── gtag.ts
│   │   ├── carousel/
│   │   │   ├── types.ts
│   │   │   ├── showcase.ts
│   │   │   └── showcase.test.ts
│   │   ├── kpi/
│   │   │   └── counter.ts
│   │   └── reveal/
│   │       └── reveal-observer.ts
│   ├── ui/
│   │   ├── mobile-bar.ts
│   │   └── tabs.ts
│   └── utils/
│       ├── dom.ts
│       └── url.ts
├── public/
│   ├── assets/           ← без изменений
│   └── logo.png
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---
---

## Task 01 — Setup: Vite + TypeScript + Vitest

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг мобильного фитнес-приложения (iOS + Android).
**Стек сейчас:** чистый JS, без сборщика. Файлы в корне: `index.html`, `script.js`, `styles.css`.
**Стек после:** Vanilla TypeScript + Vite + Vitest. Никакого React/Vue — лендинг, фреймворк избыточен.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо — там полная структура и все последующие таски.

**Уже сделано:** ничего, это первый таск.

**Публичные URL (нельзя сломать никогда):**
- `?tab=privacy` / `?tab=terms` / `?tab=remove` → страница политик
- `?locale=ua` / `?lang=ua` → язык
- без параметров → лендинг

---

### Задача

Инициализировать build toolchain. После этого таска `npm run dev` поднимает сайт идентично текущему, `npm run build` собирает `dist/`.

**Шаги:**

1. `package.json` — scripts: `dev`, `build`, `preview`, `test`. Зависимости (devOnly): `vite`, `typescript`, `vitest`, `@vitest/ui`, `jsdom`.

2. `vite.config.ts`:
   - `root: '.'`, `publicDir: 'public'`, `build.outDir: 'dist'`
   - папка `assets/` копируется as-is

3. `tsconfig.json`:
   - `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`
   - `strict: true`, `include: ['src/**/*']`

4. `vitest.config.ts`:
   - `environment: 'jsdom'`
   - `include: ['src/**/*.test.ts']`

5. Создать структуру папок `src/` согласно дереву в `REFACTORING.md` (пустые файлы/папки).

6. `src/main.ts` — временная заглушка:
   ```ts
   import './styles/index.css'
   // TODO: App bootstrap
   ```

7. `index.html` — обновить тег скрипта:
   ```html
   <script type="module" src="/src/main.ts"></script>
   ```
   Старый `<script src="script.js"></script>` убрать. Сам `script.js` пока не трогать.

8. `src/styles/index.css` — один `@import '../styles.css'` (существующий файл, не изменять).

**Нельзя:**
- Изменять `script.js` или `styles.css`
- Перемещать файлы из `assets/`

**Проверка:**
- `npm install` — без ошибок
- `npm run build` — создаёт `dist/index.html`
- `npx tsc --noEmit` — 0 ошибок
- `npm run dev` — сайт выглядит идентично текущему

---
---

## Task 02 — CSS: разбивка на компонентные файлы

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01: Vite + TypeScript + Vitest настроен, `npm run build` проходит, `npm run dev` работает.

---

### Задача

Разбить `styles.css` (1366 строк, 14 секций) на компонентные файлы. Визуально сайт не меняется ни на пиксель.

**Правила:**
- Копировать секции БЕЗ изменения селекторов, свойств или значений
- Каждый селектор должен оказаться ровно в одном файле
- `@media` блоки переезжают в файл того компонента, которого касаются

**Что куда:**

- `src/styles/tokens.css` — только блок `:root { }` со всеми CSS custom properties
- `src/styles/base.css` — `*`, `[hidden]`, scrollbar, `body`, `a`, `a:hover`, `a:focus-visible`, `button:focus-visible`, `h1/h2/h3`, `p`, `ul`, `.overline`, `.sect-head`, `.sect-sub`
- `src/styles/layout.css` — `.page`, `html::before` (верхняя полоска), `html[data-initial-view]` правила, `body::before/after` (glows), `.grippo-site::before` (grain), `@keyframes ambientDrift`, `body.i18n-ready` правила
- `src/styles/components/nav.css` — `.topnav`, `.topnav-brand`, `.topnav-logo`, `.topnav-back`
- `src/styles/components/hero.css` — `.landing-hero`, `.landing-hero::before`, `.hero-text`, `.hero-badge`, `@keyframes badgeShimmer`, `.badge-pulse`, `.hero-sub`, `.hero-proof`, `.proof-chip`, `.hero-actions`
- `src/styles/components/store-button.css` — `.store-buttons`, `.store-button`, `.store-icon`, `.store-text`, `.store-overline`, `.store-title`, `.store-note`, `.cta-note`, `.store-rating`, `.store-rating-sep`, `.store-free-tag`
- `src/styles/components/phone-showcase.css` — `.hero-visual`, `.phone-stage`, `.phone-frame`, `.phone-glow`, `@keyframes glowPulse`, `.phone-shot`, `.phone-controls`, `.phone-arrow`, `.phone-dots`, `.phone-dot`
- `src/styles/components/kpi.css` — `.kpi-strip`, `.kpi-grid`, `.kpi-card`, `.kpi-sep`, `.kpi-value`, `.kpi-label`
- `src/styles/components/bento.css` — `.bento`, `.bento-card`, `.bento-lg`, `.bento-full`, `.bento-full-inner`, `.bento-full-lead`, `.bento-full-desc`, `.bento-full-list`, `.bento-icon`
- `src/styles/components/audience.css` — `.audience-grid`, `.audience-card`, `.audience-icon`
- `src/styles/components/cta.css` — `.landing-body`, `.landing-cta`, `@keyframes ctaCornerPulse`, `.cta-actions`, `.cta-primary`
- `src/styles/components/mobile-bar.css` — `.mobile-store-bar`, `@keyframes msbShimmer`, `.mobile-store-primary`, `.mobile-store-secondary`, `.msb-icon`, `.msb-text`, `.msb-label`, `.msb-sub`
- `src/styles/components/footer.css` — `.footer`
- `src/styles/components/policies.css` — `.policy-hero`, `.tab-links`, `.tab-button`, `.policy-content`, `.tab-panel`, `.steps`, `.step-card`, `.step-header`, `.step-number`, `.step-media`, `.warning`
- `src/styles/components/animations.css` — `.reveal-item`, `.reveal-item.is-visible`, `@keyframes pulse`, `@keyframes floatPhone`, `.landing-body > section + section::before`, `@media (prefers-reduced-motion: reduce)`

`src/styles/index.css` — `@import` всех файлов в правильном порядке:
`tokens → base → layout → components/*` (в порядке визуального слоя: nav, hero, store-button, phone-showcase, kpi, bento, audience, cta, mobile-bar, footer, policies, animations)

После миграции удалить `styles.css` из корня репо. В `src/main.ts` импорт `src/styles/index.css` уже есть.

**Проверка:**
- `npm run build` — успех
- `npm run dev` — сайт визуально идентичен (проверить в браузере)
- Любой селектор из оригинального `styles.css` существует ровно в одном новом файле

---
---

## Task 03 — i18n: типизированные модули переводов

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01: Vite + TypeScript + Vitest настроен
- Task 02: CSS разбит на компонентные файлы

---

### Задача

Вынести все 3 локали из `script.js` (константа `I18N`, ~260 строк) в отдельные типизированные файлы. TypeScript должен ругаться если в `ua.ts` или `ru.ts` пропущен ключ.

**Шаги:**

1. **`src/i18n/types.ts`**
   ```ts
   export type TranslationKey = /* union всех строковых ключей из 'en' локали */
   export type TranslationMap = Record<TranslationKey, string>
   export type Locale = 'en' | 'ua' | 'ru'
   export const SUPPORTED_LOCALES: ReadonlySet<Locale> = new Set(['en', 'ua', 'ru'])
   export const DEFAULT_LOCALE: Locale = 'en'
   ```
   `TranslationKey` — конкретный union всех ключей (например `'brand.name' | 'title.landing' | ...`). Это позволяет TypeScript проверять полноту каждой локали.

2. **`src/i18n/en.ts`** — `export const en: TranslationMap = { ...все ключи из I18N.en в script.js... }`
3. **`src/i18n/ua.ts`** — `export const ua: TranslationMap = { ...все ключи из I18N.ua... }`
4. **`src/i18n/ru.ts`** — `export const ru: TranslationMap = { ...все ключи из I18N.ru... }`
   TypeScript ошибается если ключ есть в `en.ts` но отсутствует в `ua.ts` или `ru.ts`.

5. **`src/i18n/index.ts`**
   ```ts
   export class I18nService {
     constructor(private locale: Locale) {}
     getTranslation(key: TranslationKey): string  // fallback: en → ''
     setLocale(locale: Locale): void
     getLocale(): Locale
   }
   export { type TranslationKey, type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE }
   ```

**Нельзя:**
- Изменять `script.js` — он пока ещё используется
- Менять строки переводов — копировать точь-в-точь

**Проверка:**
- `npx tsc --noEmit` — 0 ошибок
- В `ua.ts` и `ru.ts` ровно столько же ключей, сколько в `en.ts`
- `new I18nService('en').getTranslation('brand.name') === 'Grippo'`
- `new I18nService('ua').getTranslation('brand.name') === 'Grippo'`

---
---

## Task 04 — Router module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01: Vite + TypeScript + Vitest
- Task 02: CSS компоненты
- Task 03: i18n модули

---

### Задача

Вынести логику URL → ViewMode в изолированный модуль из чистых функций. Никакого DOM, никаких side-эффектов.

**Публичный URL-контракт (тесты обязаны покрыть ВСЕ случаи):**
```
?tab=privacy              → ViewMode.POLICIES, tab='privacy'
?tab=terms                → ViewMode.POLICIES, tab='terms'
?tab=remove               → ViewMode.POLICIES, tab='remove'
#privacy                  → ViewMode.POLICIES, tab='privacy'
?tab=landing              → ViewMode.LANDING
?view=landing             → ViewMode.LANDING
?page=landing             → ViewMode.LANDING
?landing=1                → ViewMode.LANDING
?promo                    → ViewMode.LANDING
(no params)               → ViewMode.LANDING
```

**`src/modules/router/types.ts`**
```ts
export type ViewMode = 'landing' | 'policies'
export type TabId = 'privacy' | 'terms' | 'remove'
export const VALID_TABS: ReadonlySet<TabId>
export const DEFAULT_TAB: TabId
export const TAB_PARAM: string
export const LANDING_TAB_VALUES: ReadonlySet<string>
export const LANDING_MODE_VALUES: ReadonlySet<string>
export const MODE_VALUE_PARAMS: readonly string[]
export const MODE_FLAG_PARAMS: readonly string[]
export const LANDING_CLEANUP_PARAMS: readonly string[]
export const TRUTHY_VALUES: ReadonlySet<string>
```
Все значения — точная копия констант из `script.js`.

**`src/modules/router/router.ts`** — только чистые функции:
```ts
export function isValidTab(tabId: string | null): tabId is TabId
export function resolveViewMode(params: URLSearchParams, hash: string): ViewMode
export function resolveTabFromLocation(params: URLSearchParams, hash: string): TabId
export function buildTabUrl(current: URL, tabId: TabId, locale: string, defaultLocale: string): URL
  // устанавливает ?tab=tabId, locale param, чистит LANDING_CLEANUP_PARAMS, hash=#tabId
export function buildLandingUrl(current: URL, locale: string, defaultLocale: string): URL
```

**`src/modules/router/router.test.ts`** — покрыть весь URL-контракт выше + buildTabUrl.

**Нельзя:**
- Обращаться к `window.location` внутри `router.ts` — только аргументы функций
- Вызывать `window.history.pushState` — это делает вызывающий код

**Проверка:**
- `npm test` — все тесты зелёные
- `npx tsc --noEmit` — 0 ошибок

---
---

## Task 05 — Locale resolver module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–03: toolchain, CSS, i18n
- Task 04: router module

---

### Задача

Изолировать логику определения локали из `script.js` в чистые функции без `window`.

**`src/modules/locale/types.ts`**
```ts
// Re-export из src/i18n/types.ts:
export type { Locale } from '../../i18n/types'
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../i18n/types'
export const LOCALE_PARAMS: readonly string[] = ['locale', 'lang', 'lng']
```

**`src/modules/locale/locale-resolver.ts`** — только чистые функции:
```ts
export function mapLocaleCandidate(input: unknown): Locale | null
  // falsy → null
  // lowercase + trim + split [-_] для base
  // 'uk' | 'uk-ua' | 'uk-*' → 'ua'
  // exact match SUPPORTED_LOCALES → return
  // base match → return base
  // иначе null

export function resolveFromParams(params: URLSearchParams): Locale | null
  // перебирает LOCALE_PARAMS, возвращает первый не-null mapLocaleCandidate, иначе null

export function resolveFromLanguages(languages: readonly string[]): Locale
  // перебирает кандидаты, возвращает первый не-null mapLocaleCandidate, иначе DEFAULT_LOCALE
```

**`src/modules/locale/locale-resolver.test.ts`:**
```
mapLocaleCandidate('uk')      === 'ua'
mapLocaleCandidate('uk-UA')   === 'ua'
mapLocaleCandidate('ru-RU')   === 'ru'
mapLocaleCandidate('en-US')   === 'en'
mapLocaleCandidate('fr')      === null
mapLocaleCandidate(null)      === null
mapLocaleCandidate('')        === null
mapLocaleCandidate(undefined) === null
resolveFromParams(new URLSearchParams('locale=ua'))      === 'ua'
resolveFromParams(new URLSearchParams('lang=ru'))        === 'ru'
resolveFromParams(new URLSearchParams('foo=bar'))        === null
resolveFromLanguages(['fr', 'uk', 'en'])                 === 'ua'
resolveFromLanguages(['fr', 'de'])                       === 'en'  // DEFAULT_LOCALE
resolveFromLanguages([])                                 === 'en'
```

**Нельзя:**
- Никаких ссылок на `window`, `navigator`, `document` внутри `locale-resolver.ts`

**Проверка:**
- `npm test` — все тесты зелёные
- `npx tsc --noEmit` — 0 ошибок

---
---

## Task 06 — Store module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–03: toolchain, CSS, i18n
- Task 04: router, Task 05: locale

---

### Задача

Разбить логику магазинов на 3 файла. **Хрупкая аналитическая логика `handleStoreClick` переносится без изменений порядка операций.**

**`src/modules/store/types.ts`**
```ts
export type StoreType = 'app-store' | 'google-play'
export const STORE_EVENT_NAMES: Record<StoreType, string>  // из script.js
export const PREFERRED_STORE_KEY = 'grippo_preferred_store'
export interface StoreUrls { appStoreUrl: string; googlePlayUrl: string }
```

**`src/modules/store/store-links.ts`**
```ts
// STORE_LINKS — копия константы из script.js (все URL)
export function getStoreUrls(locale: string): StoreUrls
export function getAutoUrl(preferred: StoreType, urls: StoreUrls): string
```

**`src/modules/store/store-detector.ts`**
```ts
export function detectPreferred(manualPreferred: StoreType | null): StoreType
  // manualPreferred → readStored() → UA sniffing → 'app-store' fallback

export function readStored(): StoreType | null
  // try/catch localStorage — пустой catch с комментарием про private browsing
  // возвращает null при ошибке или невалидном значении

export function writeStored(store: StoreType): void
  // try/catch localStorage — пустой catch с комментарием
```

**`src/modules/store/store-click-handler.ts`**
```ts
export interface StoreClickContext {
  link: HTMLAnchorElement
  locale: string
  manualPreferred: StoreType | null
  onPreferenceChange: (store: StoreType) => void
}

export function handleStoreClick(event: MouseEvent, ctx: StoreClickContext): void
```

⚠️ **КРИТИЧНО — порядок операций в `handleStoreClick` нельзя менять:**
1. `resolveStoreType(link)` → нет storeType → return
2. Захват `href = link.href` **до** вызова `onPreferenceChange`
3. `ctx.onPreferenceChange(storeType)` — обновляет предпочтение и ссылки
4. Если `target="_blank"` или modifier-click → `trackEvent` и return (без preventDefault)
5. `event.preventDefault()`
6. Если нет gtag → `location.assign(href)` и return
7. `didNavigate = false` guard + `setTimeout(navigate, 300)` fallback
8. `trackEvent` с `event_callback: () => { clearTimeout; navigate() }`

Эта последовательность — точная копия из `GrippoSiteController.handleStoreClick` в `script.js`.

**`src/modules/store/store-detector.test.ts`:**
```
readStored() → null когда localStorage выбрасывает исключение
readStored() → 'app-store' когда в localStorage 'app-store'
readStored() → null когда в localStorage невалидное значение
detectPreferred('google-play') → 'google-play' (manualPreferred приоритет)
detectPreferred(null) → зависит от UA (мок navigator.userAgent)
```

**Нельзя:**
- Менять порядок операций в `handleStoreClick`
- Убирать `setTimeout` fallback (300ms)
- Пустые catch-блоки должны иметь комментарий про private browsing

**Проверка:**
- `npm test` — зелёные
- `npx tsc --noEmit` — 0 ошибок

---
---

## Task 07 — Analytics module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–06: toolchain, CSS, i18n, router, locale, store

---

### Задача

Тонкая типизированная обёртка над `window.gtag`. Единственное место во всём проекте где можно обращаться к этому глобалу.

**`src/modules/analytics/types.ts`**
```ts
export interface AnalyticsParams extends Record<string, unknown> {
  transport_type?: string
  event_callback?: () => void
}
```

**`src/modules/analytics/gtag.ts`**
```ts
// Объявить глобал:
declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export function isGtagAvailable(): boolean
  // typeof window.gtag === 'function'
  // НЕ try/catch — только typeof (codestyle: typeof-check-for-optional-browser-globals)

export function trackEvent(name: string, params: AnalyticsParams = {}): boolean
  // if (!isGtagAvailable()) return false
  // window.gtag!('event', name, { transport_type: 'beacon', ...params })
  // return true
```

**Правила:**
- Никакой другой модуль не импортирует `window.gtag` напрямую — только этот
- `isGtagAvailable()` использует `typeof`, не `try/catch`
- Модуль не имеет side-эффектов при импорте

**Проверка:**
- `npx tsc --noEmit` — 0 ошибок
- `trackEvent('test')` возвращает `false` когда `window.gtag` не определён

---
---

## Task 08 — Carousel module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–07: toolchain, CSS, i18n, router, locale, store, analytics

---

### Задача

Выделить `ShowcaseCarousel` в автономный класс. Не знает об i18n или store — только о своих DOM-элементах.

**`src/modules/carousel/types.ts`**
```ts
export interface ShowcaseSlide { key: string; candidates: string[] }

// Константы — точные копии из script.js:
export const SHOWCASE_SLIDE_KEYS: readonly string[]
export const SHOWCASE_IMAGE_CANDIDATES: Record<string, Record<string, string[]>>
export const FALLBACK_SHOWCASE_IMAGES: readonly string[]
```

**`src/modules/carousel/showcase.ts`**
```ts
export function getSlidesForLocale(locale: string): ShowcaseSlide[]
  // Чистая функция, тестируемая независимо
  // Логика: localized candidates → default fallback → FALLBACK_SHOWCASE_IMAGES

export class ShowcaseCarousel {
  constructor(options: {
    primary: HTMLImageElement
    secondary: HTMLImageElement
    stage: HTMLElement
    prevBtn: HTMLElement
    nextBtn: HTMLElement
    dotsContainer: HTMLElement
    getAlt: (key: string) => string        // инжектированный i18n lookup
  })

  init(locale: string): void   // строит slides, рендерит первый кадр, создаёт dots
  start(): void                // setInterval 3800ms
  stop(): void                 // clearInterval
  advance(direction: 1 | -1, restartTimer?: boolean): void
  goTo(index: number): void
}
```

⚠️ **Forced reflow pattern нельзя менять** (при смене слайда):
```ts
hiddenEl.style.transition = 'none'
hiddenEl.style.transform = `translateX(${direction * 10}%)`
hiddenEl.style.opacity = '0'
void hiddenEl.offsetWidth        // форсированный reflow
hiddenEl.style.transition = ''
hiddenEl.style.transform = ''
hiddenEl.style.opacity = ''
```

⚠️ **setTimeout cleanup** в `advance()` — не удалять (600ms cleanup для inline styles).

**`src/modules/carousel/showcase.test.ts`:**
```
getSlidesForLocale('en')  → 4 слайда, у каждого правильные candidates
getSlidesForLocale('ua')  → 4 слайда с ua-путями
getSlidesForLocale('xyz') → 4 слайда, fallback на en candidates
```

**Нельзя:**
- `ShowcaseCarousel` не импортирует `Locale` или `I18nService` — только через коллбэк `getAlt`

**Проверка:**
- `npm test` — зелёные
- `npx tsc --noEmit` — 0 ошибок

---
---

## Task 09 — KPI counter module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–08: всё до карусели включительно

---

### Задача

Изолировать анимацию KPI-счётчиков из `GrippoSiteController` в отдельный модуль.

**`src/modules/kpi/counter.ts`**
```ts
export function animateCounter(el: HTMLElement): void
  // Early-return если el falsy (codestyle: early-return-null-guard)
  // Читает data-kpi-target (number) и data-kpi-suffix (string)
  // rAF loop, duration = 1100ms
  // Easing: eased = 1 - (1 - progress)^3  (cubic ease-out)
  // el.textContent = `${Math.round(target * eased)}${suffix}`

export class KpiObserver {
  constructor(elements: HTMLElement[])
  observe(): void
    // Early-return если elements.length === 0
    // IntersectionObserver на ближайший .kpi-grid, threshold: 0.35
    // При пересечении: animateCounter на каждый элемент, disconnect
  disconnect(): void
}
```

**Нельзя:**
- Ссылки на `ViewMode` или другие модули
- `animateCounter(null)` должен не падать (early-return)

**Проверка:**
- `npx tsc --noEmit` — 0 ошибок
- `animateCounter(null as any)` не выбрасывает исключение

---
---

## Task 10 — Reveal observer module

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–09: всё до KPI включительно

---

### Задача

Выделить scroll-reveal анимацию из `GrippoSiteController.setupRevealObserver()`.

**`src/modules/reveal/reveal-observer.ts`**
```ts
export class RevealObserver {
  constructor(private targets: HTMLElement[]) {}

  setup(): void
    // Early-return если targets.length === 0
    // Читает window.matchMedia('(prefers-reduced-motion: reduce)')
    // Каждому target: classList.add('reveal-item')
    //   + style.setProperty('--reveal-delay', `${Math.min(index * 60, 360)}ms`)
    //   (НО: не перезаписывать --reveal-delay если уже задан через style attr в HTML)
    // Если reduceMotion: classList.add('is-visible') на всех, return
    // Иначе: IntersectionObserver { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    //   при пересечении → add 'is-visible', unobserve

  disconnect(): void
    // Если observer существует — disconnect()
}
```

**Важно:** задержка `--reveal-delay` в HTML уже может быть задана через `style="--reveal-delay:0ms"` на некоторых `.bento-card`. В этом случае `setProperty` перезапишет её — проверить логику: применять `setProperty` только если атрибут `style` не содержит `--reveal-delay`.

**Проверка:**
- `npx tsc --noEmit` — 0 ошибок
- `setup()` с пустым массивом не падает

---
---

## Task 11 — UI components: MobileBar + PolicyTabs

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–10: всё до reveal включительно

---

### Задача

Два UI-компонента которые управляют DOM, но не содержат бизнес-логики.

---

**`src/ui/mobile-bar.ts`**
```ts
export class MobileBar {
  private disabled = false

  constructor(
    private bar: HTMLElement,
    private primary: HTMLAnchorElement,
    private secondary: HTMLAnchorElement
  )
  // Если любой из элементов null → this.disabled = true

  update(config: {
    primaryStore: StoreType
    urls: StoreUrls
    getLabel: (key: string) => string
  }): void
  // Early-return если this.disabled
  // Обновить data-store и href на обоих кнопках
  // Обновить текст через querySelector('.msb-label') — НИКОГДА не ставить textContent на родителе

  setVisible(visible: boolean): void
  // Early-return если this.disabled
  // classList.toggle('is-visible', visible) на this.bar

  static create(): MobileBar | null
  // Запрашивает DOM, возвращает null если элементы не найдены
}
```

---

**`src/ui/tabs.ts`**
```ts
export class PolicyTabs {
  private panelById: Map<string, HTMLElement>

  constructor(private tabs: HTMLElement[], private panels: HTMLElement[])

  setActive(tabId: string): void
  // Early-return если !isValidTab(tabId)
  // tabs: classList.toggle('active'), setAttribute('aria-selected'), setAttribute('tabindex', '0'/'-1')
  // panels: classList.toggle('active', panel.id === tabId)

  bindEvents(onTabChange: (tabId: string) => void): void
  // Каждому tab: setAttribute('role', 'tab') + addEventListener('click')

  ensureActiveVisible(): void
  // Найти панель с .active и .reveal-item но без .is-visible
  // → requestAnimationFrame → classList.add('is-visible')
}
```

**Нельзя:**
- `MobileBar.update()` не вызывает `.textContent` на `primary` или `secondary` напрямую — только на `.msb-label` дочернем элементе
- Никакой URL / routing логики в `ui/` — это зона `router`

**Проверка:**
- `npx tsc --noEmit` — 0 ошибок
- `MobileBar.create()` возвращает `null` в jsdom без нужных элементов — не падает

---
---

## Task 12 — App orchestrator + удаление script.js

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–11: все модули реализованы и протестированы

---

### Задача

Создать `App` — тонкий оркестратор который только создаёт модули и соединяет их. Никакой бизнес-логики. Удалить `script.js`.

**`src/app.ts`**
```ts
export class App {
  // Приватные поля: экземпляры всех модулей
  private i18n!: I18nService
  private carousel!: ShowcaseCarousel
  private kpiObserver!: KpiObserver
  private revealObserver!: RevealObserver
  private mobileBar: MobileBar | null = null
  private tabs!: PolicyTabs
  private _locale!: Locale
  private _manualPreferred: StoreType | null = null
  private _scrollRafPending = false
  private _resizeRafPending = false

  init(): void
    1. resolveFromParams(params) || resolveFromLanguages(navigator.languages) → locale
    2. document.documentElement.setAttribute('data-initial-view', resolveViewMode(params, hash))
    3. Создать I18nService(locale), применить переводы к DOM
    4. document.body.classList.add('i18n-ready')
    5. revealObserver.setup()
    6. bindWindowEvents()
    7. bindStoreLinks()
    8. syncFromLocation(false)
    9. updateMobileBarVisibility()

  private syncFromLocation(push: boolean): void
    // resolveViewMode → setViewMode
    // если policies: resolveTabFromLocation → tabs.setActive

  private setViewMode(mode: ViewMode): void
    // landingPage.hidden / policyPage.hidden
    // document.title via i18n
    // если landing: carousel.init(locale) → carousel.start(), kpiObserver.observe()
    // если policies: carousel.stop()
    // updateMobileBarVisibility()

  private updateStoreLinks(): void
    // getStoreUrls(locale) → все [data-store] → href
    // mobileBar?.update(...)

  private updateMobileBarVisibility(): void
    // isMobile = matchMedia('(max-width: 720px)').matches
    // heroBottom = landingHero.getBoundingClientRect().bottom
    // shouldShow = isLanding && isMobile && heroBottom < threshold
    // mobileBar?.setVisible(shouldShow)

  private handleScroll(): void
    // rAF throttle через _scrollRafPending
    // → updateMobileBarVisibility()

  private handleResize(): void
    // rAF throttle через _resizeRafPending
    // → updateMobileBarVisibility()
}
```

**`src/main.ts`** (финальная версия):
```ts
import './styles/index.css'
import { App } from './app'
new App().init()
```

**После реализации:**
- Удалить `script.js` из корня репо
- Убедиться что в `index.html` нет `<script src="script.js">`

**Нельзя:**
- Бизнес-логика в `app.ts` — только создание и соединение модулей
- DOM-запросы без проверки на null

**Проверка:**
- `npm run build` — 0 ошибок TypeScript
- `npm test` — все тесты зелёные
- Ручная проверка в браузере:
  - Лендинг загружается, карусель работает, кнопки магазинов ведут куда надо
  - `?tab=privacy` открывает нужную панель
  - `?locale=ua` переключает язык
  - Мобильная плашка появляется при скролле (DevTools → мобильный viewport)

---
---

## Task 13 — HTML cleanup

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–12: все модули, App.ts, script.js удалён

---

### Задача

Почистить `index.html` — убрать то что переехало в TypeScript модули.

**Что убрать:**
- Инлайн `<script>` в `<head>` с `setInitialView()` IIFE — эта логика теперь в `App.init()`. Проверить что `App.init()` вызывает `document.documentElement.setAttribute('data-initial-view', ...)` **синхронно до** `classList.add('i18n-ready')`.

**Что оставить:**
- `<script async src="https://www.googletagmanager.com/gtag/js?id=G-VNMQ6NHH6M">` — внешний скрипт, не трогать
- `window.dataLayer`, `window.gtag` определение, `gtag('js')`, `gtag('config')` — оставить в инлайн-скрипте (они нужны до загрузки основного бандла)

**Проверить что всё на месте:**
- Все `data-i18n`, `data-store`, `data-tab-link`, `data-landing-link`, `data-reveal`, `data-kpi-target`, `data-kpi-suffix`, `data-tab`, `data-tab-panel` атрибуты не тронуты
- Нет дублирующихся `id`
- `<script type="module" src="/src/main.ts">` есть, `<script src="script.js">` нет

**Проверка:**
- Страница загружается без FOUC (flash of unstyled/untranslated content)
- `?tab=privacy` и `(без параметров)` загружают правильный view без layout shift
- `npm run build` — успех

---
---

## Task 14 — Tests

> **Скопируй всё ниже в новый чат**

---

**Проект:** grippo-site — маркетинговый лендинг, Vanilla TS + Vite.
**Репо:** `[ТВОЙ ПУТЬ]/grippo-site`, ветка `refactoring`.
**План:** `REFACTORING.md` в корне репо.

**Уже сделано:**
- Task 01–13: полный рефакторинг завершён

---

### Задача

Довести покрытие до 80%+ на всей чистой логике в `src/modules/` и `src/i18n/`.

**Файлы тестов — дополнить или создать:**

**`src/modules/router/router.test.ts`** — если ещё не покрыто:
- `resolveViewMode`: весь URL-контракт (все 10 сценариев из Task 04)
- `buildTabUrl`: locale param добавляется / удаляется корректно
- `buildTabUrl`: LANDING_CLEANUP_PARAMS чистятся
- `isValidTab('privacy')` === true, `isValidTab('xyz')` === false

**`src/modules/locale/locale-resolver.test.ts`** — весь список из Task 05

**`src/modules/store/store-detector.test.ts`**:
- `readStored()` → null когда `localStorage` выбрасывает (vi.stubGlobal)
- `readStored()` → `'app-store'` при валидном значении
- `readStored()` → null при невалидном значении
- `detectPreferred('google-play')` → `'google-play'`
- `detectPreferred(null)` → результат UA sniffing (мок `navigator.userAgent`)

**`src/modules/carousel/showcase.test.ts`**:
- `getSlidesForLocale('en')` → 4 слайда с правильными путями
- `getSlidesForLocale('ua')` → ua-пути в candidates
- `getSlidesForLocale('unknown')` → fallback на en

**`src/i18n/index.test.ts`**:
- `getTranslation('brand.name')` === `'Grippo'` для всех локалей
- Fallback на `'en'` при отсутствующем ключе в `'ua'`
- Возвращает `''` для несуществующего ключа

**Правила:**
- Не мокать внутренние зависимости — тестировать реальные цепочки
- `vi.stubGlobal` только для `window.localStorage` и `navigator.userAgent`
- Не нужны DOM-тесты для App.ts или ui/ — только чистая логика

**Проверка:**
- `npm test` — все тесты зелёные
- `npm test -- --coverage` → `src/modules/` coverage >= 80%
