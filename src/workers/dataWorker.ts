import { expose } from "comlink";
import { GeoJsonFeature } from "@/lib/types";

export type StreamWorkerOutputArgs = {
  data: GeoJsonFeature;
};

export interface DataWorkerApi {
  streamData: (endpoint: Function, callbackPerLine: Function) => Promise<void>;
}

const dataWorkerApi = {
  async streamData(endpoint: Function, callbackPerLine: Function) {
    console.log(endpoint);
    const response = await endpoint(); //!problem here. need backend to respond with real json for each batch and for whole cache object
    console.log(response);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!response.body) {
      throw { message: `ReadableStream is not supported in your environment.` };
    }

    let done = false;
    let bufferedData = "";

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      done = streamDone;
      bufferedData += decoder.decode(value, { stream: !done });

      // Split on newline to handle NDJSON format
      const batches = bufferedData.split(",[],");
      // Keep the last line as a buffer in case it's incomplete
      bufferedData = batches.pop() || "";
      // console.log("batches:", batches);

      for (const batch of batches) {
        if (batch.trim()) {
          // Ensure non-empty line
          const geoJsonBatch = JSON.parse(batch) as GeoJsonFeature[];
          for (let i = 0; i < geoJsonBatch.length; i++) {
            console.log(geoJsonBatch[i]);
            await callbackPerLine(geoJsonBatch[i]);
            // } catch (parseError) {
            //   await callbackPerLine({
            //     error: {
            //       message: `Failed to parse GeoJSON batch: ${parseError}`,
            //       batch: geoJsonBatch[i],
            //     },
            //   } as StreamWorkerOutputArgs);
            // }
          }
        }
      }
    }
  },
};

expose(dataWorkerApi);
