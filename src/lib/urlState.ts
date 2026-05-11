import { DEFAULT_SETTINGS, type CalcSettings } from "@/store/useCalcStore";

const KEY_MAP: Record<string, keyof CalcSettings> = {
  d: "districtSlug",
  s: "scenarioId",
  r: "rateAnnual",
  rm: "rateMode",
  rf: "refinance",
  ty: "termYears",
  dp: "downPaymentPct",
  op: "originationPct",
  sec: "secondary",
  hoa: "hoaMonthly",
  he: "hoaEscalation",
  mp: "maintenancePctOfPrice",
  ins: "insuranceAnnual",
  rg: "rentGrowth",
  inf: "inflation",
  ir: "investmentReturn",
  yh: "yearsInHome",
  pa: "paths",
  po: "pricePerM2Override",
  ro: "rent50Override",
};

const REV: Record<keyof CalcSettings, string> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k]),
) as Record<keyof CalcSettings, string>;

export function encodeSettings(s: CalcSettings): string {
  const parts: string[] = [];
  (Object.keys(s) as (keyof CalcSettings)[]).forEach((k) => {
    const v = s[k];
    if (v === undefined) return;
    parts.push(`${REV[k]}=${encodeURIComponent(String(v))}`);
  });
  return parts.join("&");
}

export function decodeSettings(hash: string): Partial<CalcSettings> {
  const out: Record<string, unknown> = {};
  const clean = hash.replace(/^#/, "");
  if (!clean) return out as Partial<CalcSettings>;
  for (const part of clean.split("&")) {
    const [k, v] = part.split("=");
    if (!k || v === undefined) continue;
    const key = KEY_MAP[k];
    if (!key) continue;
    const def = DEFAULT_SETTINGS[key];
    const decoded = decodeURIComponent(v);
    if (typeof def === "number") {
      const n = Number(decoded);
      if (!Number.isNaN(n)) out[key] = n;
    } else if (typeof def === "boolean") {
      out[key] = decoded === "true";
    } else if (def === undefined) {
      // override fields default to undefined number
      const n = Number(decoded);
      if (!Number.isNaN(n)) out[key] = n;
    } else {
      out[key] = decoded;
    }
  }
  return out as Partial<CalcSettings>;
}
