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
  ["Śródmieście", 14774, 112, "centrum miasta, mało nowych mieszkań i mocny popyt na najem"],
  ["Mokotów", 11163, 88, "duży wybór mieszkań, metro i duże zainteresowanie najmem w wybranych rejonach"],
  ["Wilanów", 9692, 82, "dużo nowszej zabudowy i spokojniejszy, rodzinny charakter"],
  ["Ursynów", 9869, 78, "stabilna dzielnica mieszkaniowa z dobrym dostępem do metra"],
  ["Żoliborz", 11347, 95, "mało ofert i duże zainteresowanie mieszkaniami z rynku wtórnego"],
  ["Bielany", 9856, 74, "północno-zachodnia Warszawa z metrem i raczej stabilnymi cenami"],
  ["Bemowo", 9198, 72, "metro i nowa zabudowa podtrzymują zainteresowanie mieszkaniami"],
  ["Wola", 10561, 100, "bliskość centrum biznesowego mocno wspiera popyt najemców"],
  ["Ochota", 11139, 86, "centralna dzielnica mieszkaniowa z ograniczoną liczbą ofert"],
  ["Praga-Północ", 11270, 82, "centralna prawa strona Wisły, wciąż z dużymi różnicami między rejonami"],
  ["Praga-Południe", 9776, 80, "duże zainteresowanie najmem od Saskiej Kępy po Gocław"],
  ["Targówek", 8183, 70, "niższe ceny niż bliżej centrum i dostęp do metra"],
  ["Białołęka", 7776, 66, "niższy próg wejścia i duża podaż nowych mieszkań"],
  ["Wawer", 8172, 69, "zielony, bardziej podmiejski charakter i nierówny dostęp do transportu"],
  ["Wesoła", 7373, 62, "mniej gęsta dzielnica mieszkaniowa na obrzeżach miasta"],
  ["Rembertów", 7633, 63, "tańsza wschodnia część miasta, ale z mniejszym ruchem na rynku"],
  ["Ursus", 9432, 68, "kolej, niższy próg wejścia i sporo nowszej zabudowy rodzinnej"],
  ["Włochy", 10500, 76, "blisko lotniska i biur, z bardzo różną zabudową"]
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

export const dataLastUpdated = "maj 2026";

export const dataSourceNote =
  "Dane są szacunkowe i statyczne, ostatnia aktualizacja: maj 2026. Ceny zakupu i stawki najmu opierają się na publicznie dostępnych punktach odniesienia dla warszawskiego rynku oraz różnicach między dzielnicami. To nie są aktywne ogłoszenia ani oficjalna wycena.";
