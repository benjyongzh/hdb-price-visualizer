import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ThemeProvider } from "./components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CircleHelp, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

import Map from "./components/Map";
import { FilterButton, FilterButtonSkeleton } from "./components/FilterButton";
import { getRandomIntInclusive, formatMoneyString } from "./lib/utils";
import { GeoJsonFeature, GeoJsonData } from "@/lib/types";
import apiService from "./services/apiService";
import { AxiosResponse } from "axios";

const sliderDefaultvalue: number = 400000;
const sliderMinValue: number = 50000;
const sliderMaxValue: number = 2000000;
const debounceDelay = 300; // debounce delay in milliseconds

const initialGeojsonData: GeoJsonData = {
  type: "FeatureCollection",
  features: [],
};

function App() {
  const [hdbData, setHdbData] = useState<GeoJsonData>({
    ...initialGeojsonData,
  });
  const [mrtStations, setMrtStations] = useState<GeoJsonData>({
    ...initialGeojsonData,
  });
  const [flatTypes, setFlatTypes] = useState<Array<string> | string>([]);
  const [loadingFlatTypes, setLoadingFlatTypes] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(sliderDefaultvalue);
  const [filterIsOpen, setFilterIsOpen] = useState<boolean>(false);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1);
  // const [status, setStatus] = useState<Boolean>();

  // Calculate min and max prices without setting state immediately
  const computedPrices: {
    minPrice: number;
    maxPrice: number;
  } = useMemo(() => {
    const pricesArray: number[] = hdbData.features.map((feature) =>
      feature.properties.price ? feature.properties.price : 0
    );
    return {
      minPrice: Math.min(...pricesArray),
      maxPrice: Math.max(...pricesArray) > 0 ? Math.max(...pricesArray) : 1,
    };
  }, [hdbData.features.length]);

  // Fetch geojson data stream
  const fetchStreamGeojsonData = useCallback(
    async (endpoint: Function, callbackPerLine: Function) => {
      const response = await endpoint(); // Your Django API endpoint
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
              callbackPerLine(line);
            } catch (parseError) {
              console.error("Failed to parse GeoJSON batch:", parseError, line);
            }
          }
        }
      }
    },
    []
  );

  const fetchMrtStations = useCallback(async () => {
    try {
      await apiService
        .getMrtStations()
        .then((res) => res.data.results)
        .then((data) =>
          data.map((feature: GeoJsonFeature) => {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                color:
                  feature.properties.lines[0] &&
                  feature.properties.lines[0].color
                    ? `#${feature.properties.lines[0].color}`
                    : "#555555",
              },
            };
          })
        )
        .then((data) =>
          setMrtStations({
            ...initialGeojsonData,
            features: [...data],
          })
        );
    } catch (err) {
      console.log("Error getting Mrt Stations:", err);
    }
  }, []);

  const getLatestPrices = useCallback(() => {
    // fetchStreamGeojsonData(
    //   apiService.getLatestAvgPrice,
    //   (line: string /* propertiesToOverride: string[] */) => {
    //     const geoJsonBatch = JSON.parse(line) as GeoJsonFeature;
    //     console.log("geoJsonBatch", geoJsonBatch);
    //     // TODO find out how to add onto existing geojsons
    //     setHdbData((prevData) => ({
    //       ...prevData,
    //       features: [
    //         ...prevData.features,
    //         {
    //           ...geoJsonBatch,
    //           properties: {
    //             ...geoJsonBatch.properties,
    //             // TODO find out how to input other properties
    //             //  propertiesToOverride.map((property:string)=> property: parseInt(geoJsonBatch.properties[property]),
    //             // ),
    //             latest_price: parseInt(geoJsonBatch.properties.latest_price),
    //           },
    //         },
    //       ],
    //     }));
    //   }
    // );
  }, []);

  const getFlatTypes = useCallback(async () => {
    setLoadingFlatTypes(true);
    try {
      await apiService
        .getFlatTypes()
        .then((res) => res.data.results)
        .then((results) => {
          setFlatTypes(results); // Update map with new data
          setLoadingFlatTypes(false);
        });
    } catch (error) {
      console.log("Error getting Flat Types:", error);
      setFlatTypes("Error getting flat Types"); // Update map with new data
      setLoadingFlatTypes(false);
    }
  }, []);

  // get all geojsondata without any properties yet. to show all the flats first
  useEffect(() => {
    fetchStreamGeojsonData(apiService.getBlocks, (line: string) => {
      const geoJsonBatch = JSON.parse(line) as GeoJsonFeature;
      setHdbData((prevData) => ({
        ...prevData,
        features: [
          ...prevData.features,
          {
            ...geoJsonBatch,
            properties: { ...geoJsonBatch.properties },
          },
        ],
      }));
    });
    fetchMrtStations();
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
  }, [computedPrices]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App">
        <Card className="z-10 flex flex-col m-6 self-start w-full max-w-md backdrop-blur">
          <CardHeader>
            <CardTitle>HDB Resale Price Data</CardTitle>
            <CardDescription>
              Select and filter data to visualize past resale transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <section className="flex items-center min-h-11 h-11">
              <div className="flex flex-col gap-2 justify-between w-full">
                <Label
                  htmlFor="budget"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    Budget
                    <Popover>
                      <PopoverTrigger>
                        <Button size="icon" variant="ghost" className="w-7 h-7">
                          <CircleHelp color="hsl(217, 0%, 90%)" size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="text-center">
                        Set your maximum resale price
                      </PopoverContent>
                    </Popover>
                  </div>

                  <p className="text-right">
                    $ {formatMoneyString(sliderValue)}
                  </p>
                </Label>
                <Slider
                  defaultValue={[sliderDefaultvalue]}
                  min={sliderMinValue}
                  max={sliderMaxValue}
                  onValueChange={([value]) => setSliderValue(value)}
                  name="budget"
                  step={1000}
                />
              </div>
              <Separator orientation="vertical" className="ml-4 mr-2" />
              <Button
                onClick={() => setFilterIsOpen(!filterIsOpen)}
                variant="ghost"
                className={`aspect-square p-0 m-0 ${
                  filterIsOpen ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <SlidersHorizontal />
              </Button>
            </section>
            <Accordion
              type="single"
              collapsible
              value={filterIsOpen ? "filter-section" : undefined}
            >
              <AccordionItem value="filter-section">
                <AccordionContent>
                  <Separator className="mb-4" />
                  <section className="flex flex-col gap-2 justify-start">
                    <h2>Filters</h2>
                    <section className="flex gap-2 flex-wrap">
                      {loadingFlatTypes
                        ? Array.from({ length: 6 }).map((_item, index) => (
                            <FilterButtonSkeleton
                              key={index}
                              length={getRandomIntInclusive(60, 150)}
                            />
                          ))
                        : Array.isArray(flatTypes)
                        ? flatTypes.map((type) => (
                            <FilterButton filterCategory={type} key={type} />
                          ))
                        : flatTypes}
                    </section>
                  </section>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button onClick={() => getLatestPrices()}>Filter</Button>
          </CardContent>
        </Card>

        <div className="absolute w-full h-full">
          <Map
            hdbData={hdbData}
            mrtStations={mrtStations}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
