export type AppreciationBand = "Premium" | "Stable" | "Growth" | "Emerging" | "Outer value";

export type DistrictMarket = {
  id: string;
  name: string;
  pricePerM2: number;
  rentPerM2: number;
  band: AppreciationBand;
  appreciationRange: [number, number];
  note: string;
};

const premium = ["Śródmieście", "Żoliborz", "Mokotów"];
const stable = ["Ochota", "Ursynów", "Wilanów"];
const growth = ["Wola", "Bemowo", "Praga-Południe"];
const emerging = ["Białołęka", "Targówek", "Ursus"];

const bandFor = (name: string): AppreciationBand => {
  if (premium.includes(name)) return "Premium";
  if (stable.includes(name)) return "Stable";
  if (growth.includes(name)) return "Growth";
  if (emerging.includes(name)) return "Emerging";
  return "Outer value";
};

const ranges: Record<AppreciationBand, [number, number]> = {
  Premium: [0.034, 0.056],
  Stable: [0.027, 0.046],
  Growth: [0.037, 0.063],
  Emerging: [0.044, 0.072],
  "Outer value": [0.024, 0.048]
};

const rows: Array<[string, number, number, string]> = [
  ["Śródmieście", 14774, 112, "highest liquidity and central scarcity"],
  ["Mokotów", 11163, 88, "large, liquid market with metro and office demand pockets"],
  ["Wilanów", 9692, 82, "family-oriented stock with modern buildings"],
  ["Ursynów", 9869, 78, "metro-led residential stability"],
  ["Żoliborz", 11347, 95, "limited supply and premium resale depth"],
  ["Bielany", 9856, 74, "balanced north-west value with metro access"],
  ["Bemowo", 9198, 72, "metro extension and new-build growth corridor"],
  ["Wola", 10561, 100, "business-district rental pull and high liquidity"],
  ["Ochota", 11139, 86, "central residential district with tight supply"],
  ["Praga-Północ", 11270, 82, "central east-bank renewal with higher dispersion"],
  ["Praga-Południe", 9776, 80, "broad demand from Saska Kępa to Gocław"],
  ["Targówek", 8183, 70, "metro-connected affordability"],
  ["Białołęka", 7776, 66, "lower entry prices and large new supply"],
  ["Wawer", 8172, 69, "suburban green stock with transport dispersion"],
  ["Wesoła", 7373, 62, "low-density outer district"],
  ["Rembertów", 7633, 63, "affordable eastern district with smaller market depth"],
  ["Ursus", 9432, 68, "rail-linked affordability and new family stock"],
  ["Włochy", 10500, 76, "airport/business access with mixed stock"]
];

export const districts: DistrictMarket[] = rows.map(([name, pricePerM2, rentPerM2, note]) => {
  const band = bandFor(name);
  return {
    id: name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/Ł/g, "L")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase(),
    name,
    pricePerM2,
    rentPerM2,
    band,
    appreciationRange: ranges[band],
    note
  };
});

export const districtByName = new Map(districts.map((district) => [district.name, district]));
export const districtById = new Map(districts.map((district) => [district.id, district]));

export const dataSourceNote =
  "Purchase medians use current RCN-style district medians surfaced by CenaCheck, verified April 16, 2026. Rent/m2 assumptions are calibrated from 2026 Warsaw rent benchmarks and district differentials; all assumptions remain editable.";
