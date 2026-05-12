import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { WarsawMap } from "@/components/map/WarsawMap";
import { DistrictSearch } from "@/components/map/DistrictSearch";
import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { BreakEvenHeadline } from "@/components/results/BreakEvenHeadline";
import { SpaghettiPlot } from "@/components/results/SpaghettiPlot";
import { SummaryCards } from "@/components/results/SummaryCards";
import { ShareButton } from "@/components/share/ShareButton";
import { ExportPdfButton } from "@/components/share/ExportPdfButton";
import { useMonteCarlo } from "@/lib/useMonteCarlo";
import { useCalcStore } from "@/store/useCalcStore";
import { decodeSettings, encodeSettings } from "@/lib/urlState";
import { useIsMobile } from "@/hooks/use-mobile";
import { GitCompare } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warsaw Rent vs Buy — Monte Carlo calculator" },
      {
        name: "description",
        content:
          "Interactive Warsaw real-estate rent-vs-buy calculator. 30-year Monte Carlo with district-level appreciation, mortgage modeling and break-even analysis.",
      },
      { property: "og:title", content: "Warsaw Rent vs Buy — Monte Carlo calculator" },
      {
        property: "og:description",
        content: "Should you rent or buy in your Warsaw district? 500-path Monte Carlo, sliders, share & export.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const isMobile = useIsMobile();
  const { result, loading } = useMonteCarlo();
  const setMany = useCalcStore((s) => s.setMany);
  const settings = useCalcStore((s) => s.settings);

  // Hydrate from URL hash once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const patch = decodeSettings(window.location.hash);
    if (Object.keys(patch).length) setMany(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror to hash on change (debounced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      const hash = encodeSettings(settings);
      window.history.replaceState(null, "", `#${hash}`);
    }, 250);
    return () => clearTimeout(t);
  }, [settings]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors theme="dark" />
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <span className="text-sm font-bold">W</span>
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">Warsaw Rent vs Buy</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Monte Carlo · 500 paths · 30y
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/compare">
              <Button variant="outline" size="sm">
                <GitCompare className="h-4 w-4" />
                Compare
              </Button>
            </Link>
            <ShareButton />
            <ExportPdfButton targetId="report-root" />
          </div>
        </div>
      </header>

      <main
        id="report-root"
        className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        <section className="flex flex-col gap-4">
          {isMobile && <DistrictSearch />}
          <div className="h-[420px] lg:h-[560px]">
            <WarsawMap />
          </div>
          <BreakEvenHeadline result={result} loading={loading} />
          <SpaghettiPlot result={result} />
          <SummaryCards result={result} />
        </section>
        <aside className="flex flex-col gap-4">
          <CalculatorPanel />
        </aside>
      </main>

      <footer className="mx-auto max-w-[1600px] px-4 py-6 text-[11px] text-muted-foreground">
        Estimates are illustrative 2025 figures. Run your own due diligence before any
        property decision. © Warsaw Rent vs Buy.
      </footer>
    </div>
  );
}
