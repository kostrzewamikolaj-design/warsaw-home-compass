"use client";

import bbox from "@turf/bbox";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Download,
  FileText,
  Grid2X2,
  Heart,
  Home,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  TrendingUp
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { FeatureCollection } from "geojson";
import { dataLastUpdated, dataSourceNote, districtById, districtByName, districts, type DistrictMarket } from "@/lib/districts";
import {
  defaultSettings,
  money,
  number,
  percent,
  scenarios,
  type ScenarioKey,
  type Settings,
  type SimulationResult,
  type SimulationSummary
} from "@/lib/model";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
mapboxgl.accessToken = mapboxToken;

const cartoPositron = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const ratioColor = (ratio: number) => {
  const t = Math.max(0, Math.min(1, (ratio - 0.006) / 0.0045));
  const from = [230, 237, 255];
  const mid = [125, 98, 255];
  const to = [0, 175, 191];
  const mix = t < 0.58 ? t / 0.58 : (t - 0.58) / 0.42;
  const a = t < 0.58 ? from : mid;
  const b = t < 0.58 ? mid : to;
  const rgb = a.map((channel, index) => Math.round(channel + (b[index] - channel) * mix));
  return `rgb(${rgb.join(",")})`;
};

const svgBounds = {
  minLon: 20.84,
  maxLon: 21.275,
  minLat: 52.095,
  maxLat: 52.37,
  width: 1000,
  height: 760
};

const projectPoint = ([lon, lat]: number[]) => {
  const x = ((lon - svgBounds.minLon) / (svgBounds.maxLon - svgBounds.minLon)) * svgBounds.width;
  const y = ((svgBounds.maxLat - lat) / (svgBounds.maxLat - svgBounds.minLat)) * svgBounds.height;
  return [x, y];
};

const polygonPath = (coordinates: number[][][]) =>
  coordinates
    .map((ring) =>
      ring
        .filter((_, index) => index % 5 === 0)
        .map((point, index) => {
          const [x, y] = projectPoint(point);
          return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
        .concat(" Z")
    )
    .join(" ");

const normalizedKeyPart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const formatYear = (value: number | null) => (value === null ? "Brak progu" : `${number.format(value)} lat`);

const bandLabels = {
  Premium: "najdroższe dzielnice",
  Stable: "stabilne dzielnice",
  Growth: "szybszy wzrost",
  Emerging: "tańszy start",
  "Outer value": "poza centrum"
} as const;

const mvpDisclaimer =
  "To narzędzie opiera się na statycznych, szacunkowych danych. Nie jest poradą finansową, kredytową, prawną ani inwestycyjną. Przed decyzją sprawdź aktualne oferty, warunki kredytu i własne założenia.";
const simulationPathCount = 560;
const chartPreviewPathCount = 36;

const hashState = (districtId: string, compareId: string | null, settings: Settings) => {
  const payload = JSON.stringify({ districtId, compareId, settings });
  return btoa(encodeURIComponent(payload));
};

const numericSettingRanges: Partial<Record<keyof Settings, [number, number]>> = {
  areaM2: [25, 110],
  yearsInHome: [1, 30],
  mortgageRate: [0.025, 0.105],
  downPayment: [0.1, 0.6],
  originationFee: [0, 0.05],
  notaryCost: [0, 0.03],
  courtFees: [0, 5000],
  hoaPerM2: [0, 60],
  maintenanceReserve: [0, 0.05],
  hoaEscalation: [0, 0.12],
  insuranceAnnual: [0, 5000],
  renovationAnnual: [0, 0.05],
  homeAppreciation: [-0.01, 0.09],
  rentGrowth: [0, 0.1],
  investmentReturn: [0.005, 0.105],
  inflation: [0.005, 0.085]
};

const isScenarioKey = (value: unknown): value is ScenarioKey => typeof value === "string" && value in scenarios;
const mortgageTypes = new Set(["fixed", "variable"]);
const investmentProfiles = new Set(["ETF", "Bonds", "Savings"]);

const clampNumber = (value: unknown, fallback: number, [min, max]: [number, number]) => {
  const numericValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, numericValue));
};

