import type { AppreciationBand } from "@/data/districts";

export interface SimInput {
  // Property
  pricePerM2: number;
  sizeM2: number;
  rentMonthly: number; // initial monthly rent for the unit
  band: AppreciationBand;

  // Mortgage
  rateAnnual: number; // base mortgage rate (decimal)
  rateMode: "fixed" | "variable";
  refinance: boolean;
  termYears: number; // typically 30
  downPaymentPct: number;
  originationPct: number;
  secondary: boolean;

  // Recurring costs
  hoaMonthly: number; // PLN/month flat fee
  hoaEscalation: number; // annual %
  maintenancePctOfPrice: number; // annual % of property value
  insuranceAnnual: number; // PLN/year

  // Market assumptions (means, decimals)
  rentGrowth: number;
  inflation: number;
  investmentReturn: number;

  // Sim
  yearsHorizon: number; // typically 30
  paths: number; // 500 default
  seed: number;
}

export interface SimResult {
  years: number[]; // 0..yearsHorizon
  // Yearly net-worth difference (Buy − Rent+Invest), nominal PLN
  median: number[];
  p5: number[];
  p95: number[];
  // Sample subset of full paths for spaghetti rendering
  samplePaths: number[][];
  breakEvenYear: number | null; // first year median ≥ 0
  breakEvenP5: number | null;
  breakEvenP95: number | null;
  probabilityBuyWins: number; // at horizon
  upfront: number;
  totalBuyCost: number; // median nominal at horizon
  totalRentCost: number; // median nominal at horizon
  monthlyBuy0: number; // initial monthly outflow buying
  monthlyRent0: number;
}
