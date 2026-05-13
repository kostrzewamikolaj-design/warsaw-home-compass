# Changelog

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
