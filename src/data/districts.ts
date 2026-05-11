export type AppreciationBand = "Premium" | "Stable" | "Growth" | "Emerging";

export interface District {
  slug: string;
  name: string;
  /** Median apartment price PLN per m² (2025 estimate) */
  pricePerM2: number;
  /** Average monthly rent for a 50 m² apartment, PLN */
  rent50m2: number;
  band: AppreciationBand;
  /** Approximate centroid [lng, lat] */
  center: [number, number];
}

export const BAND_PARAMS: Record<
  AppreciationBand,
  { mean: number; stdev: number; color: string }
> = {
  Premium: { mean: 0.055, stdev: 0.035, color: "oklch(0.78 0.16 195)" },
  Stable: { mean: 0.04, stdev: 0.03, color: "oklch(0.72 0.17 155)" },
  Growth: { mean: 0.06, stdev: 0.045, color: "oklch(0.78 0.16 75)" },
  Emerging: { mean: 0.07, stdev: 0.06, color: "oklch(0.7 0.18 25)" },
};

export const DISTRICTS: District[] = [
  { slug: "srodmiescie", name: "Śródmieście", pricePerM2: 21500, rent50m2: 5200, band: "Premium", center: [21.0122, 52.2297] },
  { slug: "mokotow", name: "Mokotów", pricePerM2: 17800, rent50m2: 4500, band: "Premium", center: [21.026, 52.193] },
  { slug: "wilanow", name: "Wilanów", pricePerM2: 16500, rent50m2: 4200, band: "Stable", center: [21.09, 52.165] },
  { slug: "ursynow", name: "Ursynów", pricePerM2: 14200, rent50m2: 3800, band: "Stable", center: [21.04, 52.145] },
  { slug: "zoliborz", name: "Żoliborz", pricePerM2: 17200, rent50m2: 4300, band: "Premium", center: [20.985, 52.27] },
  { slug: "bielany", name: "Bielany", pricePerM2: 13200, rent50m2: 3500, band: "Stable", center: [20.94, 52.29] },
  { slug: "bemowo", name: "Bemowo", pricePerM2: 13000, rent50m2: 3400, band: "Growth", center: [20.91, 52.245] },
  { slug: "wola", name: "Wola", pricePerM2: 16800, rent50m2: 4400, band: "Growth", center: [20.97, 52.235] },
  { slug: "ochota", name: "Ochota", pricePerM2: 15500, rent50m2: 4000, band: "Stable", center: [20.97, 52.21] },
  { slug: "praga-polnoc", name: "Praga-Północ", pricePerM2: 14000, rent50m2: 3700, band: "Growth", center: [21.04, 52.255] },
  { slug: "praga-poludnie", name: "Praga-Południe", pricePerM2: 13800, rent50m2: 3600, band: "Growth", center: [21.07, 52.235] },
  { slug: "targowek", name: "Targówek", pricePerM2: 12200, rent50m2: 3200, band: "Emerging", center: [21.06, 52.29] },
  { slug: "bialoleka", name: "Białołęka", pricePerM2: 11500, rent50m2: 3100, band: "Emerging", center: [21.0, 52.33] },
  { slug: "wawer", name: "Wawer", pricePerM2: 11800, rent50m2: 3200, band: "Stable", center: [21.16, 52.2] },
  { slug: "wesola", name: "Wesoła", pricePerM2: 11200, rent50m2: 3000, band: "Emerging", center: [21.22, 52.245] },
  { slug: "rembertow", name: "Rembertów", pricePerM2: 11000, rent50m2: 2950, band: "Emerging", center: [21.16, 52.26] },
  { slug: "ursus", name: "Ursus", pricePerM2: 12500, rent50m2: 3300, band: "Emerging", center: [20.88, 52.19] },
  { slug: "wlochy", name: "Włochy", pricePerM2: 13500, rent50m2: 3500, band: "Stable", center: [20.94, 52.195] },
];

export const DISTRICT_BY_SLUG: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((d) => [d.slug, d]),
);

export function rentToPriceRatio(d: District): number {
  // monthly rent per m² / price per m² → annualized yield (×12)
  const rentPerM2 = d.rent50m2 / 50;
  return (rentPerM2 * 12) / d.pricePerM2;
}

export const WARSAW_BBOX: [number, number, number, number] = [
  20.85, 52.1, 21.27, 52.37,
];
export const WARSAW_CENTER: [number, number] = [21.01, 52.23];
