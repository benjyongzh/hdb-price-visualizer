import { useState, useMemo, useEffect } from "react";

import Map, {
  ViewState,
  Source,
  Layer,
  LayerProps,
  MapLayerMouseEvent,
} from "react-map-gl";
import { GeoJsonFeature, GeoJsonData } from "@/lib/types";

const position: [number, number] = [1.36025, 103.818758];

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
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1);
  const debounceDelay = 300; // debounce delay in milliseconds

  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(
    null
  );

  // Define Layer styles with an interpolated color expression
  const geoJsonLayerStyle: LayerProps = {
    id: "geojson-layer",
    type: "fill",
    paint: {
      // Color interpolation based on the "price" property of each feature
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "latest_price"], // The property to base the color on
        minPrice,
        "#FF0000", // Lowest price -> Red
        maxPrice,
        "#0000FF", // Highest price -> Blue
      ],
      "fill-opacity": 0.6,
    },
  };

  // Calculate min and max prices without setting state immediately
  const computedPrices: {
    minPrice: number;
    maxPrice: number;
  } = useMemo(() => {
    const pricesArray: number[] = props.geojsonData.features.map(
      (feature) => feature.properties.latest_price
    );
    return {
      minPrice: Math.min(...pricesArray),
      maxPrice: Math.max(...pricesArray),
    };
  }, [props.geojsonData.features.length]);

  useEffect(() => {
    // Set a debounce timer to update minPrice and maxPrice
    const timer = setTimeout(() => {
      setMaxPrice(computedPrices.maxPrice);
      setMinPrice(
        computedPrices.maxPrice === computedPrices.minPrice
          ? 0
          : computedPrices.minPrice
      );
    }, debounceDelay);

    // Clear timeout if prices change again within the debounce period
    return () => clearTimeout(timer);
  }, [computedPrices, debounceDelay]);

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
        <div className="absolute bottom-8 left-8 p-2 border-r-8 bg-primary text-primary-foreground">
          <h3>Feature Info</h3>
          <pre>{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
          <button onClick={() => setSelectedFeature(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
