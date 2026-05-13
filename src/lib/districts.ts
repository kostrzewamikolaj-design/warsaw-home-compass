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
  ["Śródmieście", 14774, 112, "najwyższa płynność i ograniczona podaż w centrum"],
  ["Mokotów", 11163, 88, "duży, płynny rynek z metrem i popytem biurowym w wybranych rejonach"],
  ["Wilanów", 9692, 82, "rodzinny profil dzielnicy i dużo nowszej zabudowy"],
  ["Ursynów", 9869, 78, "stabilny rynek mieszkaniowy wspierany przez metro"],
  ["Żoliborz", 11347, 95, "ograniczona podaż i mocny segment premium na rynku wtórnym"],
  ["Bielany", 9856, 74, "zrównoważona wartość północno-zachodniej Warszawy z dostępem do metra"],
  ["Bemowo", 9198, 72, "korytarz wzrostu wspierany przez metro i nową zabudowę"],
  ["Wola", 10561, 100, "silny popyt najemców przy centrum biznesowym i wysoka płynność"],
  ["Ochota", 11139, 86, "centralna dzielnica mieszkaniowa z ograniczoną podażą"],
  ["Praga-Północ", 11270, 82, "rewitalizujący się centralny rynek po prawej stronie Wisły"],
  ["Praga-Południe", 9776, 80, "szeroki popyt od Saskiej Kępy po Gocław"],
  ["Targówek", 8183, 70, "relatywna dostępność cenowa połączona z metrem"],
  ["Białołęka", 7776, 66, "niższy próg wejścia i duża podaż nowych mieszkań"],
  ["Wawer", 8172, 69, "zielony, podmiejski charakter z większym zróżnicowaniem transportu"],
  ["Wesoła", 7373, 62, "zewnętrzna, mniej gęsta dzielnica mieszkaniowa"],
  ["Rembertów", 7633, 63, "dostępniejszy cenowo rynek wschodni o mniejszej płynności"],
  ["Ursus", 9432, 68, "kolej, dostępność cenowa i nowa zabudowa rodzinna"],
  ["Włochy", 10500, 76, "dostęp do lotniska i biznesu oraz mieszany zasób mieszkaniowy"]
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
  "Szacunkowy zestaw danych MVP, ostatnia aktualizacja: maj 2026. Ceny zakupu i najmu są statycznymi założeniami lokalnymi skalibrowanymi na podstawie publicznych benchmarków warszawskiego rynku i różnic między dzielnicami; nie są aktywnymi ogłoszeniami ani oficjalną wyceną.";
