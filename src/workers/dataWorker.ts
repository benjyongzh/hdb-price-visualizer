import * as Comlink from "comlink";
import { GeoJsonFeature } from "@/lib/types";

export type StreamDataWorkerArgs = {
  endpoint: Function;
  callbackPerLine: (geoJsonBatch: GeoJsonFeature) => void;
};

async function streamGeojsonDataWorker(args: StreamDataWorkerArgs) {
  const response = await args.endpoint(); // Your Django API endpoint
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
    const batches = bufferedData.split("\n");
    // Keep the last line as a buffer in case it's incomplete
    bufferedData = batches.pop() || "";
    // console.log("batches:", batches);

    for (const batch of batches) {
      if (batch.trim()) {
        // Ensure non-empty line
        const geoJsonBatch = JSON.parse(batch) as GeoJsonFeature[];
        // console.log("batch:", geoJsonBatch);
        for (let i = 0; i < geoJsonBatch.length; i++) {
          try {
            args.callbackPerLine(geoJsonBatch[i]);
          } catch (parseError) {
            console.error(
              "Failed to parse GeoJSON batch:",
              parseError,
              geoJsonBatch[i]
            );
          }
        }
      }
    }
  }
}

Comlink.expose(streamGeojsonDataWorker);
