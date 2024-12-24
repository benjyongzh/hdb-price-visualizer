import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useCallback } from "react";
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
import {
  PRICE_SLIDER_DEFAULT_VALUE,
  PRICE_SLIDER_MIN_VALUE,
  PRICE_SLIDER_MAX_VALUE,
} from "./constants";
import { wrap, proxy } from "comlink";

const initialGeojsonData: GeoJsonData = {
  type: "FeatureCollection",
  features: [],
};

import { StreamWorkerInputArgs, StreamWorkerOutputArgs } from "@/lib/types";
import StreamWorker from "./workers/dataWorker?worker";
import { DataWorkerApi } from "./workers/dataWorker";

function App() {
  const [hdbData, setHdbData] = useState<GeoJsonData>({
    ...initialGeojsonData,
  });
  const [mrtStations, setMrtStations] = useState<GeoJsonData>({
    ...initialGeojsonData,
  });
  const [flatTypes, setFlatTypes] = useState<Array<string> | string>([]);
  const [loadingFlatTypes, setLoadingFlatTypes] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(
    PRICE_SLIDER_DEFAULT_VALUE
  );
  const [filterIsOpen, setFilterIsOpen] = useState<boolean>(false);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1);
  // const [status, setStatus] = useState<Boolean>();

  // Calculate min and max prices without setting state immediately
  const computePriceLimits = useCallback((pricesArray: number[]) => {
    setMaxPrice(Math.max(...pricesArray) > 0 ? Math.max(...pricesArray) : 1);
    setMinPrice(
      maxPrice === Math.min(...pricesArray) ? 0 : Math.min(...pricesArray)
    );
  }, []);

  // const fetchStreamGeojsonData = useCallback(
  //   async (
  //     endpoint: Function,
  //     callbackPerLine: (geoJsonBatch: GeoJsonFeature) => void
  //   ) => {
  //     // Call the `streamData` method directly on the proxied worker instance
  //     console.log("fetchstream triggered");
  //     // Wrap the worker with Comlink
  //     const streamDataApi = Comlink.wrap<(args: StreamDataWorkerArgs) => void>(
  //       new Worker(new URL("./workers/dataWorker.ts", import.meta.url))
  //     );
  //     console.log("streamDataApi", streamDataApi);

  //     await streamDataApi({
  //       endpoint: Comlink.proxy(endpoint),
  //       callbackPerLine: Comlink.proxy(callbackPerLine),
  //     });
  //   },
  //   []
  // );

  // Fetch geojson data stream
  // const fetchStreamGeojsonData = useCallback(
  //   async (endpoint: Function, callbackPerLine: Function) => {
  //     const response = await endpoint(); // Your Django API endpoint
  //     const reader = response.body?.getReader();
  //     const decoder = new TextDecoder("utf-8");

  //     if (!reader) return;

  //     let done = false;
  //     let bufferedData = "";

  //     while (!done) {
  //       const { done: streamDone, value } = await reader.read();
  //       done = streamDone;
  //       bufferedData += decoder.decode(value, { stream: !done });

  //       // Split on newline to handle NDJSON format
  //       const batches = bufferedData.split("\n");
  //       // Keep the last line as a buffer in case it's incomplete
  //       bufferedData = batches.pop() || "";
  //       // console.log("batches:", batches);

  //       for (const batch of batches) {
  //         if (batch.trim()) {
  //           // Ensure non-empty line
  //           const geoJsonBatch = JSON.parse(batch) as GeoJsonFeature[];
  //           // console.log("batch:", geoJsonBatch);
  //           for (let i = 0; i < geoJsonBatch.length; i++) {
  //             try {
  //               callbackPerLine(geoJsonBatch[i]);
  //             } catch (parseError) {
  //               console.error(
  //                 "Failed to parse GeoJSON batch:",
  //                 parseError,
  //                 geoJsonBatch[i]
  //               );
  //             }
  //           }
  //         }
  //       }
  //     }
  //   },
  //   []
  // );

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
    // const batchSize: number = 500;
    // const prices: number[] = [];
    // fetchStreamGeojsonData(
    //   apiService.getLatestAvgPrice,
    //   (geoJsonBatch: GeoJsonFeature) => {
    //     setHdbData((prevData) => ({
    //       ...prevData,
    //       features: prevData.features.map((item) =>
    //         item.id === geoJsonBatch.id
    //           ? {
    //               ...item,
    //               properties: {
    //                 ...item.properties,
    //                 price: parseFloat(geoJsonBatch.properties.price),
    //               },
    //             }
    //           : item
    //       ),
    //     }));
    //     prices.push(parseInt(geoJsonBatch.properties.price));
    //     if (
    //       geoJsonBatch.id % batchSize == 0 ||
    //       geoJsonBatch.id >= hdbData.features.length - 1
    //     ) {
    //       computePriceLimits(prices);
    //     }
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
    const streamWorker = new StreamWorker();
    const workerApi = wrap<DataWorkerApi>(streamWorker);

    const endpoint = proxy(() => apiService.getBlocks());
    const callbackPerLine = proxy(
      (callbackData: {
        data: GeoJsonFeature | null;
        error: { message: string; batch: GeoJsonFeature } | null;
      }) => {
        if (callbackData.data) {
          setHdbData((prevData) => ({
            ...prevData,
            features: [
              ...prevData.features,
              {
                ...callbackData.data!,
                properties: { ...callbackData.data!.properties },
              },
            ],
          }));
        } else {
          console.log(callbackData.error?.message, callbackData.error?.batch);
        }
      }
    );

    // streamWorker.onmessage = (event) => {
    //   const { done, error } = event.data as StreamWorkerOutputArgs;

    //   if (error) {
    //     // setError(error);
    //     // setLoading(false);
    //     console.log(error.message, error.batch);
    //     streamWorker.terminate();
    //     return;
    //   }

    //   if (done) {
    //     // setLoading(false);
    //     streamWorker.terminate();
    //   }
    // };

    // streamWorker.onerror = (err) => {
    //   // setError(err.message);
    //   // setLoading(false);
    //   console.log(err);
    //   streamWorker.terminate();
    // };

    // setLoading(true);
    // streamWorker.postMessage({
    //   endpoint: apiService.getBlocks,
    //   callback: (data: GeoJsonFeature) => {
    //     setHdbData((prevData) => ({
    //       ...prevData,
    //       features: [
    //         ...prevData.features,
    //         {
    //           ...data,
    //           properties: { ...data.properties },
    //         },
    //       ],
    //     }));
    //   },
    // } as StreamWorkerInputArgs);
    const fetchInitialBlockData = async () => {
      try {
        await workerApi.streamData(endpoint, callbackPerLine);
      } catch (err) {
        console.log(err);
      } finally {
        streamWorker.terminate();
      }
    };

    fetchInitialBlockData();

    return () => streamWorker.terminate();
  }, []);

  useEffect(() => {
    setHdbData({ ...initialGeojsonData });
    fetchMrtStations();
    getFlatTypes();
  }, []);

  // TODO make card fully minimised in mobile. the whole card is the filter coming from bottom by clicking a button at bottom. in pc the whole filter should be a default part of the ui (no need accordion buttons etc)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App">
        <Card className="z-10 flex flex-col m-6 self-start w-full max-w-sm backdrop-blur">
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
                      <PopoverTrigger asChild>
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
                  defaultValue={[PRICE_SLIDER_DEFAULT_VALUE]}
                  min={PRICE_SLIDER_MIN_VALUE}
                  max={PRICE_SLIDER_MAX_VALUE}
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
                <AccordionContent className="AccordionContent">
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
