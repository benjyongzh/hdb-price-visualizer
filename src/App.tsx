import "leaflet/dist/leaflet.css";
import { useState } from "react";
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
// import { GeoJSON } from "leaflet";
import { GeoJsonObject } from "geojson";

const url: string = import.meta.env.VITE_API_URL + "/api/polygons/latest-avg/";

function App() {
  const [geojsonData, setGeojsonData] = useState<Array<GeoJsonObject>>([]);
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

  return (
    <div className="App">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Card className="flex flex-col m-6 self-start w-full max-w-md backdrop-blur">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Select HDB Resale price data</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => fetchData()}>Click me</Button>
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
