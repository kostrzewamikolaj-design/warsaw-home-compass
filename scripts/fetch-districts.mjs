import { mkdir, writeFile } from "node:fs/promises";
import proj4 from "proj4";

const WFS_URL =
  "https://wfs.um.warszawa.pl/serwis?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=ns92528565:GRANICE_DZIELNIC";

proj4.defs(
  "EPSG:2178",
  "+proj=tmerc +lat_0=0 +lon_0=21 +k=0.999923 +x_0=7500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
);

const strip = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

const response = await fetch(WFS_URL);
if (!response.ok) {
  throw new Error(`Warsaw WFS request failed: ${response.status}`);
}

const gml = await response.text();
const members = [...gml.matchAll(/<gml:featureMember>([\s\S]*?)<\/gml:featureMember>/g)];

const features = members.map((member) => {
  const xml = member[1];
  const district = strip(xml.match(/<ns92528565:DZIELNICA>(.*?)<\/ns92528565:DZIELNICA>/)?.[1] ?? "");
  const updated = strip(xml.match(/<ns92528565:AKTU_DAN>(.*?)<\/ns92528565:AKTU_DAN>/)?.[1] ?? "");
  const rings = [...xml.matchAll(/<gml:posList>([\s\S]*?)<\/gml:posList>/g)].map((match) => {
    const values = match[1].trim().split(/\s+/).map(Number);
    const coordinates = [];
    for (let index = 0; index < values.length; index += 2) {
      const [lon, lat] = proj4("EPSG:2178", "EPSG:4326", [values[index], values[index + 1]]);
      coordinates.push([Number(lon.toFixed(6)), Number(lat.toFixed(6))]);
    }
    return coordinates;
  });

  return {
    type: "Feature",
    properties: {
      name: district,
      source: "City of Warsaw WFS GRANICE_DZIELNIC",
      updated
    },
    geometry: {
      type: "Polygon",
      coordinates: rings
    }
  };
});

const geojson = {
  type: "FeatureCollection",
  name: "warsaw-districts",
  crs: {
    type: "name",
    properties: {
      name: "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  features: features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, "pl"))
};

await mkdir("public/data", { recursive: true });
await writeFile("public/data/warsaw-districts.geojson", `${JSON.stringify(geojson)}\n`);

console.log(`Wrote ${features.length} Warsaw districts to public/data/warsaw-districts.geojson`);
