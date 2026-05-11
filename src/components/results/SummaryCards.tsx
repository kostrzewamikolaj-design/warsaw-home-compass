import type { SimResult } from "@/workers/montecarlo.types";

const pln = (v: number) =>
  `${Math.round(v).toLocaleString("pl-PL")} PLN`;

function Card({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className="mt-1 text-base font-semibold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export function SummaryCards({ result }: { result: SimResult | null }) {
  if (!result) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label="Upfront cost" value={pln(result.upfront)} />
      <Card label="Total buy outflow" value={pln(result.totalBuyCost)} />
      <Card label="Total rent outflow" value={pln(result.totalRentCost)} />
      <Card label="Initial monthly buy" value={pln(result.monthlyBuy0)} accent="var(--primary)" />
    </div>
  );
}
