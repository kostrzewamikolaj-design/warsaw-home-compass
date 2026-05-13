# Warsaw Rent vs Buy

Interactive rent-vs-buy dashboard for the Warsaw real estate market.

## What is inside

- District choropleth for Warsaw with rent-to-price ratio coloring
- District click and comparison flows
- 30-year Monte Carlo rent-vs-buy simulation
- Mortgage settings, appreciation, rent growth, inflation and investment return controls
- Shareable URL hash state and PDF export
- Responsive premium dashboard layout

## Local development

```bash
npm install
npm run dev
```

Then open the local Next.js URL printed by the dev server.

District geometry is stored in `public/data/warsaw-districts.geojson`. To refresh it from OpenStreetMap, run:

```bash
npm run fetch:districts
```
