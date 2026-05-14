import type { DistrictMarket } from "./districts";

export type MortgageType = "fixed" | "variable";
export type InvestmentProfile = "ETF" | "Bonds" | "Savings";
export type ScenarioKey = "single" | "couple" | "family" | "investor";

export type Settings = {
  scenario: ScenarioKey;
  areaM2: number;
  yearsInHome: number;
  mortgageRate: number;
  mortgageType: MortgageType;
  refinancing: boolean;
  secondaryMarket: boolean;
  downPayment: number;
  originationFee: number;
  notaryCost: number;
  courtFees: number;
  hoaPerM2: number;
  maintenanceReserve: number;
  hoaEscalation: number;
  insuranceAnnual: number;
  renovationAnnual: number;
  homeAppreciation: number;
  rentGrowth: number;
  investmentReturn: number;
  investmentProfile: InvestmentProfile;
  inflation: number;
};

export type SimulationRequest = {
  district: DistrictMarket;
  compareDistrict?: DistrictMarket | null;
  settings: Settings;
  paths: number;
};

export type Point = { year: number; value: number };

export type SimulationSummary = {
  districtName: string;
  breakEvenMedian: number | null;
  breakEvenLow: number | null;
  breakEvenHigh: number | null;
  finalMedianDelta: number;
  finalLowDelta: number;
  finalHighDelta: number;
  buyWinsAtHorizon: number;
  upfrontCash: number;
  monthlyPayment: number;
  purchasePrice: number;
  monthlyRent: number;
};

export type SimulationResult = {
  summary: SimulationSummary;
  compareSummary?: SimulationSummary;
  yearly: Array<{
    year: number;
    p05: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }>;
  paths: Point[][];
};

export const scenarios: Record<ScenarioKey, { label: string; areaM2: number; defaults: Partial<Settings> }> = {
  single: {
    label: "Jedna osoba",
    areaM2: 32,
    defaults: { downPayment: 0.2, yearsInHome: 7, investmentProfile: "ETF" }
  },
  couple: {
    label: "Para",
    areaM2: 50,
    defaults: { downPayment: 0.2, yearsInHome: 10, investmentProfile: "ETF" }
  },
  family: {
    label: "Rodzina",
    areaM2: 75,
    defaults: { downPayment: 0.25, yearsInHome: 15, investmentProfile: "Bonds" }
  },
  investor: {
    label: "Zakup pod wynajem",
    areaM2: 45,
    defaults: { downPayment: 0.35, yearsInHome: 12, mortgageType: "variable", investmentProfile: "ETF" }
  }
};

export const defaultSettings: Settings = {
  scenario: "couple",
  areaM2: scenarios.couple.areaM2,
  yearsInHome: 10,
  mortgageRate: 0.069,
  mortgageType: "fixed",
  refinancing: true,
  secondaryMarket: true,
  downPayment: 0.2,
  originationFee: 0.015,
  notaryCost: 0.004,
  courtFees: 600,
  hoaPerM2: 15,
  maintenanceReserve: 0.01,
  hoaEscalation: 0.045,
  insuranceAnnual: 900,
  renovationAnnual: 0.006,
  homeAppreciation: 0.042,
  rentGrowth: 0.044,
  investmentReturn: 0.058,
  investmentProfile: "ETF",
  inflation: 0.035
};

export const money = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0
});

export const number = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1
});

export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
