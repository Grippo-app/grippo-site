# Redesign tasks

- [x] Research existing site and neighboring mobile product/brand.
- [x] Slice 1: Implement brand foundations, navigation and sculptural hero; verify build and browser composition.
- [x] Slice 2: Implement product story, interactive analytics and real screenshot explorer; verify functionality and types.
- [x] Slice 3: Finish EN/UA/RU copy, mobile layouts, reduced motion and accessibility.
- [x] Run tests, TypeScript, production build and independent review; address findings.
- [x] Verify desktop, tablet and mobile; open finished local preview.

## Verification

- `npm test -- --run`: 166/166 tests pass.
- `npx tsc --noEmit`: passes.
- `npm run build`: passes; 28 modules, approximately 16 KB gzipped JavaScript / 7.6 KB CSS.
- Production build using `/grippo-site/` base: independently verified.
- `git diff --check`: passes.
- No duplicate HTML IDs, missing translated keys, or missing initial image/font assets.
- Browser: EN/RU/UA, 320/375/384/650/1440px representative widths; no horizontal scroll after final fixes.
- Browser interactions: period changes/localized numbers, mouse and keyboard muscle selection, real screen selection/captions, legal routing, all policy tabs, account instructions and return to landing.
- Independent review: contrast, focus, footer clearance and base-path findings resolved; no remaining concrete concerns.
- Local preview retained at `http://127.0.0.1:5173/?locale=ru`.

## Second visual / conversion review — 2026-10-15

- [x] Reviewed as a first-time visitor on desktop and mobile; independent visual critique.
- [x] Made the product category and concrete value clear in all three languages.
- [x] Brought a real localized app screen into the hero; kept the original brand illustration.
- [x] Enlarged supporting copy, mobile controls, and explorer screenshots (300px desktop / up to278px mobile).
- [x] Added a native screenshot dialog with readable enlargement, scrolling, sticky close, Escape/backdrop dismissal and focus return.
- [x] Replaced decorative chart values with4/12/36 illustrative workout volumes and derived totals16,578/62,840/184,320kg on a shared scale.
- [x] Added contextual muscle distribution hints; fixed CSS specificity that dimmed the selected muscle.
- [x] Preserved keyboard radio navigation and improved touch targets and small-screen headline wrapping.
- [x] Removed reveal delays from interactive panels; shortened remaining reveal transitions.
- [x] Checked320/375/390/650/800/1024/1440px representative widths, EN/RU/UA localization, no horizontal overflow.
- [x] Checked modal source selection, scrolling, close visibility, Escape, backdrop and focus return in browser.
- [x] Checked all chart periods, localized totals, muscle click and keyboard changes, active screenshot and matching description.
- [x] Fresh verification:166/166 existing tests, TypeScript, production build and diff whitespace checks pass.
- [x] Independent isolated build with /grippo-site/ base passes;33 unique IDs,107 translation hooks and all referenced assets verified.

Final bundle:29 modules; approximately17KB gzipped JavaScript /8KB CSS. No new runtime dependencies or test files.
- [x] Final320px visual pass: store badges now stack cleanly and keep Google Play on one line; footer remains clear of the fixed download bar. Fresh production build after this CSS fix passes.

## Third full artifact / interaction audit — 2026-10-15

- [x] Fixed artwork colliding with copy at tablet widths; capped oversized hero art on wide screens.
- [x] Reserved a clear illustration area for the three steps on tablets and reduced mobile illustration bounds to prevent text collisions.
- [x] Kept the current app screenshot visible until the next source/fallback loads and decodes; guarded stale requests and rapid successive selections.
- [x] Preserved the selected app screen during same-locale anchor navigation.
- [x] Reset enlarged screenshots to the top on every open; verified reopening after113.5px scroll.
- [x] Fixed mobile language menu bounds; added Escape, outside-click and keyboard-exit dismissal.
- [x] Matched the mobile bar's platform icon to its actual App Store / Google Play destination.
- [x] Added policy tab arrows, Home/End and reliable skip-to-content focus.
- [x] Improved mobile legal typography, account-step stacking and return-button touch target. English legal text is markedlang=en; exact policy wording is unchanged.
- [x] Unified period demos around one dated history: week3sessions18,185kg, January12sessions70,720kg, quarter36sessions184,320kg. Comparison values now derive from previous periods (explicit sample baseline for prior quarter).
- [x] Verified RU at320/375/640/641/760/761/820/1100/1440/1920px, plus UA375px and EN1024px. No horizontal/headline overflow; text and illustration bounds remain clear.
- [x] Verified33 unique IDs,115 translation hooks, all screenshot variants/assets, menu/focus behavior and both platform icon variants.
- [x] Final verification:166 existing tests, TypeScript, normal and /grippo-site/ production builds, and diff whitespace checks pass.

Current production bundle:30 modules;17.76KB gzipped JavaScript /8.27KB CSS. No runtime dependencies or test files added. Latest screenshots:grippo-artifact-audit-desktop.jpg andgrippo-artifact-audit-tablet.jpg in the chat visualization previews directory.
