# Product Status

Last updated: 2026-05-13

## Stage

Public MVP / pre-deployment.

The product is a frontend-only Polish MVP for comparing renting versus buying an apartment in Warsaw. It is intended for public demo, product validation and user feedback, not as a regulated financial product.

Current branch / PR context:

- Branch: `landing-page-mvp`
- Pull request: #2, `Add premium Polish landing page`
- Base branch: `main`

## Current Routes

- `/` - premium Polish landing page explaining the product, model scope and trust boundaries.
- `/kalkulator` - interactive rent-versus-buy calculator dashboard.

## Completed Features

- Polish landing page with hero, product preview, problem framing, model overview, methodology summary, trust section and final CTA.
- Responsive layout hardening on `/` and `/kalkulator` for laptop/tablet/mobile MVP usability.
- Calculator dashboard moved to `/kalkulator`.
- Warsaw district selection and comparison.
- Static estimated Warsaw district market data.
- Adjustable mortgage, rent, appreciation, inflation and investment assumptions.
- Monte Carlo simulation in a Web Worker.
- Break-even and wealth-difference visualization.
- Shareable URL hash state.
- Browser-side PDF export.
- Polish interface copy and visible MVP disclaimer.
- Duplicate React key warnings in district map rendering fixed.
- Runtime hardening: debounced simulation updates, lighter chart rendering and reduced duplicate slider-trigger pressure.
- Documentation foundation in `README.md`, `METHODOLOGY.md`, `PRODUCT_STATUS.md` and `CHANGELOG.md`.

## Known Limitations

- District prices and rents are static estimated inputs, not live listings.
- The app does not provide official valuations or bank offers.
- Mortgage and transaction-cost modeling is simplified.
- The simulation is an educational scenario model, not a prediction.
- PDF export is browser-based and not a polished reporting workflow.
- Saved scenarios, alerts, reports and learning areas are not production features yet.
- Mobile calculator remains a compressed MVP view; fully polished mobile analytics UX is still pending.

## Intentionally Not Included Yet

- Backend
- Authentication
- Database
- Payments
- Newsletter
- User accounts
- Billing
- Live real estate listings
- Official property valuations
- Bank-specific mortgage pricing

## QA Status

Latest local QA pass on 2026-05-13:

- `npm run typecheck` passed.
- `npm run build` passed.
- Runtime QA checked `/` and `/kalkulator`.
- Viewports checked: 1440, 1280, 1024, 768, 430, 390.
- Browser console was clean for React warnings/hydration/runtime errors on checked flows after the hardening pass.
- Share URL hash was exercised locally; PDF button path was exercised, while final browser save UX remains browser-dependent.

## Recommended Next Steps

1. Deploy the MVP to a public preview environment and verify routes, PDF export and share links there.
2. Add documented, repeatable data refresh workflow for price and rent assumptions.
3. Review financial assumptions with a qualified mortgage/real-estate specialist before broader public distribution.
