import type { DistrictMarket } from "@/lib/districts";
import type { Settings, SimulationRequest, SimulationResult, SimulationSummary } from "@/lib/model";

const months = 360;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const normal = (random: () => number) => {
  const u = 1 - random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const payment = (principal: number, annualRate: number, remainingMonths: number) => {
  if (remainingMonths <= 0 || principal <= 0) return 0;
  const monthly = annualRate / 12;
  if (Math.abs(monthly) < 0.000001) return principal / remainingMonths;
  return (principal * monthly) / (1 - (1 + monthly) ** -remainingMonths);
};

const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
};

const districtMean = (district: DistrictMarket, settingMean: number) => {
  const mid = (district.appreciationRange[0] + district.appreciationRange[1]) / 2;
  return settingMean * 0.65 + mid * 0.35;
};

const districtVol = (district: DistrictMarket) => {
  switch (district.band) {
    case "Premium":
      return 0.055;
    case "Stable":
      return 0.046;
    case "Growth":
      return 0.066;
    case "Emerging":
      return 0.078;
    default:
      return 0.062;
  }
};

const simulateDistrict = (
  district: DistrictMarket,
  settings: Settings,
  pathCount: number,
  seedOffset: number
): { summary: SimulationSummary; yearly: SimulationResult["yearly"]; paths: SimulationResult["paths"] } => {
  const purchasePrice = district.pricePerM2 * settings.areaM2;
  const monthlyRent = district.rentPerM2 * settings.areaM2;
  const downPaymentCash = purchasePrice * settings.downPayment;
  const mortgagePrincipal = purchasePrice - downPaymentCash;
  const pcc = settings.secondaryMarket ? purchasePrice * 0.02 : 0;
  const upfrontCash =
    downPaymentCash + mortgagePrincipal * settings.originationFee + purchasePrice * settings.notaryCost + pcc + settings.courtFees;
  const firstPayment = payment(mortgagePrincipal, settings.mortgageRate, months);
  const horizonMonth = clamp(Math.round(settings.yearsInHome * 12), 12, months);
  const random = mulberry32(
    Math.floor(
      seedOffset +
        purchasePrice +
        settings.areaM2 * 997 +
        settings.mortgageRate * 100000 +
        settings.investmentReturn * 100000
    )
  );

  const allYearlyDiffs: number[][] = Array.from({ length: 31 }, () => []);
  const breakEvens: number[] = [];
  const spaghetti: SimulationResult["paths"] = [];
  const horizonDiffs: number[] = [];
  let wins = 0;

  for (let path = 0; path < pathCount; path += 1) {
    let homeValue = purchasePrice;
    let loanBalance = mortgagePrincipal;
    let rent = monthlyRent;
    let hoa = settings.hoaPerM2 * settings.areaM2;
    let rentPortfolio = upfrontCash;
    let buyPortfolio = 0;
    let currentMortgageRate = settings.mortgageRate;
    let currentPayment = firstPayment;
    let breakEven: number | null = null;
    const pathPoints = [];
    const appreciationMean = districtMean(district, settings.homeAppreciation);
    const appreciationSd = districtVol(district);
    const investmentSd =
      settings.investmentProfile === "ETF" ? 0.125 : settings.investmentProfile === "Bonds" ? 0.055 : 0.018;

    for (let month = 1; month <= months; month += 1) {
      if ((month - 1) % 12 === 0) {
        const inflation = clamp(settings.inflation + normal(random) * 0.012, -0.01, 0.12);
        const appreciation = clamp(appreciationMean + normal(random) * appreciationSd, -0.12, 0.18);
        const rentGrowth = clamp(settings.rentGrowth + normal(random) * 0.028, -0.04, 0.16);
        const investmentReturn = clamp(settings.investmentReturn + normal(random) * investmentSd, -0.28, 0.32);
        const rateShock = normal(random) * 0.009 + (inflation - settings.inflation) * 0.25;

        for (let inner = 0; inner < 12 && month + inner <= months + 1; inner += 1) {
          homeValue *= (1 + appreciation) ** (1 / 12);
          rent *= (1 + rentGrowth) ** (1 / 12);
          hoa *= (1 + Math.max(settings.hoaEscalation, inflation * 0.9)) ** (1 / 12);
          rentPortfolio *= (1 + investmentReturn) ** (1 / 12);
          buyPortfolio *= (1 + investmentReturn) ** (1 / 12);
        }

        if (settings.mortgageType === "variable" || (settings.mortgageType === "fixed" && month > 60)) {
          currentMortgageRate = clamp(settings.mortgageRate + rateShock, 0.018, 0.125);
          currentPayment = payment(loanBalance, currentMortgageRate, months - month + 1);
        }

        if (settings.refinancing && month > 60 && currentMortgageRate - settings.mortgageRate > 0.012) {
          loanBalance += loanBalance * 0.004;
          currentMortgageRate = Math.max(settings.mortgageRate, currentMortgageRate - 0.01);
          currentPayment = payment(loanBalance, currentMortgageRate, months - month + 1);
        }
      }

      const interest = (loanBalance * currentMortgageRate) / 12;
      const principal = Math.min(Math.max(currentPayment - interest, 0), loanBalance);
      loanBalance -= principal;

      const insurance = (settings.insuranceAnnual * (1 + settings.inflation) ** (month / 12)) / 12;
      const renovation = (purchasePrice * settings.renovationAnnual) / 12;
      const reserve = (homeValue * settings.maintenanceReserve) / 12;
      const buyCost = currentPayment + hoa + insurance + renovation + reserve;
      const rentCost = rent;

      if (buyCost > rentCost) {
        rentPortfolio += buyCost - rentCost;
      } else {
        buyPortfolio += rentCost - buyCost;
      }

      if (month % 12 === 0) {
        const year = month / 12;
        const sellCost = homeValue * 0.025;
        const buyWealth = homeValue - loanBalance - sellCost + buyPortfolio;
        const rentWealth = rentPortfolio;
        const delta = buyWealth - rentWealth;
        allYearlyDiffs[year].push(delta);
        if (breakEven === null && delta >= 0) {
          breakEven = year;
        }
        if (path < 56) pathPoints.push({ year, value: Math.round(delta) });
        if (month === horizonMonth) {
          horizonDiffs.push(delta);
          if (delta >= 0) wins += 1;
        }
      }
    }

    if (breakEven !== null) breakEvens.push(breakEven);
    if (path < 56) spaghetti.push(pathPoints);
  }

  const yearly = allYearlyDiffs.slice(1).map((values, index) => ({
    year: index + 1,
    p05: Math.round(percentile(values, 0.05)),
    p25: Math.round(percentile(values, 0.25)),
    p50: Math.round(percentile(values, 0.5)),
    p75: Math.round(percentile(values, 0.75)),
    p95: Math.round(percentile(values, 0.95))
  }));

  const summary: SimulationSummary = {
    districtName: district.name,
    breakEvenMedian: breakEvens.length ? percentile(breakEvens, 0.5) : null,
    breakEvenLow: breakEvens.length ? percentile(breakEvens, 0.025) : null,
    breakEvenHigh: breakEvens.length ? percentile(breakEvens, 0.975) : null,
    finalMedianDelta: Math.round(percentile(horizonDiffs, 0.5)),
    finalLowDelta: Math.round(percentile(horizonDiffs, 0.05)),
    finalHighDelta: Math.round(percentile(horizonDiffs, 0.95)),
    buyWinsAtHorizon: wins / pathCount,
    upfrontCash: Math.round(upfrontCash),
    monthlyPayment: Math.round(firstPayment),
    purchasePrice: Math.round(purchasePrice),
    monthlyRent: Math.round(monthlyRent)
  };

  return { summary, yearly, paths: spaghetti };
};

self.onmessage = (event: MessageEvent<SimulationRequest>) => {
  const { district, compareDistrict, settings, paths } = event.data;
  const count = Math.max(500, paths);
  const primary = simulateDistrict(district, settings, count, 19);
  const compare = compareDistrict ? simulateDistrict(compareDistrict, settings, count, 2027) : null;

  const result: SimulationResult = {
    ...primary,
    compareSummary: compare?.summary
  };

  self.postMessage(result);
};
