import { useState } from "react";

import Map, {
  ViewState,
  Source,
  Layer,
  LayerProps,
  MapLayerMouseEvent,
} from "react-map-gl";
import { GeoJsonFeature, GeoJsonData } from "@/lib/types";

const position: [number, number] = [1.36025, 103.818758];

// Define Layer styles for the GeoJSON
const geoJsonLayerStyle: LayerProps = {
  id: "geojson-layer",
  type: "fill",
  paint: {
    "fill-color": "#088",
    "fill-opacity": 0.6,
  },
};

const lineLayerStyle: LayerProps = {
  id: "geojson-line-layer",
  type: "line",
  paint: {
    "line-color": "#088",
    "line-width": 2,
  },
};

const initialViewPortState: ViewState = {
  latitude: position[0],
  longitude: position[1],
  zoom: 10,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

const MapComponent = (props: { geojsonData: GeoJsonData }) => {
  const [viewState, setViewState] = useState(initialViewPortState);

  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(
    null
  );

  // Handle feature click event
  const onMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features && (event.features[0] as GeoJsonFeature);
    if (feature) {
      setSelectedFeature(feature);
    }
  };

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={({ viewState }) => setViewState(viewState)}
        // mapStyle={import.meta.env.VITE_MAPBOX_MAP_STYLE}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onClick={onMapClick}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["geojson-layer"]}
      >
        <Source id="my-data" type="geojson" data={props.geojsonData}>
          <Layer {...geoJsonLayerStyle} />
          <Layer {...lineLayerStyle} />
        </Source>
      </Map>

      {selectedFeature && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>Feature Info</h3>
          <pre>{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
          <button onClick={() => setSelectedFeature(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
