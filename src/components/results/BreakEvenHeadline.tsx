import { useEffect, useRef, useState } from "react";
import type { SimResult } from "@/workers/montecarlo.types";
import { Loader2 } from "lucide-react";

function useTween(target: number, duration = 600): number {
  const [v, setV] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    fromRef.current = v;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

export function BreakEvenHeadline({ result, loading }: { result: SimResult | null; loading: boolean }) {
  const target = result?.breakEvenYear ?? 0;
  const tweened = useTween(target);
  const noBreakEven = result && result.breakEvenYear === null;
  const buyWinsPct = result ? Math.round(result.probabilityBuyWins * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[var(--gradient-surface)] p-6 shadow-[var(--shadow-elegant)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        Monte Carlo result
        {loading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        {noBreakEven ? (
          <div className="text-3xl font-bold text-warning">Renting wins over 30 yrs</div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Break-even</div>
            <div className="text-6xl font-bold tabular-nums text-foreground">
              {tweened.toFixed(1)}
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">years</div>
          </>
        )}
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground">95% CI</div>
            <div className="font-semibold tabular-nums">
              {result.breakEvenP5 ? `${result.breakEvenP5.toFixed(1)}–${result.breakEvenP95?.toFixed(1)} yrs` : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Probability buying wins</div>
            <div className="font-semibold tabular-nums" style={{ color: buyWinsPct >= 50 ? "var(--success)" : "var(--warning)" }}>
              {buyWinsPct}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
