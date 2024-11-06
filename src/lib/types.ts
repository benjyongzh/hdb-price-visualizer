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