const sanitizeRestoredSettings = (settings: Partial<Settings>, current: Settings): Settings => {
  const next = { ...current };

  if (isScenarioKey(settings.scenario)) next.scenario = settings.scenario;
  if (typeof settings.mortgageType === "string" && mortgageTypes.has(settings.mortgageType)) next.mortgageType = settings.mortgageType as Settings["mortgageType"];
  if (typeof settings.investmentProfile === "string" && investmentProfiles.has(settings.investmentProfile)) {
    next.investmentProfile = settings.investmentProfile as Settings["investmentProfile"];
  }
  if (typeof settings.refinancing === "boolean") next.refinancing = settings.refinancing;
  if (typeof settings.secondaryMarket === "boolean") next.secondaryMarket = settings.secondaryMarket;

  (Object.entries(numericSettingRanges) as Array<[keyof Settings, [number, number]]>).forEach(([key, range]) => {
    if (key in settings) {
      next[key] = clampNumber(settings[key], current[key] as number, range) as never;
    }
  });

  return next;
};

const parseHash = () => {
  if (typeof window === "undefined" || window.location.hash.length < 2) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(window.location.hash.slice(1)))) as {
      districtId?: string;
      compareId?: string | null;
      settings?: Partial<Settings>;
    };
  } catch {
    return null;
  }
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  hint,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value));
  };

  return (
    <label className="control">
      <span>
        {label}
        <strong>{format(value)}</strong>
      </span>
      <input
        aria-label={`${label} ${format(value)}`}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button className={`toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)} type="button">
      <span>{label}</span>
      <i />
    </button>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  disabled = false
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      disabled={disabled}
      title={disabled ? "Jeszcze niedostępne w tej wersji" : undefined}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MetricTile({
  label,
  value,
  delta,
  accent = "blue"
}: {
  label: string;
  value: string;
  delta?: string;
  accent?: "blue" | "violet" | "teal";
}) {
  return (
    <div className={`metric-tile ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {delta ? <small>{delta}</small> : null}
    </div>
  );
}

