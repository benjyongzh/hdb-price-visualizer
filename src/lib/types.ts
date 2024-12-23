interface GeoJsonGeometry {
  type: "Polygon";
  coordinates: any;
}

export interface GeoJsonFeature {
  id: number;
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: { [key: string]: any };
}

export interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

interface Line {
  id: number;
  name: string;
  abbbreviation: string;
  color: string;
  rail_type: "MRT" | "LRT";
}

export type PriceColourIndex = Array<{ price: number; colour: string }>;

export type StreamWorkerInputArgs = {
  endpoint: Function;
  callback: (geoJsonBatch: GeoJsonFeature) => void;
};

export type StreamWorkerOutputArgs = {
  error: {
    message: string;
    batch: GeoJsonFeature;
  } | null;
  done: boolean | null;
};
