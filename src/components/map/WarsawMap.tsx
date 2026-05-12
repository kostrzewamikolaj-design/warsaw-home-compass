import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildDistrictFeatures } from "./buildDistrictGeo";
import { DISTRICT_BY_SLUG, WARSAW_CENTER } from "@/data/districts";
import { useCalcStore } from "@/store/useCalcStore";

const POSITRON_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "carto-positron": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://carto.com/attributions">CARTO</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
    { id: "carto-positron", type: "raster", source: "carto-positron" },
  ],
};

export function WarsawMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const selectedSlug = useCalcStore((s) => s.settings.districtSlug);
  const selectDistrict = useCalcStore((s) => s.selectDistrict);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const features = buildDistrictFeatures();
    const fc = { type: "FeatureCollection" as const, features };

    const ratios = features.map((f) => f.properties.ratio);
    const minR = Math.min(...ratios);
    const maxR = Math.max(...ratios);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: POSITRON_RASTER_STYLE,
      center: WARSAW_CENTER,
      zoom: 10.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    // Ensure proper sizing once the container has laid out
    requestAnimationFrame(() => map.resize());
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    map.on("load", () => {
      map.addSource("districts", { type: "geojson", data: fc, promoteId: "slug" });
      // promoteId requires id field — set per feature
      const fcWithIds = {
        type: "FeatureCollection" as const,
        features: features.map((f) => ({ ...f, id: f.properties.slug })),
      };
      (map.getSource("districts") as GeoJSONSource).setData(fcWithIds);

      map.addLayer({
        id: "districts-fill",
        type: "fill",
        source: "districts",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "ratio"],
            minR,
            "#1e3a8a",
            (minR + maxR) / 2,
            "#0ea5b7",
            maxR,
            "#fbbf24",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.85,
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            0.55,
          ],
        },
      });
      map.addLayer({
        id: "districts-outline",
        type: "line",
        source: "districts",
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#ffffff",
            "#0f172a",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            2.5,
            0.6,
          ],
        },
      });
      map.addLayer({
        id: "districts-labels",
        type: "symbol",
        source: "districts",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      });

      // Tooltip
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "wm-popup",
      });
      let hoveredId: string | null = null;

      map.on("mousemove", "districts-fill", (e) => {
        if (!e.features?.length) return;
        map.getCanvas().style.cursor = "pointer";
        const f = e.features[0];
        const slug = f.properties?.slug as string;
        if (hoveredId && hoveredId !== slug) {
          map.setFeatureState({ source: "districts", id: hoveredId }, { hover: false });
        }
        hoveredId = slug;
        map.setFeatureState({ source: "districts", id: slug }, { hover: true });
        const d = DISTRICT_BY_SLUG[slug];
        if (!d) return;
        const ratio = (f.properties?.ratio as number) * 100;
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family:Inter,system-ui;font-size:12px;color:#0f172a;padding:2px 4px;min-width:160px">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px">${d.name}</div>
              <div>${d.pricePerM2.toLocaleString("pl-PL")} PLN / m²</div>
              <div>${d.rent50m2.toLocaleString("pl-PL")} PLN / mo (50 m²)</div>
              <div style="margin-top:3px;color:#0ea5b7;font-weight:500">Yield: ${ratio.toFixed(2)}%</div>
            </div>`,
          )
          .addTo(map);
      });
      map.on("mouseleave", "districts-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId)
          map.setFeatureState({ source: "districts", id: hoveredId }, { hover: false });
        hoveredId = null;
        popup.remove();
      });

      map.on("click", "districts-fill", (e) => {
        if (!e.features?.length) return;
        const slug = e.features[0].properties?.slug as string;
        const d = DISTRICT_BY_SLUG[slug];
        if (!d) return;
        selectDistrict(slug);
        map.flyTo({ center: d.center, zoom: 12.5, speed: 0.9, curve: 1.4 });
      });

      // Set initial selection
      map.setFeatureState({ source: "districts", id: selectedSlug }, { selected: true });
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const features = buildDistrictFeatures();
    features.forEach((f) => {
      map.setFeatureState(
        { source: "districts", id: f.properties.slug },
        { selected: f.properties.slug === selectedSlug },
      );
    });
    const d = DISTRICT_BY_SLUG[selectedSlug];
    if (d) map.flyTo({ center: d.center, zoom: 12.2, speed: 0.9 });
  }, [selectedSlug]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
      <div ref={containerRef} className="absolute inset-0" />
      <MapLegend />
    </div>
  );
}

function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-border bg-card/90 px-3 py-2 text-xs text-foreground shadow-[var(--shadow-elegant)] backdrop-blur">
      <div className="mb-1 font-medium text-muted-foreground">Rental yield (annual)</div>
      <div className="flex items-center gap-2">
        <span>Low</span>
        <div
          className="h-2 w-32 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #1e3a8a 0%, #0ea5b7 50%, #fbbf24 100%)",
          }}
        />
        <span>High</span>
      </div>
    </div>
  );
}