function DistrictCard({
  district,
  summary,
  selected,
  index,
  reduceMotion = false
}: {
  district: DistrictMarket;
  summary?: SimulationSummary;
  selected: boolean;
  index: number;
  reduceMotion?: boolean;
}) {
  const ratio = district.rentPerM2 / district.pricePerM2;
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={`district-card ${selected ? "selected" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      layout
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut", layout: { duration: reduceMotion ? 0 : 0.18 } }}
    >
      <header>
        <div className="district-title">
          <i>{index}</i>
          <div>
            <h3>{district.name}</h3>
            <span>{bandLabels[district.band]}</span>
          </div>
        </div>
        <button type="button" aria-label="Więcej akcji dla dzielnicy">
          <MoreVertical size={18} />
        </button>
      </header>
      <div className="district-metrics">
        <MetricTile label="Cena za m²" value={`${number.format(district.pricePerM2)} zł`} delta="szacunek" accent="blue" />
        <MetricTile label="Najem za m² miesięcznie" value={`${number.format(district.rentPerM2)} zł`} delta="stawka najmu" accent="teal" />
        <MetricTile label="Miesięczny najem względem ceny" value={percent(ratio)} delta={bandLabels[district.band]} accent="violet" />
        <MetricTile label="Kiedy zakup się broni" value={formatYear(summary?.breakEvenMedian ?? null)} delta="środkowy wynik" accent="blue" />
        <MetricTile label="Zakup ma przewagę" value={`${Math.round((summary?.buyWinsAtHorizon ?? 0) * 100)}%`} delta="w tym okresie" accent="teal" />
        <MetricTile label="Różnica po latach" value={money.format(summary?.finalMedianDelta ?? 0)} delta="zakup minus najem" accent="violet" />
      </div>
    </motion.article>
  );
}

export default function Dashboard() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [selectedId, setSelectedId] = useState("mokotow");
  const [compareId, setCompareId] = useState<string | null>("wola");
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings });
  const [simSettings, setSimSettings] = useState<Settings>({ ...defaultSettings });
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [geojsonFailed, setGeojsonFailed] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const actionMessageIdRef = useRef(0);
  const actionTimerRef = useRef<number | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const selected = districtById.get(selectedId) ?? districts[0];
  const compare = compareId ? districtById.get(compareId) ?? null : null;
  const selectedDistricts = [selected, compare].filter(Boolean) as DistrictMarket[];

  const nextAvailableCompareId = useCallback(
    (primaryId: string, preferredId = "zoliborz") => {
      if (preferredId !== primaryId && districtById.has(preferredId)) return preferredId;
      return districts.find((district) => district.id !== primaryId)?.id ?? null;
    },
    []
  );

  const selectDistrict = useCallback((districtId: string) => {
    if (!districtById.has(districtId)) return;
    setSelectedId(districtId);
    setCompareId((current) => (current === districtId ? null : current));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSimSettings(settings), 150);
    return () => window.clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    const restored = parseHash();
    if (!restored) return;
    const nextSelectedId = restored.districtId && districtById.has(restored.districtId) ? restored.districtId : selectedId;
    const nextCompareId =
      restored.compareId === null
        ? null
        : restored.compareId && districtById.has(restored.compareId) && restored.compareId !== nextSelectedId
          ? restored.compareId
          : compareId !== nextSelectedId && compareId && districtById.has(compareId)
            ? compareId
            : null;

    setSelectedId(nextSelectedId);
    setCompareId(nextCompareId);
    if (restored.settings) {
      setSettings((current) => sanitizeRestoredSettings(restored.settings ?? {}, current));
    }
  }, []);

  const enrichedGeojson = useMemo(() => {
    if (!geojson) return null;
    return {
      ...geojson,
      features: geojson.features.map((feature) => {
        const name = String(feature.properties?.name ?? "");
        const market = districtByName.get(name);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ratio: market ? market.rentPerM2 / market.pricePerM2 : 0,
            pricePerM2: market?.pricePerM2,
            rentPerM2: market?.rentPerM2,
            band: market?.band
          }
        };
      })
    } satisfies FeatureCollection;
  }, [geojson]);

  const runSimulation = useCallback(() => {
    if (!workerRef.current) return;
    setIsRunning(true);
    workerRef.current.postMessage({
      district: selected,
      compareDistrict: compare,
      settings: simSettings,
      paths: simulationPathCount
    });
  }, [compare, selected, simSettings]);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/monteCarlo.worker.ts", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (event: MessageEvent<SimulationResult>) => {
      setResult(event.data);
      setIsRunning(false);
    };
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    fetch("/data/warsaw-districts.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("District GeoJSON failed to load");
        return response.json() as Promise<FeatureCollection>;
      })
      .then((data) => {
        setGeojson(data);
        setGeojsonFailed(false);
      })
      .catch(() => {
        setGeojson(null);
        setGeojsonFailed(true);
      });
  }, []);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapRef.current || !enrichedGeojson || window.innerWidth < 960) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: cartoPositron,
      center: [21.0122, 52.2297],
      zoom: 9.2,
      attributionControl: false,
      interactive: false
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    map.on("load", () => {
      map.addSource("districts", { type: "geojson", data: enrichedGeojson });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [enrichedGeojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enrichedGeojson || !map.getSource("districts")) return;
    const districtFeature = enrichedGeojson.features.find(
      (feature) => String((feature.properties as { name?: string } | null)?.name ?? "") === selected.name
    );
    if (districtFeature) {
      const [west, south, east, north] = bbox(districtFeature);
      map.fitBounds(
        [
          [west, south],
          [east, north]
        ],
        { padding: 72, duration: prefersReducedMotion ? 0 : 900, essential: false }
      );
    }
  }, [enrichedGeojson, prefersReducedMotion, selected.name]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  const flashActionMessage = (message: string, duration = 4600) => {
    actionMessageIdRef.current += 1;
    const messageId = actionMessageIdRef.current;
    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
    }
    setActionMessage(message);
    actionTimerRef.current = window.setTimeout(() => {
      if (actionMessageIdRef.current === messageId) {
        setActionMessage("");
        actionTimerRef.current = null;
      }
    }, duration);
  };

  useEffect(() => {
    const pendingMessage = window.sessionStorage.getItem("dashboard-action-message");
    if (!pendingMessage) return;
    window.sessionStorage.removeItem("dashboard-action-message");
    flashActionMessage(pendingMessage);
  }, []);

  const applyScenario = (key: ScenarioKey) => {
    const scenario = scenarios[key];
    setSettings((current) => ({ ...current, scenario: key, areaM2: scenario.areaM2, ...scenario.defaults }));
  };

  const share = async () => {
    const hash = hashState(selectedId, compareId, settings);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    const fallbackMessage = "Link jest w pasku adresu.";
    window.sessionStorage.setItem("dashboard-action-message", fallbackMessage);
    window.history.replaceState(window.history.state, "", `#${hash}`);
    flashActionMessage(fallbackMessage);
    window.setTimeout(() => window.sessionStorage.removeItem("dashboard-action-message"), 5000);

    if (navigator.clipboard?.writeText) {
      void Promise.race([
        navigator.clipboard.writeText(url),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("Clipboard timeout")), 1200))
      ])
        .then(() => flashActionMessage("Link skopiowany."))
        .catch(() => undefined);
    }
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    flashActionMessage("Przygotowuję PDF...", 12000);
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#f7f9ff", scale: 1.35 });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`warszawa-najem-czy-zakup-${selected.id}.pdf`);
      flashActionMessage("PDF jest gotowy.");
    } catch {
      flashActionMessage("Nie udało się przygotować PDF. Spróbuj ponownie.");
    }
  };

  const filteredDistricts = useMemo(
    () => districts.filter((district) => district.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const chartData = result?.yearly.map((point) => ({
    ...point,
    floor95: point.p05,
    band95: point.p95 - point.p05,
    floor50: point.p25,
    band50: point.p75 - point.p25
  }));

  const districtShapes = useMemo(() => {
    if (!enrichedGeojson) return [];
    return enrichedGeojson.features.map((feature, index) => {
      const name = String((feature.properties as { name?: string } | null)?.name ?? "");
      const market = districtByName.get(name);
      const normalizedName = normalizedKeyPart(name);
      const baseId = market?.id ?? (normalizedName || `district-${index}`);
      const featureId = feature.id ? normalizedKeyPart(String(feature.id)) : index;
      const renderKey = `${baseId}-${featureId}`;
      const districtId = market?.id ?? baseId;
      const coordinates = feature.geometry.type === "Polygon" ? feature.geometry.coordinates : [];
      const flat = coordinates.flat();
      const center = flat.reduce(
        (acc, point) => {
          acc[0] += point[0];
          acc[1] += point[1];
          return acc;
        },
        [0, 0]
      );
      const projected = flat.length ? projectPoint([center[0] / flat.length, center[1] / flat.length]) : [0, 0];
      return {
        renderKey,
        districtId,
        name,
        market,
        path: polygonPath(coordinates),
        ratio: market ? market.rentPerM2 / market.pricePerM2 : 0,
        label: projected
      };
    });
  }, [enrichedGeojson]);

  const activeShape = districtShapes.find((shape) => shape.districtId === (hoveredId ?? selectedId));
  const appreciationHint = `Typowy zakres dla tej grupy dzielnic: ${percent(selected.appreciationRange[0])}-${percent(selected.appreciationRange[1])} rocznie. Suwak pozwala sprawdzić ostrożniejszy lub bardziej optymistyczny wariant.`;
  const comparisonData = useMemo(
    () => [
      {
        name: selected.name,
        price: selected.pricePerM2,
        rent: selected.rentPerM2,
        ratio: Math.round((selected.rentPerM2 / selected.pricePerM2) * 10000) / 100,
        breakEven: result?.summary.breakEvenMedian ?? 0
      },
      ...(compare
        ? [
            {
              name: compare.name,
              price: compare.pricePerM2,
              rent: compare.rentPerM2,
              ratio: Math.round((compare.rentPerM2 / compare.pricePerM2) * 10000) / 100,
              breakEven: result?.compareSummary?.breakEvenMedian ?? 0
            }
          ]
        : [])
    ],
    [compare, result?.compareSummary?.breakEvenMedian, result?.summary.breakEvenMedian, selected.name, selected.pricePerM2, selected.rentPerM2]
  );
  const chartPreviewPaths = result?.paths.slice(0, chartPreviewPathCount) ?? [];

  return (
    <main ref={reportRef} className="dashboard app-dashboard">
      <aside className="sidebar">
        <div className="brand-mark">W</div>
        <nav>
          <NavItem icon={<Grid2X2 size={22} />} label="Przegląd" />
          <NavItem icon={<BarChart3 size={22} />} label="Porównanie" active />
          <NavItem icon={<Heart size={22} />} label="Zapisane" disabled />
          <NavItem icon={<Bell size={22} />} label="Alerty" disabled />
          <NavItem icon={<FileText size={22} />} label="Raporty" disabled />
          <NavItem icon={<BookOpen size={22} />} label="Wiedza" disabled />
        </nav>
        <span className="locale" aria-label="Język interfejsu: polski">
          PL
        </span>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="product-title">
            <div className="brand-mark small">W</div>
            <div>
              <h1>Warszawa: wynajem czy zakup</h1>
              <p>Dane szacunkowe dla dzielnic · aktualizacja: {dataLastUpdated}</p>
            </div>
          </div>
          <label className="scenario-select">
            <span>Sytuacja</span>
            <select value={settings.scenario} onChange={(event) => applyScenario(event.target.value as ScenarioKey)}>
              {(Object.entries(scenarios) as Array<[ScenarioKey, (typeof scenarios)[ScenarioKey]]>).map(([key, scenario]) => (
                <option key={key} value={key}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
          <button className="ghost-action" type="button" onClick={() => setCompareId(compareId ? null : nextAvailableCompareId(selectedId, "srodmiescie"))}>
            <Plus size={18} />
            Dodaj dzielnicę
          </button>
          <div className="topbar-actions">
            <button className="ghost-action compact action-with-feedback" data-feedback="Link jest w pasku adresu." type="button" onClick={share}>
              <Share2 size={18} />
              Udostępnij
            </button>
            <button className="primary-action action-with-feedback" data-feedback="Przygotowuję PDF..." type="button" onClick={exportPdf}>
              <Download size={18} />
              Pobierz PDF
            </button>
            <button className="avatar" type="button" aria-label="Profil użytkownika">
              AC
            </button>
          </div>
          <AnimatePresence>
            {actionMessage ? (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="action-feedback"
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
                initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                role="status"
                transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
              >
                {actionMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </header>

        <section className="mvp-intro surface">
          <div>
            <span>Kalkulator orientacyjny</span>
            <h2>Zobacz, który wybór może mieć więcej sensu: najem czy zakup.</h2>
            <p>
              Porównaj ratę kredytu, koszty najmu i inwestowanie pieniędzy, których nie wydajesz na zakup. Zacznij od
              dzielnicy i swojej sytuacji, a potem dopasuj założenia.
            </p>
          </div>
          <p className="mvp-disclaimer">{mvpDisclaimer}</p>
        </section>

        <section className="content-grid">
          <aside className="map-card surface">
            <header>
              <div>
                <h2>Wybierz dzielnice do porównania</h2>
                <p>Możesz porównać do 2 dzielnic naraz.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label={compareId ? "Usuń drugą dzielnicę z porównania" : "Dodaj drugą dzielnicę do porównania"}
                onClick={() => setCompareId(compareId ? null : nextAvailableCompareId(selectedId))}
              >
                <Plus size={20} />
              </button>
            </header>

            <div className="map-stage">
              <p id="district-map-accessible-note" className="sr-only">
                Mapa obsługuje wybór myszą lub dotykiem. Pełny wybór dzielnic klawiaturą jest dostępny na liście pod mapą.
              </p>
              <div ref={mapContainer} className="map" />
              <svg
                className="district-svg"
                viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Mapa dzielnic Warszawy według relacji najmu do ceny"
                aria-describedby="district-map-accessible-note"
              >
                <g>
                  {districtShapes.map((shape) => (
                    <path
                      key={shape.renderKey}
                      d={shape.path}
                      data-district={shape.districtId}
                      fill={ratioColor(shape.ratio)}
                      className={`${shape.districtId === selectedId ? "selected" : ""} ${shape.districtId === hoveredId ? "hovered" : ""} ${shape.districtId === compareId ? "compared" : ""}`}
                      onMouseEnter={() => setHoveredId(shape.districtId)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => selectDistrict(shape.districtId)}
                    />
                  ))}
                </g>
                <g className="district-label-layer">
                  {districtShapes.map((shape) => (
                    <text key={`${shape.renderKey}-label`} x={shape.label[0]} y={shape.label[1]} className={shape.districtId === selectedId ? "selected" : ""}>
                      {shape.name}
                    </text>
                  ))}
                </g>
                <g className="selection-markers">
                  {activeShape ? (
                    <>
                      <circle cx={activeShape.label[0]} cy={activeShape.label[1] - 32} r="23" />
                      <text x={activeShape.label[0]} y={activeShape.label[1] - 26}>
                        {activeShape.districtId === selectedId ? "1" : "i"}
                      </text>
                    </>
                  ) : null}
                  {compare
                    ? districtShapes
                        .filter((shape) => shape.districtId === compare.id)
                        .map((shape) => (
                          <g key={`${shape.renderKey}-compare`}>
                            <circle cx={shape.label[0]} cy={shape.label[1] - 32} r="21" className="compare-marker" />
                            <text x={shape.label[0]} y={shape.label[1] - 26}>
                              2
                            </text>
                          </g>
                        ))
                    : null}
                </g>
              </svg>
              {activeShape?.market ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="map-popover"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  key={activeShape.renderKey}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                >
                  <span>{activeShape.districtId === selectedId ? "Wybrana dzielnica" : "Podgląd"}</span>
                  <strong>{activeShape.name}</strong>
                  <small>
                    {money.format(activeShape.market.pricePerM2)}/m² · najem {money.format(activeShape.market.rentPerM2)}/m²
                  </small>
                </motion.div>
              ) : null}
              {geojsonFailed ? (
                <div className="map-fallback-note" role="status">
                  <strong>Mapa dzielnic chwilowo się nie wczytała.</strong>
                  <span>Wybór dzielnicy nadal działa z listy poniżej.</span>
                </div>
              ) : null}
            </div>

            <div className="map-legend">
              <span>Stawka najmu względem ceny</span>
              <div />
              <small>niższa</small>
              <small>wyższa</small>
            </div>

            <div className="district-search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj dzielnicy" aria-label="Szukaj dzielnicy" />
            </div>

            <div className="district-list" role="group" aria-label="Klawiaturowa lista wyboru dzielnic">
              {filteredDistricts.slice(0, 8).map((district, index) => {
                const active = district.id === selectedId;
                const compared = district.id === compareId;
                return (
                  <button
                    key={district.id}
                    className={active || compared ? "active" : ""}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Wybierz dzielnicę ${district.name}${compared ? " jako główną i usuń ją z porównania" : ""}`}
                    onClick={() => selectDistrict(district.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " " || event.key === "Space" || event.key === "Spacebar") {
                        event.preventDefault();
                        selectDistrict(district.id);
                      }
                    }}
                  >
                    <span className="check">{active ? "1" : compared ? "2" : "+"}</span>
                    <strong>{district.name}</strong>
                    <small>{percent(district.rentPerM2 / district.pricePerM2)}</small>
                  </button>
                );
              })}
            </div>

            <div className="compare-picker">
              <select
                value={compareId ?? ""}
                aria-label="Wybierz drugą dzielnicę do porównania"
                onChange={(event) => {
                  const nextCompareId = event.target.value;
                  setCompareId(nextCompareId && nextCompareId !== selectedId && districtById.has(nextCompareId) ? nextCompareId : null);
                }}
              >
                <option value="">Wybierz drugą dzielnicę</option>
                {districts
                  .filter((district) => district.id !== selectedId)
                  .map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
              </select>
              <span>{selectedDistricts.length} / 2 wybrane</span>
            </div>
          </aside>

          <section className="analysis-area">
            <div className="analysis-header">
              <div>
                <h2>Porównanie dzielnic</h2>
                <p>Sprawdź, jak wynik różni się między wybranymi dzielnicami Warszawy.</p>
              </div>
              <div>
                <button className="ghost-action compact" disabled title="Porównanie profili nie jest jeszcze dostępne" type="button">
                  <Sparkles size={18} />
                  Porównaj profile
                  <span className="soon-pill">Wkrótce</span>
                </button>
                <button className="primary-action" type="button" onClick={exportPdf}>
                  <FileText size={18} />
                  Raport porównania
                </button>
              </div>
            </div>

            <div className="district-card-grid">
              <DistrictCard district={selected} summary={result?.summary} selected index={1} reduceMotion={prefersReducedMotion} />
              {compare ? <DistrictCard district={compare} summary={result?.compareSummary} selected={false} index={2} reduceMotion={prefersReducedMotion} /> : null}
              {!compare ? (
                <article className="district-card empty">
                  <Plus size={28} />
                  <h3>Dodaj drugą dzielnicę</h3>
                  <p>Porównaj cenę, najem, próg opłacalności i wpływ własnych założeń.</p>
                </article>
              ) : null}
            </div>

            <div className="insight-strip">
              <div className="break-even-hero">
                <span>Kiedy zakup się broni</span>
                <strong>{formatYear(result?.summary.breakEvenMedian ?? null)}</strong>
                <small>
                  Zakres 95%: {formatYear(result?.summary.breakEvenLow ?? null)} - {formatYear(result?.summary.breakEvenHigh ?? null)}
                </small>
                <i className={isRunning ? "pulse" : ""}>
                  {isRunning ? "Trwa przeliczanie" : `${Math.round((result?.summary.buyWinsAtHorizon ?? 0) * 100)}% symulacji z przewagą zakupu`}
                </i>
              </div>
              <div className="assumption-card">
                <span>Dane szacunkowe</span>
                <strong>{selected.name}</strong>
                <p>{selected.note}</p>
                <div>
                  <b>{money.format(result?.summary.purchasePrice ?? selected.pricePerM2 * settings.areaM2)}</b>
                  <small>szacunkowa cena zakupu</small>
                </div>
              </div>
            </div>

            <div className="chart-grid">
              <section className="surface chart-card tall">
                <div className="section-title">
                  <BarChart3 size={18} />
                  <h3>Monte Carlo: zakup a najem</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <LineChart margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 8" stroke="rgba(14, 24, 56, 0.1)" />
                    <XAxis dataKey="year" type="number" domain={[1, 30]} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(value) => money.format(Number(value))} labelFormatter={(label) => `Rok ${label}`} />
                    <ReferenceLine y={0} stroke="#1a2b68" strokeDasharray="4 4" />
                    {chartPreviewPaths.map((path, index) => (
                      <Line
                        key={`${index}-${path[0]?.year ?? 0}`}
                        data={path}
                        type="monotone"
                        dataKey="value"
                        dot={false}
                        stroke={index % 3 === 0 ? "#3157ff" : "#8d54ff"}
                        strokeOpacity={0.11}
                        strokeWidth={1}
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </section>

              <section className="surface chart-card">
                <div className="section-title">
                  <SlidersHorizontal size={18} />
                  <h3>Możliwy zakres wyniku</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(value) => money.format(Number(value))} />
                    <Area dataKey="floor95" stackId="95" stroke="none" fill="transparent" isAnimationActive={false} />
                    <Area dataKey="band95" stackId="95" stroke="none" fill="#9ab5ff" fillOpacity={0.28} isAnimationActive={false} />
                    <Area dataKey="floor50" stackId="50" stroke="none" fill="transparent" isAnimationActive={false} />
                    <Area dataKey="band50" stackId="50" stroke="none" fill="#7b4dff" fillOpacity={0.28} isAnimationActive={false} />
                    <Line type="monotone" dataKey="p50" stroke="#3157ff" dot={false} strokeWidth={2.4} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </section>

              <section className="surface chart-card">
                <div className="section-title">
                  <TrendingUp size={18} />
                  <h3>Cena zakupu za m²</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <BarChart data={comparisonData} layout="vertical" margin={{ top: 8, right: 22, bottom: 0, left: 34 }}>
                    <CartesianGrid strokeDasharray="3 8" horizontal={false} stroke="rgba(14, 24, 56, 0.1)" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={92} />
                    <Tooltip formatter={(value) => money.format(Number(value))} />
                    <Bar dataKey="price" name="Cena / m²" radius={[0, 8, 8, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={index === 0 ? "#3157ff" : "#8d54ff"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>
            </div>

            <div className="bottom-grid">
              <section className="surface controls-card">
                <div className="section-title">
                  <SlidersHorizontal size={18} />
                  <h3>Założenia</h3>
                </div>
                <div className="controls compact-controls">
                  <Slider label="Jak długo chcesz mieszkać" value={settings.yearsInHome} min={1} max={30} step={1} format={(value) => `${value} lat`} onChange={(value) => updateSetting("yearsInHome", value)} />
                  <Slider label="Powierzchnia mieszkania" value={settings.areaM2} min={25} max={110} step={1} format={(value) => `${value} m²`} onChange={(value) => updateSetting("areaM2", value)} />
                  <Slider label="Oprocentowanie kredytu" value={settings.mortgageRate} min={0.025} max={0.105} step={0.001} format={percent} onChange={(value) => updateSetting("mortgageRate", value)} />
                  <Slider label="Wkład własny" value={settings.downPayment} min={0.1} max={0.6} step={0.01} format={percent} onChange={(value) => updateSetting("downPayment", value)} />
                  <Slider
                    label="Wzrost wartości mieszkania"
                    value={settings.homeAppreciation}
                    min={-0.01}
                    max={0.09}
                    step={0.001}
                    format={percent}
                    hint={appreciationHint}
                    onChange={(value) => updateSetting("homeAppreciation", value)}
                  />
                  <Slider label="Wzrost czynszu najmu" value={settings.rentGrowth} min={0} max={0.1} step={0.001} format={percent} onChange={(value) => updateSetting("rentGrowth", value)} />
                  <Slider label="Zwrot z inwestycji" value={settings.investmentReturn} min={0.005} max={0.105} step={0.001} format={percent} onChange={(value) => updateSetting("investmentReturn", value)} />
                  <Slider label="Inflacja" value={settings.inflation} min={0.005} max={0.085} step={0.001} format={percent} onChange={(value) => updateSetting("inflation", value)} />
                </div>
              </section>

              <section className="surface settings-card">
                <div className="section-title">
                  <Home size={18} />
                  <h3>Opcje kredytu</h3>
                </div>
                <div className="switches">
                  <Toggle label="Stałe oprocentowanie" checked={settings.mortgageType === "fixed"} onChange={(value) => updateSetting("mortgageType", value ? "fixed" : "variable")} />
                  <Toggle label="Zakładam refinansowanie" checked={settings.refinancing} onChange={(value) => updateSetting("refinancing", value)} />
                  <Toggle label="Rynek wtórny i PCC" checked={settings.secondaryMarket} onChange={(value) => updateSetting("secondaryMarket", value)} />
                </div>
                <div className="source-note">
                  <MapPin size={17} />
                  <p>{dataSourceNote}</p>
                </div>
              </section>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
