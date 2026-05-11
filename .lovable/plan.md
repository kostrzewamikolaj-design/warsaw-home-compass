## Warsaw Rent vs Buy Calculator — Build Plan

A premium fintech-style web app that helps users decide whether renting or buying a Warsaw apartment makes more financial sense, powered by an interactive district map and a 30-year Monte Carlo engine.

### User experience

**Landing / main view (desktop)**
- Full-bleed interactive Warsaw map on the left (~60% width), calculator + results panel on the right (~40%).
- Map is a choropleth of all 18 districts colored by rent-to-price ratio (monthly rent ÷ price per m²), with a legend and hover tooltip showing district name, median PLN/m², avg rent, ratio.
- Clicking a district: smooth fly-to + zoom, district highlight ring, side panel populates with that district's seed numbers.
- Top bar: scenario selector (Single / Couple / Family / Investor), Compare button, Share button, Export PDF button.

**Calculator panel**
- Inputs grouped in collapsible cards: Property, Mortgage, Costs, Market assumptions.
- Live sliders for: years in home, mortgage rate, down payment %, home appreciation, rent growth, investment return, inflation.
- Toggles: fixed vs variable rate (WIBOR/WIRON), refinancing on/off, secondary vs primary market (affects PCC tax).
- Numeric inputs: apartment size m², HOA, maintenance %, insurance, notary, origination fee.

**Results area**
- Huge animated headline: **"Break-even: X years"** with 95% CI subtitle. Number tweens on slider change.
- Monte Carlo spaghetti plot: 500 translucent paths of (Buy net worth − Rent+Invest net worth) over 30 years, with median line and shaded 5–95% confidence ribbon. Ribbon morphs on slider input.
- Secondary cards: total cost of buying, total cost of renting+investing, monthly cashflow delta, probability buying wins.

**Mobile**
- Map collapses into an autocomplete district search (Command palette style).
- Calculator becomes a single scrolling column with sticky headline result.
- Spaghetti plot shrinks; sliders use larger touch targets.

**Comparison mode**
- "Compare districts" opens a sheet where the user picks 2–3 districts; renders side-by-side break-even numbers, mini spaghetti plots, and a winner badge.

**Share & export**
- Share button serializes all settings (district, scenario, slider values) into the URL hash and copies to clipboard.
- PDF export renders a one-page report (headline, key inputs, plot snapshot, district info) using `jspdf` + `html2canvas`.

### Calculation engine (Web Worker)

Runs entirely off the main thread so sliders stay smooth.

- **Inputs:** seed price, seed rent, all slider values, scenario flat size, district appreciation band.
- **Mortgage:** standard amortization for fixed; variable path samples a stochastic WIBOR-like rate around base + spread; refinancing toggle re-amortizes when rates drop > threshold.
- **Per-path simulation (monthly steps, 360 months):**
  - Buy track: equity built (principal paid + appreciation) − cumulative interest, taxes, fees, HOA, maintenance, insurance.
  - Rent track: pay rent (escalating), invest the monthly delta (buy outflow − rent outflow, when positive) at the sampled investment return; subtract inflation for real terms.
  - Net worth difference recorded each year.
- **Monte Carlo:** 500 paths sampling normal distributions for appreciation (band-specific mean/stdev), rent growth, investment return, inflation, and (if variable) interest rate.
- **Outputs:** array of yearly net-worth diffs per path → median, p5, p95, break-even year (first year median crosses 0), probability buying wins at year N.

Worker communicates via `postMessage`; main thread debounces input changes (~150 ms) and shows a subtle "recomputing" shimmer.

### District data

Hardcoded seed dataset in `src/data/districts.ts`:
- 18 Warsaw districts with: name, slug, median PLN/m² (2025 estimate), avg monthly rent for 50 m², appreciation band (Premium / Stable / Growth / Emerging), centroid lat/lng for fly-to.
- GeoJSON polygons for the 18 districts in `src/data/warsaw-districts.geo.json` (sourced from public OSM-derived boundaries, simplified).
- Appreciation bands map to mean/stdev pairs used by the Monte Carlo.

### Design system

- Dark fintech aesthetic with a light-mode toggle. Deep navy background, soft-glass cards, single accent (electric teal), success green / danger red for buy-vs-rent winner.
- Update `src/styles.css` tokens (oklch) — no raw colors in components.
- Typography: Inter for UI, tabular numerals for the headline figure.
- Motion: subtle fade-in on mount, spring tweens on the headline number, smooth path interpolation on the spaghetti plot, ribbon morphs via D3 transitions.

### Tech details

- **Framework:** existing TanStack Start + React + TS + Vite (no migration).
- **Map:** `maplibre-gl` with the free Carto Positron raster style — same API surface as Mapbox GL JS, no token.
- **Charts:** `d3` for the spaghetti plot + ribbon (canvas-rendered for 500 paths perf), Recharts for small secondary cards.
- **Worker:** Vite-native `new Worker(new URL('./montecarlo.worker.ts', import.meta.url), { type: 'module' })`.
- **State:** URL hash is the source of truth; a small Zustand store mirrors it for components.
- **PDF:** `jspdf` + `html2canvas`.

### File structure (new)

```text
src/
  routes/
    index.tsx                  // main app shell
    compare.tsx                // side-by-side comparison
  components/
    map/WarsawMap.tsx
    map/DistrictSearch.tsx     // mobile autocomplete
    calculator/CalculatorPanel.tsx
    calculator/SliderRow.tsx
    calculator/ScenarioPicker.tsx
    results/BreakEvenHeadline.tsx
    results/SpaghettiPlot.tsx
    results/SummaryCards.tsx
    share/ShareButton.tsx
    share/ExportPdfButton.tsx
  workers/
    montecarlo.worker.ts
    montecarlo.types.ts
  data/
    districts.ts
    warsaw-districts.geo.json
    scenarios.ts
  lib/
    finance.ts                 // amortization, PCC, fees
    rng.ts                     // seeded normal sampler
    urlState.ts                // hash encode/decode
    useMonteCarlo.ts           // hook wrapping worker
  store/
    useCalcStore.ts
```

### Build order

1. Design tokens, app shell, scenario picker, seed data + GeoJSON.
2. MapLibre choropleth + click-to-fly + hover tooltip.
3. Calculator panel + sliders + URL hash sync.
4. Monte Carlo worker + finance helpers + hook.
5. Break-even headline + spaghetti plot + summary cards.
6. Mobile collapse: district autocomplete + responsive layout.
7. Compare route + Share + PDF export.
8. Polish: animations, empty states, loading shimmer, a11y pass.

### Notes / caveats

- District price/rent numbers are 2025 estimates and clearly labeled as editable assumptions, not live data.
- 500 Monte Carlo paths × 360 months runs comfortably in a worker; we'll cap at 1000 if perf headroom allows.
- GeoJSON for Warsaw districts will be a simplified public boundary file (~50–100 KB) bundled with the app.
