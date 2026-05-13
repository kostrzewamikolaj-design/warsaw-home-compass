# Warsaw Home Compass

Warsaw Home Compass is a Polish public MVP for comparing whether renting or buying an apartment may be financially better in Warsaw districts. It is a frontend-only decision-support product: the landing page explains the tool, and the calculator lets users test district, mortgage, rent-growth and investment-return assumptions.

The project is educational and pre-production. It uses static estimated market assumptions and should not be treated as financial, mortgage, legal or investment advice.

## Routes

- `/` - premium Polish landing page for first-time visitors.
- `/kalkulator` - interactive rent-versus-buy dashboard and calculator.

## Current MVP Features

- Warsaw district selection and side-by-side comparison.
- District SVG layer with Mapbox/CARTO base-map support when a public Mapbox token is provided.
- Scenario presets for single buyer, couple, family and rental investor.
- Adjustable assumptions for mortgage rate, down payment, apartment size, appreciation, rent growth, investment return and inflation.
- 30-year Monte Carlo simulation running in a Web Worker.
- Break-even estimate, confidence interval, wealth-difference chart and sensitivity view.
- Shareable URL hash state.
- Browser-side PDF export using `html2canvas` and `jsPDF`.
- Polish interface copy, intro, estimated-data note and MVP disclaimer.
- Responsive layouts for landing page and calculator.

## Tech Stack

- Next.js, React and TypeScript
- Mapbox GL JS with CARTO Positron styling when `NEXT_PUBLIC_MAPBOX_TOKEN` is available
- Recharts for dashboard charts
- Web Worker for Monte Carlo simulation
- `html2canvas` and `jsPDF` for client-side PDF export

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

Optional local environment variable:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_public_token
```

Without a token, the calculator should still render the district SVG layer. The Mapbox base map may be unavailable.

## Verify Locally

```bash
npm run typecheck
npm run build
```

`npm run lint` currently runs the same TypeScript validation as `npm run typecheck`.

## Data and Assumptions

District geometry is stored in `public/data/warsaw-districts.geojson`.

To refresh geometry from OpenStreetMap:

```bash
npm run fetch:districts
```

Market assumptions are static and maintained in `src/lib/districts.ts` and `src/lib/model.ts`. They include estimated district purchase prices, rental rates, appreciation bands, scenario defaults, transaction costs, mortgage defaults and investment assumptions.

The data is not live market data, not official property valuation data, not bank pricing and not a complete legal or tax model.

## Intentionally Not Included Yet

- Backend
- Authentication or user accounts
- Database
- Payments, billing or subscriptions
- Newsletter capture
- Live real estate listings
- Official property valuations
- Bank-specific mortgage offers
- Saved analyses across devices

## Limitations

- Prices and rents are estimated static MVP inputs.
- Mortgage logic is simplified and does not replace a bank offer or creditworthiness check.
- The model does not cover every tax, legal, liquidity, vacancy or transaction-timing factor.
- PDF export captures the current browser dashboard and is not yet a production reporting pipeline.
- Results are scenario estimates, not recommendations.

## Disclaimer

Warsaw Home Compass is an educational MVP. It is not financial, credit, legal, tax, mortgage or investment advice. Users should verify assumptions independently and consult qualified professionals before making housing, credit or investment decisions.
