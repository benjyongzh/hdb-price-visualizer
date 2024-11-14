import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "./components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Map from "./components/Map";
import { FilterButton, FilterButtonSkeleton } from "./components/FilterButton";
import { getRandomIntInclusive } from "./lib/utils";
import { GeoJsonFeature, GeoJsonData } from "@/lib/types";

const url: string = import.meta.env.VITE_API_URL + "/polygons/latest-avg/";

const initialGeoJsonData: GeoJsonData = {
  type: "FeatureCollection",
  features: [],
};

function App() {
  const [geojsonData, setGeojsonData] =
    useState<GeoJsonData>(initialGeoJsonData);
  const [flatTypes, setFlatTypes] = useState<Array<string>>([]);
  const [loadingFlatTypes, setLoadingFlatTypes] = useState<boolean>(false);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1);
  const debounceDelay = 300; // debounce delay in milliseconds
  // const [status, setStatus] = useState<Boolean>();

  // Calculate min and max prices without setting state immediately
  const computedPrices: {
    minPrice: number;
    maxPrice: number;
  } = useMemo(() => {
    const pricesArray: number[] = geojsonData.features.map(
      (feature) => feature.properties.latest_price
    );
    return {
      minPrice: Math.min(...pricesArray),
      maxPrice: Math.max(...pricesArray),
    };
  }, [geojsonData.features.length]);

  // Fetch geojson data stream
  const fetchData = async () => {
    const response = await fetch(url); // Your Django API endpoint
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) return;

    let done = false;
    let bufferedData = "";

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      done = streamDone;
      bufferedData += decoder.decode(value, { stream: !done });

      // Split on newline to handle NDJSON format
      const lines = bufferedData.split("\n");
      // Keep the last line as a buffer in case it's incomplete
      bufferedData = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          // Ensure non-empty line
          try {
            const geoJsonBatch = JSON.parse(line) as GeoJsonFeature;
            console.log("geoJsonBatch", geoJsonBatch);
            setGeojsonData((prevData) => ({
              ...prevData,
              features: [
                ...prevData.features,
                {
                  ...geoJsonBatch,
                  properties: {
                    ...geoJsonBatch.properties,
                    latest_price: parseInt(
                      geoJsonBatch.properties.latest_price
                    ),
                  },
                },
              ],
            }));
          } catch (parseError) {
            console.error("Failed to parse GeoJSON batch:", parseError, line);
          }
        }
      }
    }
  };

  useEffect(() => {
    const getFlatTypes = async () => {
      const flatTypesUrl: string =
        import.meta.env.VITE_API_URL + "/flat-types/";
      setLoadingFlatTypes(true);
      try {
        const response = await fetch(flatTypesUrl);
        const data = await response.json();
        setFlatTypes(data.results); // Update map with new data
        setLoadingFlatTypes(false);
      } catch (error) {
        console.error("Error getting flat types:", error);
        setLoadingFlatTypes(false);
      }
    };

    getFlatTypes();
  }, []);

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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App">
        <Card className="z-10 flex flex-col m-6 self-start w-full max-w-md backdrop-blur">
          <CardHeader>
            <CardTitle>HDB Resale Price Data</CardTitle>
            <CardDescription>
              Select and filter data to visualize
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <section className="flex gap-2 flex-wrap">
              {loadingFlatTypes
                ? Array.from({ length: 6 }).map((_item, index) => (
                    <FilterButtonSkeleton
                      key={index}
                      length={getRandomIntInclusive(60, 150)}
                    />
                  ))
                : flatTypes.map((type) => (
                    <FilterButton filterCategory={type} key={type} />
                  ))}
            </section>
            <Button onClick={() => fetchData()}>Latest per block</Button>
          </CardContent>
        </Card>

        <div className="absolute w-full h-full">
          <Map
            geojsonData={geojsonData}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
