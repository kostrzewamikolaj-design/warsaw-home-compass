# Warsaw Rent vs Buy

Warsaw Rent vs Buy is an interactive frontend MVP for comparing the financial trade-offs between renting and buying an apartment in Warsaw districts.

The current app is a public-demo-ready dashboard, not a production-grade financial product. It uses static local assumptions for district prices, rents, appreciation bands and financing inputs. Results should be treated as educational estimates only.

## Tech Stack

- Next.js, React and TypeScript
- Mapbox GL JS with a CARTO Positron basemap
- Recharts for charts
- Web Worker for Monte Carlo simulation
- `html2canvas` and `jsPDF` for browser-side PDF export

Note: the original repository was a React/TanStack/Vite app. This PR branch currently contains a Next.js implementation and should be reviewed as a stack change before merging.

## Main Features

- Warsaw district choropleth colored by rent-to-price ratio
- District selection and side-by-side comparison
- Scenario presets for single buyer, couple, family and rental investor
- Adjustable model assumptions for mortgage rate, down payment, rent growth, investment return, inflation and appreciation baseline
- 30-year Monte Carlo simulation with break-even estimate and confidence interval
- Sensitivity ribbon and Monte Carlo path visualization
- Shareable URL hash state
- Browser-side PDF export
- Responsive dashboard layout for desktop and mobile

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Build

```bash
npm run build
```

## Type Check

```bash
npm run lint
```

The current `lint` script runs TypeScript validation with `tsc --noEmit`. A dedicated ESLint setup can be added later.

## Data

District geometry is stored in `public/data/warsaw-districts.geojson`.

To refresh geometry from OpenStreetMap:

```bash
npm run fetch:districts
```

Market assumptions are currently static and maintained in `src/lib/districts.ts` and `src/lib/model.ts`.

## Current Limitations

- District prices and rents are estimated static MVP inputs, not live market data.
- The model is simplified and does not include every tax, legal, creditworthiness or liquidity factor.
- Mortgage assumptions approximate fixed and variable rate behavior; they are not bank offers.
- PDF export captures the current dashboard view in the browser and is not a polished reporting pipeline.
- Saved analyses, alerts, reports and learning modules are not implemented yet.
- There is no backend, authentication, database, billing or production data pipeline.

## Disclaimer

This project is for educational and product validation purposes only. It is not financial, investment, legal, tax or mortgage advice. Users should verify assumptions independently and consult qualified professionals before making housing or investment decisions.
