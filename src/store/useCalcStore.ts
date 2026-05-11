import { create } from "zustand";
import { DEFAULT_SCENARIO_ID, SCENARIOS, type Scenario } from "@/data/scenarios";
import { DISTRICTS, DISTRICT_BY_SLUG, type District } from "@/data/districts";

export interface CalcSettings {
  districtSlug: string;
  scenarioId: string;
  // Mortgage
  rateAnnual: number;
  rateMode: "fixed" | "variable";
  refinance: boolean;
  termYears: number;
  downPaymentPct: number;
  originationPct: number;
  secondary: boolean;

  // Recurring
  hoaMonthly: number;
  hoaEscalation: number;
  maintenancePctOfPrice: number;
  insuranceAnnual: number;

  // Market
  rentGrowth: number;
  inflation: number;
  investmentReturn: number;

  // UX
  yearsInHome: number;
  paths: number;

  // Overrides
  pricePerM2Override?: number;
  rent50Override?: number;
}

export const DEFAULT_SETTINGS: CalcSettings = {
  districtSlug: "mokotow",
  scenarioId: DEFAULT_SCENARIO_ID,
  rateAnnual: 0.072,
  rateMode: "fixed",
  refinance: false,
  termYears: 30,
  downPaymentPct: 0.2,
  originationPct: 0.02,
  secondary: true,

  hoaMonthly: 12, // PLN per m²/month — multiplied by size at sim time
  hoaEscalation: 0.04,
  maintenancePctOfPrice: 0.01,
  insuranceAnnual: 600,

  rentGrowth: 0.05,
  inflation: 0.04,
  investmentReturn: 0.07,

  yearsInHome: 10,
  paths: 500,
};

interface CalcState {
  settings: CalcSettings;
  set: <K extends keyof CalcSettings>(key: K, value: CalcSettings[K]) => void;
  setMany: (patch: Partial<CalcSettings>) => void;
  reset: () => void;
  selectDistrict: (slug: string) => void;
}

export const useCalcStore = create<CalcState>((set) => ({
  settings: DEFAULT_SETTINGS,
  set: (key, value) =>
    set((s) => ({ settings: { ...s.settings, [key]: value } })),
  setMany: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  reset: () => set({ settings: DEFAULT_SETTINGS }),
  selectDistrict: (slug) =>
    set((s) => ({
      settings: {
        ...s.settings,
        districtSlug: slug,
        pricePerM2Override: undefined,
        rent50Override: undefined,
      },
    })),
}));

export function useCurrentDistrict(): District {
  const slug = useCalcStore((s) => s.settings.districtSlug);
  return DISTRICT_BY_SLUG[slug] ?? DISTRICTS[0];
}

export function useCurrentScenario(): Scenario {
  const id = useCalcStore((s) => s.settings.scenarioId);
  return SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
}
