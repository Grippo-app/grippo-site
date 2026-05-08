# grippo-site

## Project purpose

Public landing page on grippo-app.com (hosted on GitHub Pages). Hero,
KPI, phone showcase, store-redirect (App Store / Google Play), policies
tabs. Does not hit backend.

## Stack

- TypeScript (strict, ESNext, `moduleResolution: bundler`, `noEmit: true`).
- Vite 5 for dev/build, `VITE_BASE_URL` controls `base` (for GitHub Pages — `/grippo-site/`, for the custom domain — `/`).
- Vitest 2 + jsdom for testing pure-function modules and i18n.
- Plain CSS with tokens (`styles/t[CLAUDE.md](CLAUDE.md)okens.css`), `styles/index.css` — entry point, components — `styles/components/*.css`.
- i18n — own `I18nService` (`src/i18n/`), dictionaries en/ru/ua, keys typed via `TranslationKey`.
- Analytics — Google Tag Manager (`G-VNMQ6NHH6M`), script in `index.html`.
- No runtime frameworks or dependencies.
- CI — GitHub Actions: `vitest run` → `vite build` → upload Pages artifact → deploy.

## Architecture rules

- `src/main.ts` — `new App().init()`. Thin entry point.
- `src/app.ts` — `App` class, **thin orchestrator**. Creates modules, wires window events, delegates. No business logic.
- `src/modules/<area>/` — isolated modules:
  - `analytics/` — gtag wrapper.
  - `carousel/` — `ShowcasePhones`.
  - `kpi/` — `KpiObserver` (IntersectionObserver counter).
  - `locale/` — `resolveFromParams`, `resolveFromLanguages` (pure).
  - `reveal/` — `RevealObserver` (IntersectionObserver reveal animations).
  - `ripple/` — `RippleEffect`.
  - `router/` — pure-function URL resolver (`resolveViewMode`, `resolveTabFromLocation`, `buildTabUrl`, `buildLandingUrl`). No runtime router.
  - `store/` — store-detector, store-links, store-click-handler, store-ratings.
- `src/ui/` — UI helpers with DOM access (`mobile-bar`, `rating-display`, `tabs`).
- `src/i18n/` — `I18nService`, `en.ts`, `ru.ts`, `ua.ts`, `types.ts`.
- `src/styles/` — CSS, imported via `index.css`.

`index.html` — static file (~45 KB) with `data-i18n="<key>"`,
`data-reveal`, etc. attributes. JS attaches handlers, substitutes texts
via i18n, kicks off observers.

## Code style and naming

- Files — kebab-case (`store-detector.ts`, `mobile-bar.ts`).
- Classes and interfaces — `PascalCase`.
- Each module with a public API exports named exports, no default.
- Test names — `<file>.test.ts` next to the module.
- Pure functions — no classes, explicit argument and return types.
- The "App = orchestrator, modules = logic" invariant — modules don't know about `App` and `index.html` directly (except UI helpers in `src/ui/`).

## Locked architectural decisions

- No runtime framework (React/Vue/Svelte/...).
- TypeScript strict mode.
- Deploy to GitHub Pages via GitHub Actions, branch `main`.
- i18n by hand (en/ru/ua), no intl library.
- Analytics — only Google Analytics (`G-VNMQ6NHH6M`).
- Backend integration — not needed and not introduced.

## Performance budgets and priorities

- Bundle minimal, no runtime dependencies. Any dependency is a separate discussion.
- Animations via IntersectionObserver, not scroll listeners (exception — `_updateMobileBarVisibility` with RAF throttling and hysteresis for iOS overscroll).
- No Lighthouse budgets in code, but the landing is static and must stay that way.

## Testing strategy

Vitest on pure-function modules and i18n: `src/modules/**`, `src/i18n/**`.
Coverage — only those paths (`vitest.config.ts`). DOM-dependent code
(UI helpers, App) is not tested.

When changing a pure-function module or an i18n dictionary — keep
existing tests passing. Don't add new tests without a request.

## Scope discipline

- Don't introduce a runtime framework or runtime dependencies in `package.json`.
- Don't introduce a router library. Routing — pure functions in `src/modules/router/`.
- Don't change `index.html` without a request. It's hand-written static.
- Don't connect the backend.
- Don't touch `.github/workflows/*` without a request.
- Don't change `i18n/types.ts` (`TranslationKey`) structure without updating all three dictionaries.

## When to stop and ask

- Changes to `vite.config.ts` / `tsconfig.json` / `vitest.config.ts`.
- Changes to `App` orchestration logic (init order, window events).
- Any dependency in `package.json`.
- Adding a new language to i18n.
- Changing the GA tracking ID.

## Anti-patterns

- Business logic in `App`. App only wires.
- DOM access in `src/modules/`. DOM — only in `src/ui/` and `App`.
- Non-pure functions in `router/`, `locale/`, `i18n/`.
- Inline `<script>` in `index.html` beyond the existing GA + initial dataLayer.
- Global mutable modules.
- Inline styles in TS. CSS — in `src/styles/`.
