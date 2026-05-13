"use client";

import bbox from "@turf/bbox";
import { motion } from "framer-motion";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const formatYear = (value: number | null) => (value === null ? "Brak momentu opłacalności" : `${number.format(value)} lat`);

const bandLabels = {
  Premium: "premium",
  Stable: "stabilny",
  Growth: "wzrostowy",
  Emerging: "wschodzący",
  "Outer value": "zewnętrzna wartość"
} as const;

const mvpDisclaimer =
  "To edukacyjne MVP oparte na statycznych, szacunkowych danych. Nie stanowi porady finansowej, kredytowej, prawnej ani inwestycyjnej. Zweryfikuj założenia samodzielnie przed podjęciem decyzji.";

const hashState = (districtId: string, compareId: string | null, settings: Settings) => {
  const payload = JSON.stringify({ districtId, compareId, settings });
  return btoa(encodeURIComponent(payload));
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
  return (
    <label className="control">
      <span>
        {label}
        <strong>{format(value)}</strong>
      </span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
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
      title={disabled ? "Planowane po publicznym MVP" : undefined}
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
  index
}: {
  district: DistrictMarket;
  summary?: SimulationSummary;
  selected: boolean;
  index: number;
}) {
  const ratio = district.rentPerM2 / district.pricePerM2;
  return (
    <motion.article className={`district-card ${selected ? "selected" : ""}`} layout>
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
        <MetricTile label="Cena / m²" value={`${number.format(district.pricePerM2)} zł`} delta="mediana" accent="blue" />
        <MetricTile label="Najem / m² / mies." value={`${number.format(district.rentPerM2)} zł`} delta="stawka ofertowa" accent="teal" />
        <MetricTile label="Relacja najmu do ceny" value={percent(ratio)} delta={`segment: ${bandLabels[district.band]}`} accent="violet" />
        <MetricTile label="Moment opłacalności" value={formatYear(summary?.breakEvenMedian ?? null)} delta="ścieżka medianowa" accent="blue" />
        <MetricTile label="Szansa przewagi zakupu" value={`${Math.round((summary?.buyWinsAtHorizon ?? 0) * 100)}%`} delta="wybrany horyzont" accent="teal" />
        <MetricTile label="Różnica majątku" value={money.format(summary?.finalMedianDelta ?? 0)} delta="względem najmu" accent="violet" />
      </div>
    </motion.article>
  );
}

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState("mokotow");
  const [compareId, setCompareId] = useState<string | null>("wola");
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings });
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
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

  useEffect(() => {
    const restored = parseHash();
    if (!restored) return;
    if (restored.districtId && districtById.has(restored.districtId)) {
      setSelectedId(restored.districtId);
    }
    setCompareId(restored.compareId && districtById.has(restored.compareId) ? restored.compareId : null);
    if (restored.settings) {
      setSettings((current) => ({ ...current, ...restored.settings }));
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
      settings,
      paths: 650
    });
  }, [compare, selected, settings]);

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
      .then((response) => response.json())
      .then(setGeojson)
      .catch(() => setGeojson(null));
  }, []);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapRef.current || !enrichedGeojson) return;
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
        { padding: 72, duration: 900, essential: true }
      );
    }
  }, [enrichedGeojson, selected.name]);

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
    const fallbackMessage = "Link jest gotowy w adresie strony.";
    window.sessionStorage.setItem("dashboard-action-message", fallbackMessage);
    window.history.replaceState(window.history.state, "", `#${hash}`);
    flashActionMessage(fallbackMessage);
    window.setTimeout(() => window.sessionStorage.removeItem("dashboard-action-message"), 5000);

    if (navigator.clipboard?.writeText) {
      void Promise.race([
        navigator.clipboard.writeText(url),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("Clipboard timeout")), 1200))
      ])
        .then(() => flashActionMessage("Link do analizy został skopiowany."))
        .catch(() => undefined);
    }
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    flashActionMessage("Generuję PDF...", 12000);
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#f7f9ff", scale: 1.6 });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`warszawa-najem-czy-zakup-${selected.id}.pdf`);
      flashActionMessage("PDF został wygenerowany.");
    } catch {
      flashActionMessage("Nie udało się wygenerować PDF. Spróbuj ponownie.");
    }
  };

  const filteredDistricts = districts.filter((district) => district.name.toLowerCase().includes(query.toLowerCase()));
  const chartData = result?.yearly.map((point) => ({
    ...point,
    floor95: point.p05,
    band95: point.p95 - point.p05,
    floor50: point.p25,
    band50: point.p75 - point.p25
  }));

  const districtShapes = useMemo(() => {
    if (!enrichedGeojson) return [];
    return enrichedGeojson.features.map((feature) => {
      const name = String((feature.properties as { name?: string } | null)?.name ?? "");
      const market = districtByName.get(name);
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
        id: market?.id ?? name,
        name,
        market,
        path: polygonPath(coordinates),
        ratio: market ? market.rentPerM2 / market.pricePerM2 : 0,
        label: projected
      };
    });
  }, [enrichedGeojson]);

  const activeShape = districtShapes.find((shape) => shape.id === (hoveredId ?? selectedId));
  const appreciationHint = `Zakres dla segmentu ${bandLabels[selected.band]}: ${percent(selected.appreciationRange[0])}-${percent(selected.appreciationRange[1])} rocznie. Suwak jest bazowym założeniem, które model łączy z profilem dzielnicy.`;
  const comparisonData = [
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
  ];

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
              <p>Szacunkowy model dzielnicowy · aktualizacja: {dataLastUpdated}</p>
            </div>
          </div>
          <label className="scenario-select">
            <span>Scenariusz</span>
            <select value={settings.scenario} onChange={(event) => applyScenario(event.target.value as ScenarioKey)}>
              {(Object.entries(scenarios) as Array<[ScenarioKey, (typeof scenarios)[ScenarioKey]]>).map(([key, scenario]) => (
                <option key={key} value={key}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
          <button className="ghost-action" type="button" onClick={() => setCompareId(compareId ? null : "srodmiescie")}>
            <Plus size={18} />
            Porównaj dzielnice
          </button>
          <div className="topbar-actions">
            <button className="ghost-action compact action-with-feedback" data-feedback="Link jest gotowy w adresie strony." type="button" onClick={share}>
              <Share2 size={18} />
              Udostępnij
            </button>
            <button className="primary-action action-with-feedback" data-feedback="Generuję PDF..." type="button" onClick={exportPdf}>
              <Download size={18} />
              Eksportuj PDF
            </button>
            <button className="avatar" type="button">
              AC
            </button>
          </div>
          {actionMessage ? <p className="action-feedback" role="status">{actionMessage}</p> : null}
        </header>

        <section className="mvp-intro surface">
          <div>
            <span>Publiczne MVP</span>
            <h2>Sprawdź, czy w wybranej dzielnicy bardziej opłaca się najem czy zakup.</h2>
            <p>
              Narzędzie pomaga osobom kupującym pierwsze mieszkanie, parom, rodzinom i inwestorom porównać koszty kredytu,
              najmu oraz alternatywnego inwestowania różnicy. Zacznij od wyboru dzielnicy i scenariusza, a potem dostosuj
              założenia do swojej sytuacji.
            </p>
          </div>
          <p className="mvp-disclaimer">{mvpDisclaimer}</p>
        </section>

        <section className="content-grid">
          <aside className="map-card surface">
            <header>
              <div>
                <h2>Wybierz dzielnice do porównania</h2>
                <p>Wybierz maksymalnie 2 dzielnice dla aktualnego modelu.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCompareId(compareId ? null : "zoliborz")}>
                <Plus size={20} />
              </button>
            </header>

            <div className="map-stage">
              <div ref={mapContainer} className="map" />
              <svg
                className="district-svg"
                viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Mapa dzielnic Warszawy według relacji najmu do ceny"
              >
                <g>
                  {districtShapes.map((shape) => (
                    <path
                      key={shape.id}
                      d={shape.path}
                      data-district={shape.id}
                      fill={ratioColor(shape.ratio)}
                      className={`${shape.id === selectedId ? "selected" : ""} ${shape.id === hoveredId ? "hovered" : ""} ${shape.id === compareId ? "compared" : ""}`}
                      onMouseEnter={() => setHoveredId(shape.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(shape.id)}
                    />
                  ))}
                </g>
                <g className="district-label-layer">
                  {districtShapes.map((shape) => (
                    <text key={`${shape.id}-label`} x={shape.label[0]} y={shape.label[1]} className={shape.id === selectedId ? "selected" : ""}>
                      {shape.name}
                    </text>
                  ))}
                </g>
                <g className="selection-markers">
                  {activeShape ? (
                    <>
                      <circle cx={activeShape.label[0]} cy={activeShape.label[1] - 32} r="23" />
                      <text x={activeShape.label[0]} y={activeShape.label[1] - 26}>
                        {activeShape.id === selectedId ? "1" : "i"}
                      </text>
                    </>
                  ) : null}
                  {compare
                    ? districtShapes
                        .filter((shape) => shape.id === compare.id)
                        .map((shape) => (
                          <g key={`${shape.id}-compare`}>
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
                <motion.div className="map-popover" key={activeShape.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <span>{activeShape.id === selectedId ? "Wybrana dzielnica" : "Podgląd dzielnicy"}</span>
                  <strong>{activeShape.name}</strong>
                  <small>
                    {money.format(activeShape.market.pricePerM2)}/m² · najem {money.format(activeShape.market.rentPerM2)}/m²
                  </small>
                </motion.div>
              ) : null}
            </div>

            <div className="map-legend">
              <span>Relacja najmu do ceny</span>
              <div />
              <small>niższa</small>
              <small>wyższa</small>
            </div>

            <div className="district-search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj dzielnicy" />
            </div>

            <div className="district-list">
              {filteredDistricts.slice(0, 8).map((district, index) => {
                const active = district.id === selectedId;
                const compared = district.id === compareId;
                return (
                  <button key={district.id} className={active || compared ? "active" : ""} type="button" onClick={() => setSelectedId(district.id)}>
                    <span className="check">{active ? "1" : compared ? "2" : "+"}</span>
                    <strong>{district.name}</strong>
                    <small>{percent(district.rentPerM2 / district.pricePerM2)}</small>
                  </button>
                );
              })}
            </div>

            <div className="compare-picker">
              <select value={compareId ?? ""} onChange={(event) => setCompareId(event.target.value || null)}>
                <option value="">Dodaj dzielnicę do porównania</option>
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
                <p>Analiza najmu i zakupu dla wybranych warszawskich dzielnic.</p>
              </div>
              <div>
                <button className="ghost-action compact" disabled title="Porównanie scenariuszy jest planowane po publicznym MVP" type="button">
                  <Sparkles size={18} />
                  Porównaj scenariusze
                  <span className="soon-pill">Wkrótce</span>
                </button>
                <button className="primary-action" type="button" onClick={exportPdf}>
                  <FileText size={18} />
                  Pełny raport porównania
                </button>
              </div>
            </div>

            <div className="district-card-grid">
              <DistrictCard district={selected} summary={result?.summary} selected index={1} />
              {compare ? <DistrictCard district={compare} summary={result?.compareSummary} selected={false} index={2} /> : null}
              {!compare ? (
                <article className="district-card empty">
                  <Plus size={28} />
                  <h3>Dodaj drugą dzielnicę</h3>
                  <p>Porównaj cenę, najem, moment opłacalności i wrażliwość założeń.</p>
                </article>
              ) : null}
            </div>

            <div className="insight-strip">
              <div className="break-even-hero">
                <span>Zakup zaczyna wygrywać po</span>
                <strong>{formatYear(result?.summary.breakEvenMedian ?? null)}</strong>
                <small>
                  Przedział 95%: {formatYear(result?.summary.breakEvenLow ?? null)} - {formatYear(result?.summary.breakEvenHigh ?? null)}
                </small>
                <i className={isRunning ? "pulse" : ""}>
                  {isRunning ? "Symulacja trwa" : `${Math.round((result?.summary.buyWinsAtHorizon ?? 0) * 100)}% szans przewagi zakupu`}
                </i>
              </div>
              <div className="assumption-card">
                <span>Szacunkowe dane rynkowe</span>
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
                  <h3>Monte Carlo: różnica majątku</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <LineChart margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 8" stroke="rgba(14, 24, 56, 0.1)" />
                    <XAxis dataKey="year" type="number" domain={[1, 30]} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(value) => money.format(Number(value))} labelFormatter={(label) => `Rok ${label}`} />
                    <ReferenceLine y={0} stroke="#1a2b68" strokeDasharray="4 4" />
                    {result?.paths.map((path, index) => (
                      <Line
                        key={index}
                        data={path}
                        type="monotone"
                        dataKey="value"
                        dot={false}
                        stroke={index % 3 === 0 ? "#3157ff" : "#8d54ff"}
                        strokeOpacity={0.11}
                        strokeWidth={1}
                        isAnimationActive
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </section>

              <section className="surface chart-card">
                <div className="section-title">
                  <SlidersHorizontal size={18} />
                  <h3>Zakres wrażliwości</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(value) => money.format(Number(value))} />
                    <Area dataKey="floor95" stackId="95" stroke="none" fill="transparent" isAnimationActive />
                    <Area dataKey="band95" stackId="95" stroke="none" fill="#9ab5ff" fillOpacity={0.28} isAnimationActive />
                    <Area dataKey="floor50" stackId="50" stroke="none" fill="transparent" isAnimationActive />
                    <Area dataKey="band50" stackId="50" stroke="none" fill="#7b4dff" fillOpacity={0.28} isAnimationActive />
                    <Line type="monotone" dataKey="p50" stroke="#3157ff" dot={false} strokeWidth={2.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </section>

              <section className="surface chart-card">
                <div className="section-title">
                  <TrendingUp size={18} />
                  <h3>Porównanie cen / m²</h3>
                </div>
                <ResponsiveContainer width="100%" height={245}>
                  <BarChart data={comparisonData} layout="vertical" margin={{ top: 8, right: 22, bottom: 0, left: 34 }}>
                    <CartesianGrid strokeDasharray="3 8" horizontal={false} stroke="rgba(14, 24, 56, 0.1)" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={92} />
                    <Tooltip formatter={(value) => money.format(Number(value))} />
                    <Bar dataKey="price" name="Cena / m²" radius={[0, 8, 8, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={entry.name} fill={index === 0 ? "#3157ff" : "#8d54ff"} />
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
                  <h3>Założenia modelu</h3>
                </div>
                <div className="controls compact-controls">
                  <Slider label="Planowany czas mieszkania" value={settings.yearsInHome} min={1} max={30} step={1} format={(value) => `${value} lat`} onChange={(value) => updateSetting("yearsInHome", value)} />
                  <Slider label="Powierzchnia mieszkania" value={settings.areaM2} min={25} max={110} step={1} format={(value) => `${value} m²`} onChange={(value) => updateSetting("areaM2", value)} />
                  <Slider label="Oprocentowanie kredytu" value={settings.mortgageRate} min={0.025} max={0.105} step={0.001} format={percent} onChange={(value) => updateSetting("mortgageRate", value)} />
                  <Slider label="Wkład własny" value={settings.downPayment} min={0.1} max={0.6} step={0.01} format={percent} onChange={(value) => updateSetting("downPayment", value)} />
                  <Slider
                    label="Bazowy wzrost wartości mieszkania"
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
                  <Toggle label="Refinansowanie" checked={settings.refinancing} onChange={(value) => updateSetting("refinancing", value)} />
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
