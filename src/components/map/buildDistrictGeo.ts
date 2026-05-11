import { Delaunay } from "d3-delaunay";
import { DISTRICTS, WARSAW_BBOX, rentToPriceRatio, type District } from "@/data/districts";

export interface DistrictFeature {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: {
    slug: string;
    name: string;
    pricePerM2: number;
    rent50m2: number;
    band: District["band"];
    ratio: number;
  };
}

export function buildDistrictFeatures(): DistrictFeature[] {
  const points = DISTRICTS.map((d) => d.center);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi(WARSAW_BBOX);
  return DISTRICTS.map((d, i) => {
    const poly = voronoi.cellPolygon(i);
    return {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [poly as number[][]],
      },
      properties: {
        slug: d.slug,
        name: d.name,
        pricePerM2: d.pricePerM2,
        rent50m2: d.rent50m2,
        band: d.band,
        ratio: rentToPriceRatio(d),
      },
    };
  });
}
