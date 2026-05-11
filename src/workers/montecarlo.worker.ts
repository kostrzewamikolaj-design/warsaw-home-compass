/// <reference lib="webworker" />
import { mulberry32, makeNormal } from "@/lib/rng";
import { computeUpfront, monthlyPayment } from "@/lib/finance";
import { BAND_PARAMS } from "@/data/districts";
import type { SimInput, SimResult } from "./montecarlo.types";

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function simulate(input: SimInput): SimResult {
  const {
    pricePerM2,
    sizeM2,
    rentMonthly,
    band,
    rateAnnual,
    rateMode,
    refinance,
    termYears,
    downPaymentPct,
    originationPct,
    secondary,
    hoaMonthly,
    hoaEscalation,
    maintenancePctOfPrice,
    insuranceAnnual,
    rentGrowth,
    inflation,
    investmentReturn,
    yearsHorizon,
    paths,
    seed,
  } = input;

  const price = pricePerM2 * sizeM2;
  const upfront = computeUpfront(price, downPaymentPct, originationPct, secondary);
  const loan0 = price - upfront.downPayment;
  const months = termYears * 12;
  const horizonMonths = yearsHorizon * 12;

  const bandParams = BAND_PARAMS[band];

  const rng = mulberry32(seed);
  const normal = makeNormal(rng);

  const yearsArr = Array.from({ length: yearsHorizon + 1 }, (_, i) => i);
  const allDiffs: number[][] = []; // [path][year]
  const samplePaths: number[][] = [];
  const sampleEvery = Math.max(1, Math.floor(paths / 120)); // ~120 spaghetti lines

  let totalBuyAcc = 0;
  let totalRentAcc = 0;
  let buyWins = 0;
  const breakEvenYears: number[] = [];

  const monthlyBuy0Base =
    monthlyPayment(loan0, rateAnnual, months) +
    hoaMonthly +
    insuranceAnnual / 12 +
    (price * maintenancePctOfPrice) / 12;

  for (let p = 0; p < paths; p++) {
    const apprMean = bandParams.mean;
    const apprStd = bandParams.stdev;
    // Sample yearly factors per path (correlated minimally)
    const yearAppr = Array.from({ length: yearsHorizon }, () => normal(apprMean, apprStd));
    const yearRentG = Array.from({ length: yearsHorizon }, () => normal(rentGrowth, 0.015));
    const yearInfl = Array.from({ length: yearsHorizon }, () => normal(inflation, 0.012));
    const yearInv = Array.from({ length: yearsHorizon }, () => normal(investmentReturn, 0.08));

    // Variable rate path
    const yearRate = Array.from({ length: yearsHorizon }, (_, y) => {
      if (rateMode === "fixed") return rateAnnual;
      // mean-revert around rateAnnual with shocks
      return Math.max(0.005, normal(rateAnnual, 0.012));
    });

    let homeValue = price;
    let loanBalance = loan0;
    let currentRate = rateAnnual;
    let pmt = monthlyPayment(loan0, currentRate, months);
    let hoa = hoaMonthly;
    let rent = rentMonthly;
    let portfolio = 0; // rent track investment portfolio
    let buyOutflowCum = upfront.total;
    let rentOutflowCum = 0;

    const diffsPerYear: number[] = [0];

    let breakEvenForPath: number | null = null;

    for (let y = 0; y < yearsHorizon; y++) {
      // Refinance check at year boundary
      if (refinance && rateMode === "variable") {
        const yr = yearRate[y];
        if (yr < currentRate - 0.0075 && y < termYears - 1) {
          currentRate = yr;
          const remainingMonths = months - y * 12;
          pmt = monthlyPayment(loanBalance, currentRate, remainingMonths);
        }
      } else if (rateMode === "variable") {
        currentRate = yearRate[y];
        const remainingMonths = months - y * 12;
        if (remainingMonths > 0) pmt = monthlyPayment(loanBalance, currentRate, remainingMonths);
      }

      const monthlyAppr = Math.pow(1 + yearAppr[y], 1 / 12) - 1;
      const monthlyRentG = Math.pow(1 + yearRentG[y], 1 / 12) - 1;
      const monthlyInv = Math.pow(1 + yearInv[y], 1 / 12) - 1;
      const maintenanceMonthly = (homeValue * maintenancePctOfPrice) / 12;
      const insuranceMonthly = insuranceAnnual / 12;

      for (let m = 0; m < 12; m++) {
        // Mortgage payment split
        let interest = loanBalance * (currentRate / 12);
        let principal = pmt - interest;
        if (loanBalance <= 0) {
          interest = 0;
          principal = 0;
        } else if (principal > loanBalance) {
          principal = loanBalance;
        }
        loanBalance = Math.max(0, loanBalance - principal);
        const buyMonthly =
          (loanBalance > 0 || principal > 0 ? interest + principal : 0) +
          hoa +
          maintenanceMonthly +
          insuranceMonthly;

        const rentMonthly_ = rent;
        const delta = buyMonthly - rentMonthly_;
        if (delta > 0) {
          // renter invests the delta
          portfolio = portfolio * (1 + monthlyInv) + delta;
        } else {
          portfolio = portfolio * (1 + monthlyInv);
        }

        buyOutflowCum += buyMonthly;
        rentOutflowCum += rentMonthly_;

        homeValue *= 1 + monthlyAppr;
        rent *= 1 + monthlyRentG;
      }

      hoa *= 1 + hoaEscalation;

      // End-of-year net worth comparison
      const buyEquity = homeValue - loanBalance;
      // Renter's net worth contribution: down payment + upfront went into property,
      // but renter would have invested upfront instead. Add upfront grown at investment rate.
      const renterUpfront = upfront.total * Math.pow(1 + investmentReturn, y + 1);
      const renterNet = portfolio + renterUpfront;
      const buyerNet = buyEquity; // upfront already spent, now equity is the asset
      const diff = buyerNet - renterNet;
      diffsPerYear.push(diff);
      if (breakEvenForPath === null && diff >= 0 && y > 0) breakEvenForPath = y + 1;
    }

    allDiffs.push(diffsPerYear);
    if (p % sampleEvery === 0) samplePaths.push(diffsPerYear);

    if (breakEvenForPath !== null) breakEvenYears.push(breakEvenForPath);
    if (diffsPerYear[diffsPerYear.length - 1] > 0) buyWins++;
    totalBuyAcc += buyOutflowCum;
    totalRentAcc += rentOutflowCum;
  }

  // Per-year quantiles
  const median: number[] = [];
  const p5: number[] = [];
  const p95: number[] = [];
  for (let y = 0; y <= yearsHorizon; y++) {
    const col = allDiffs.map((row) => row[y]).sort((a, b) => a - b);
    median.push(quantile(col, 0.5));
    p5.push(quantile(col, 0.05));
    p95.push(quantile(col, 0.95));
  }

  // Median break-even from yearly medians
  let breakEvenYear: number | null = null;
  for (let y = 1; y <= yearsHorizon; y++) {
    if (median[y] >= 0) {
      breakEvenYear = y;
      break;
    }
  }

  const sortedBE = [...breakEvenYears].sort((a, b) => a - b);
  const breakEvenP5 = sortedBE.length ? quantile(sortedBE, 0.05) : null;
  const breakEvenP95 = sortedBE.length ? quantile(sortedBE, 0.95) : null;

  return {
    years: yearsArr,
    median,
    p5,
    p95,
    samplePaths,
    breakEvenYear,
    breakEvenP5,
    breakEvenP95,
    probabilityBuyWins: buyWins / paths,
    upfront: upfront.total,
    totalBuyCost: totalBuyAcc / paths,
    totalRentCost: totalRentAcc / paths,
    monthlyBuy0: monthlyBuy0Base,
    monthlyRent0: rentMonthly,
  };
}

self.onmessage = (e: MessageEvent<SimInput>) => {
  const result = simulate(e.data);
  (self as unknown as Worker).postMessage(result);
};

export {};
