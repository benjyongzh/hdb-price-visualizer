import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Map, {
  ViewState,
  Source,
  Layer,
  LayerProps,
  MapLayerMouseEvent,
} from "react-map-gl";
import { GeoJsonFeature, GeoJsonData, PriceColourIndex } from "@/lib/types";
import {
  DATA_COLOUR_RANGE,
  MAP_STARTING_POSITION,
  DATA_NODATA_COLOUR,
} from "@/constants";

const initialViewPortState: ViewState = {
  latitude: MAP_STARTING_POSITION[0],
  longitude: MAP_STARTING_POSITION[1],
  zoom: 10,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

const MapComponent = (props: {
  hdbData: GeoJsonData;
  mrtStations: GeoJsonData;
  minPrice: number;
  maxPrice: number;
}) => {
  const [viewState, setViewState] = useState(initialViewPortState);

  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(
    null
  );

  const priceColourStops: PriceColourIndex = useMemo(() => {
    const stepSize: number =
      (props.maxPrice - props.minPrice) / (DATA_COLOUR_RANGE.length - 1);
    const priceColourArray: PriceColourIndex = [];
    for (let i = 0; i < DATA_COLOUR_RANGE.length; i++) {
      priceColourArray.push({
        price: props.minPrice + i * stepSize,
        colour: DATA_COLOUR_RANGE[i],
      });
    }
    return priceColourArray;
  }, [props.minPrice, props.maxPrice]);

  const priceColourArray: (number | string)[] = useMemo(
    () => priceColourStops.map((pair) => [pair.price, pair.colour]).flat(),
    [priceColourStops]
  );

  // Define Layer styles with an interpolated color expression
  const hdbLineLayerStyle: LayerProps = useMemo(() => {
    return {
      id: "hdb-line-layer",
      type: "line",
      paint: {
        "line-color": [
          "case",
          // Check if 'price' is undefined or 0
          ["==", ["coalesce", ["get", "price"], 0], 0],
          DATA_NODATA_COLOUR,
          // Interpolate from blue (low price) to red (high price)
          [
            "interpolate",
            ["linear"],
            ["get", "price"], // The property to base the color on
            ...priceColourArray,
          ],
        ],
        "line-width": 2,
      },
    };
  }, [props.minPrice, props.maxPrice]);

  const hdbLayerStyle: LayerProps = useMemo(() => {
    return {
      id: "hdb-layer",
      type: "fill",
      paint: {
        // Color interpolation based on the "price" property of each feature
        "fill-color": [
          "case",
          // Check if 'price' is undefined or 0
          ["==", ["coalesce", ["get", "price"], 0], 0],
          DATA_NODATA_COLOUR,
          // Interpolate from blue (low price) to red (high price)
          [
            "interpolate",
            ["linear"],
            ["get", "price"], // The property to base the color on
            ...priceColourArray,
          ],
        ],
        "fill-opacity": 0.9,
      },
    };
  }, [props.minPrice, props.maxPrice]);

  const mrtLayerStyle: LayerProps = useMemo(() => {
    return {
      id: "mrt-layer",
      type: "fill",
      paint: {
        "fill-color": ["get", "color"], // Access the calculated color
        "fill-opacity": 0.6, //TODO should make mrt stations togglable. show/hide by controlling opacity
      },
    };
  }, []);

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
        interactiveLayerIds={["hdb-layer", "mrt-layer"]}
      >
        <Source id="hdb-data" type="geojson" data={props.hdbData}>
          <Layer {...hdbLayerStyle} />
          <Layer {...hdbLineLayerStyle} />
        </Source>
        <Source id="mrt-data" type="geojson" data={props.mrtStations}>
          <Layer {...mrtLayerStyle} />
        </Source>
      </Map>

      {/*selectedFeature && (
        // <div className="absolute bottom-8 left-8 p-2 border-r-8 bg-primary text-primary-foreground">
        //   <h3>Feature Info</h3>
        //   <pre>{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
        //   <button onClick={() => setSelectedFeature(null)}>Close</button>
        // </div>

        // <Card className="z-10 flex flex-col m-6 self-start w-full max-w-md backdrop-blur">
        //   <CardHeader>
        //     <CardTitle>
        //       {selectedFeature.properties.block}{" "}
        //       {selectedFeature.properties.street_name}
        //     </CardTitle>
        //     <CardDescription>
        //       Select and filter data to visualize
        //     </CardDescription>
        //   </CardHeader>
        //   <CardContent className="flex flex-col gap-2">
        //     //show postal code, a table of all units and the last 3 transactions of each unit ()
        //     <section className="flex gap-2 flex-wrap">
        //       {loadingFlatTypes
        //         ? Array.from({ length: 6 }).map((_item, index) => (
        //             <FilterButtonSkeleton
        //               key={index}
        //               length={getRandomIntInclusive(60, 150)}
        //             />
        //           ))
        //         : flatTypes.map((type) => (
        //             <FilterButton filterCategory={type} key={type} />
        //           ))}
        //     </section>
        //     <Button onClick={() => setSelectedFeature(null)}>Close</Button>
        //   </CardContent>
        // </Card>
       )*/}
    </div>
  );
};

export default MapComponent;
