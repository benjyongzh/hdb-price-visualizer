export interface GeoJsonFeature {
  id: number;
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: any;
  };
  properties: { [key: string]: any };
}

export interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

interface Line {
  name: string;
  abbbreviation: string;
  color: string;
  rail_type: "MRT" | "LRT";
}

export interface MrtStation {
  name: string;
  building_polygon: GeoJsonFeature;
  lines: Line[];
}
