import "leaflet/dist/leaflet.css";
import { useState } from "react";

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
      <section className="flex flex-col gap-3 border-2 m-8 self-center max-w-2xl bg-orange-500">
        <header className="text-center">Controls</header>
        <section className="flex gap-2">
          <button onClick={() => fetchData()} type="button">
            click me
          </button>
        </section>
      </section>

      <div className="absolute w-full h-full -z-10">
        <Map geojsonData={geojsonData} />
      </div>
    </div>
  );
}

export default App;
