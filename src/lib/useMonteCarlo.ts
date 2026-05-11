import { useEffect, useMemo, useRef, useState } from "react";
import { useCalcStore, useCurrentDistrict, useCurrentScenario } from "@/store/useCalcStore";
import type { SimInput, SimResult } from "@/workers/montecarlo.types";

export function useMonteCarlo(): { result: SimResult | null; loading: boolean } {
  const settings = useCalcStore((s) => s.settings);
  const district = useCurrentDistrict();
  const scenario = useCurrentScenario();
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const w = new Worker(new URL("../workers/montecarlo.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent<SimResult>) => {
      setResult(e.data);
      setLoading(false);
    };
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const input: SimInput = useMemo(() => {
    const pricePerM2 = settings.pricePerM2Override ?? district.pricePerM2;
    const rent50 = settings.rent50Override ?? district.rent50m2;
    const rentMonthly = (rent50 / 50) * scenario.sizeM2 * scenario.rentMultiplier;
    return {
      pricePerM2,
      sizeM2: scenario.sizeM2,
      rentMonthly,
      band: district.band,
      rateAnnual: settings.rateAnnual,
      rateMode: settings.rateMode,
      refinance: settings.refinance,
      termYears: settings.termYears,
      downPaymentPct: settings.downPaymentPct,
      originationPct: settings.originationPct,
      secondary: settings.secondary,
      hoaMonthly: settings.hoaMonthly * scenario.sizeM2,
      hoaEscalation: settings.hoaEscalation,
      maintenancePctOfPrice: settings.maintenancePctOfPrice,
      insuranceAnnual: settings.insuranceAnnual,
      rentGrowth: settings.rentGrowth,
      inflation: settings.inflation,
      investmentReturn: settings.investmentReturn,
      yearsHorizon: 30,
      paths: settings.paths,
      seed: 42,
    };
  }, [settings, district, scenario]);

  useEffect(() => {
    if (!workerRef.current) return;
    setLoading(true);
    const t = setTimeout(() => {
      workerRef.current?.postMessage(input);
    }, 150);
    return () => clearTimeout(t);
  }, [input]);

  return { result, loading };
}
