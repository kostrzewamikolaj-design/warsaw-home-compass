import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DISTRICTS, DISTRICT_BY_SLUG } from "@/data/districts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { SimInput, SimResult } from "@/workers/montecarlo.types";
import { DEFAULT_SETTINGS } from "@/store/useCalcStore";
import { SCENARIOS, DEFAULT_SCENARIO_ID } from "@/data/scenarios";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare districts — Warsaw Rent vs Buy" },
      { name: "description", content: "Compare break-even across Warsaw districts side by side." },
    ],
  }),
  component: ComparePage,
});

function buildInput(slug: string): SimInput {
  const d = DISTRICT_BY_SLUG[slug];
  const sc = SCENARIOS.find((s) => s.id === DEFAULT_SCENARIO_ID)!;
  return {
    pricePerM2: d.pricePerM2,
    sizeM2: sc.sizeM2,
    rentMonthly: (d.rent50m2 / 50) * sc.sizeM2,
    band: d.band,
    rateAnnual: DEFAULT_SETTINGS.rateAnnual,
    rateMode: DEFAULT_SETTINGS.rateMode,
    refinance: DEFAULT_SETTINGS.refinance,
    termYears: DEFAULT_SETTINGS.termYears,
    downPaymentPct: DEFAULT_SETTINGS.downPaymentPct,
    originationPct: DEFAULT_SETTINGS.originationPct,
    secondary: DEFAULT_SETTINGS.secondary,
    hoaMonthly: DEFAULT_SETTINGS.hoaMonthly * sc.sizeM2,
    hoaEscalation: DEFAULT_SETTINGS.hoaEscalation,
    maintenancePctOfPrice: DEFAULT_SETTINGS.maintenancePctOfPrice,
    insuranceAnnual: DEFAULT_SETTINGS.insuranceAnnual,
    rentGrowth: DEFAULT_SETTINGS.rentGrowth,
    inflation: DEFAULT_SETTINGS.inflation,
    investmentReturn: DEFAULT_SETTINGS.investmentReturn,
    yearsHorizon: 30,
    paths: 300,
    seed: 42,
  };
}

function ComparePage() {
  const [picked, setPicked] = useState<string[]>(["mokotow", "wola", "bialoleka"]);
  const [results, setResults] = useState<Record<string, SimResult>>({});

  useEffect(() => {
    let cancelled = false;
    const w = new Worker(new URL("../workers/montecarlo.worker.ts", import.meta.url), { type: "module" });
    const queue = [...picked];
    const out: Record<string, SimResult> = {};
    const next = () => {
      const slug = queue.shift();
      if (!slug) {
        w.terminate();
        if (!cancelled) setResults(out);
        return;
      }
      w.onmessage = (e: MessageEvent<SimResult>) => {
        out[slug] = e.data;
        next();
      };
      w.postMessage(buildInput(slug));
    };
    next();
    return () => {
      cancelled = true;
      w.terminate();
    };
  }, [picked]);

  const winner = useMemo(() => {
    const entries = Object.entries(results);
    if (!entries.length) return null;
    return entries.reduce((best, [slug, r]) => {
      const be = r.breakEvenYear ?? 999;
      if (!best || be < best.be) return { slug, be };
      return best;
    }, null as { slug: string; be: number } | null);
  }, [results]);

  const toggle = (slug: string) => {
    setPicked((cur) =>
      cur.includes(slug)
        ? cur.filter((s) => s !== slug)
        : cur.length < 4
          ? [...cur, slug]
          : cur,
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
          <h1 className="text-lg font-semibold">Compare districts</h1>
          <div />
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {DISTRICTS.map((d) => {
            const active = picked.includes(d.slug);
            return (
              <button
                key={d.slug}
                onClick={() => toggle(d.slug)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {picked.map((slug) => {
            const d = DISTRICT_BY_SLUG[slug];
            const r = results[slug];
            const isWinner = winner?.slug === slug;
            return (
              <div
                key={slug}
                className={`rounded-2xl border p-4 shadow-[var(--shadow-elegant)] ${
                  isWinner ? "border-success bg-success/10" : "border-border bg-card"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">{d.name}</div>
                  {isWinner && <Badge className="bg-success text-success-foreground">Winner</Badge>}
                </div>
                <Badge variant="secondary" className="mb-3 text-[10px]">{d.band}</Badge>
                <div className="text-[11px] text-muted-foreground">Break-even (median)</div>
                <div className="text-3xl font-bold tabular-nums">
                  {r ? (r.breakEvenYear ?? "—") : "…"}
                  {r?.breakEvenYear && <span className="ml-1 text-base font-medium text-muted-foreground">yrs</span>}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Buy wins</div>
                    <div className="font-semibold tabular-nums">{r ? `${Math.round(r.probabilityBuyWins * 100)}%` : "…"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Price/m²</div>
                    <div className="font-semibold tabular-nums">{d.pricePerM2.toLocaleString("pl-PL")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
