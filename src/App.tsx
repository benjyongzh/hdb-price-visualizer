import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Map from "./components/Map";
import { FilterButton, FilterButtonSkeleton } from "./components/FilterButton";
import { GeoJsonObject } from "geojson";
import { getRandomIntInclusive } from "./lib/utils";

const url: string = import.meta.env.VITE_API_URL + "/api/polygons/latest-avg/";

function App() {
  const [geojsonData, setGeojsonData] = useState<Array<GeoJsonObject>>([]);
  const [flatTypes, setFlatTypes] = useState<Array<string>>([]);
  const [loadingFlatTypes, setLoadingFlatTypes] = useState<boolean>(false);
  // const [status, setStatus] = useState<Boolean>();

  // Fetch geojson data stream
  const fetchData = async () => {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result;
    let receivedData: GeoJsonObject[] = [];
    while (!(result = await reader.read()).done) {
      const chunk = decoder.decode(result.value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);
      lines.forEach((line) => {
        try {
          const feature = JSON.parse(line);
          receivedData.push(feature);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });
      setGeojsonData([...receivedData]); // Update map with new data
    }
  };

  useEffect(() => {
    const getFlatTypes = async () => {
      const flatTypesUrl: string = "";
      setLoadingFlatTypes(true);
      try {
        const response = await fetch(flatTypesUrl);
        const types: string[] = await response.json();
        setFlatTypes(types); // Update map with new data
        // setLoadingFlatTypes(false);
      } catch (error) {
        console.error("Error getting flat types:", error);
        // setLoadingFlatTypes(false);
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
                    <FilterButton filterCategory={type} />
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
