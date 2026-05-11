/** Fixed-rate monthly amortization payment */
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Polish PCC tax (2% on secondary market, 0 for primary) */
export function pccTax(price: number, secondary: boolean): number {
  return secondary ? price * 0.02 : 0;
}

/** Notary cost — taksa notarialna approximation */
export function notaryCost(price: number): number {
  // simplified scale
  if (price <= 60_000) return 1010 + price * 0.004;
  if (price <= 1_000_000) return 4770 + (price - 60_000) * 0.002;
  if (price <= 2_000_000) return 22_770 + (price - 1_000_000) * 0.0025;
  return 60_000 + (price - 2_000_000) * 0.0025;
}

/** Court / land registry flat fees in PLN */
export const COURT_FEES = 460;

export interface UpfrontCosts {
  downPayment: number;
  pcc: number;
  notary: number;
  origination: number;
  court: number;
  total: number;
}

export function computeUpfront(
  price: number,
  downPaymentPct: number,
  originationPct: number,
  secondary: boolean,
): UpfrontCosts {
  const downPayment = price * downPaymentPct;
  const loan = price - downPayment;
  const pcc = pccTax(price, secondary);
  const notary = notaryCost(price);
  const origination = loan * originationPct;
  const court = COURT_FEES;
  return {
    downPayment,
    pcc,
    notary,
    origination,
    court,
    total: downPayment + pcc + notary + origination + court,
  };
}
