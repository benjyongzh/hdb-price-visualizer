import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
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
import { GeoJsonData } from "@/lib/types";

const url: string = import.meta.env.VITE_API_URL + "/polygons/latest-avg/";

import "mapbox-gl/dist/mapbox-gl.css";

const initialGeoJsonData: GeoJsonData = {
  type: "FeatureCollection",
  features: [],
};

function App() {
  const [geojsonData, setGeojsonData] =
    useState<GeoJsonData>(initialGeoJsonData);
  const [flatTypes, setFlatTypes] = useState<Array<string>>([]);
  const [loadingFlatTypes, setLoadingFlatTypes] = useState<boolean>(false);
  // const [status, setStatus] = useState<Boolean>();

  // Fetch geojson data stream
  const fetchData = async () => {
    const response = await fetch(url); // Your Django API endpoint
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) return;

    let done = false;

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      done = streamDone;
      const chunk = decoder.decode(value, { stream: !done });

      try {
        const geoJsonBatch = JSON.parse(chunk) as GeoJsonData;
        setGeojsonData((prevData) => ({
          ...prevData,
          features: [...prevData.features, ...geoJsonBatch.features],
        }));
      } catch (error) {
        console.error("Error parsing GeoJSON batch:", error);
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

  return (
    <div className="App">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Card className="flex flex-col m-6 self-start w-full max-w-md backdrop-blur">
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

        <div className="absolute w-full h-full -z-10">
          <Map geojsonData={geojsonData} />
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
