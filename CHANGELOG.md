# Changelog

## 2026-05-15 - Lightweight motion polish

- Added subtle transform-and-opacity motion for landing section reveals, hero preview polish, card hover states and calculator action feedback while preserving formulas and chart performance.

## 2026-05-14 - Natural Polish copy pass

- Refined Polish UX copy across the landing page and calculator to sound more natural, clear and human while preserving formulas, routes and disclaimers.

## 2026-05-13 - Responsive + runtime hardening pass

Branch: `landing-page-mvp`  
Pull request: #2, `Add premium Polish landing page`

### Summary

- Improved typography resilience (line-height, wrapping, balanced headings) to reduce awkward Polish line breaks and text crowding.
- Hardened responsive behavior on landing and calculator layouts for desktop, tablet and small mobile widths.
- Reduced dashboard runtime load by removing duplicate slider event triggering, debouncing simulation updates and reducing chart rendering pressure.
- Added a local `favicon.ico` to remove runtime 404 console noise.

### Performance Notes

- Simulation dispatch is now debounced by 150ms after settings changes.
- Slider updates no longer double-trigger both `onInput` and `onChange`.
- Monte Carlo worker path count changed from 650 to 560 (summary stats preserved).
- Rendered spaghetti lines were reduced (56 generated, 36 displayed) and chart animations were disabled for heavy series.
- PDF capture scale was lowered from 1.6 to 1.35 to reduce export workload.

### Verification

- `npm run typecheck` - passed.
- `npm run build` - passed.
- `npm run dev` - runtime QA executed on `/` and `/kalkulator`.

### Runtime QA Snapshot

- Checked viewports: 1440, 1280, 1024, 768, 430 and 390.
- No horizontal page overflow detected on checked routes.
- Console and page errors were clean on checked routes after fixes.
- Flow checks included landing CTA to calculator, district comparison selection (Wola and Żoliborz), slider updates and share hash behavior.
- PDF export button path was exercised in headless QA; full browser save UX remains browser-dependent.

## 2026-05-13 - Landing page MVP polish

Branch: `landing-page-mvp`  
Pull request: #2, `Add premium Polish landing page`

### Summary

- Strengthened the Polish landing page positioning, CTA support copy and product explanation.
- Added a clearer "what you get" section, concise methodology summary and positive trust architecture.
- Kept the calculator at `/kalkulator` and preserved existing dashboard functionality.
- Improved range-slider accessibility and input-event handling without changing formulas.
- Updated repository documentation to reflect the current public MVP state.

### Areas Changed

- Landing page copy, metadata and section structure.
- Landing page CSS for new cards, methodology summary, trust cards and responsive behavior.
- README and product-status documentation.
- Changelog added for PR-level traceability.
- Calculator slider markup in `src/components/Dashboard.tsx`.

### Duplicate Key Fix Status

- Duplicate React key warnings in district SVG rendering were fixed earlier in this PR iteration.
- The fix uses stable render-only keys for district shapes while preserving semantic district IDs for interaction logic.

### Verification

- `npm run typecheck` - passed.
- `npm run build` - passed.

### Runtime QA

- `/` - rendered the landing page, desktop and mobile viewport checked.
- `/kalkulator` - rendered the calculator dashboard, district selection, map click, share URL and PDF export paths checked.
- Browser console - clean for React duplicate key warnings, hydration warnings and runtime errors during checked flows.

### Product Status After This Change

Warsaw Home Compass remains a frontend-only educational public MVP using static estimated market data. No backend, authentication, database, payments, accounts, billing, newsletter, live listings or official valuations were added.
