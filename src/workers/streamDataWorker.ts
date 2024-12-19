export interface WorkerMessage {
  type: "data" | "complete" | "error";
  chunk?: string;
  error?: string;
}

export interface WorkerCommand {
  url: string;
}

// The Web Worker script
onmessage = async (event: MessageEvent<WorkerCommand>) => {
  const { url } = event.data;

  try {
    const response = await fetch(url);
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Readable stream not supported.");

    const decoder = new TextDecoder("utf-8");
    let chunk = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunk += decoder.decode(value, { stream: true });
      postMessage({ type: "data", chunk } as WorkerMessage);
    }

    postMessage({ type: "complete" } as WorkerMessage);
  } catch (error) {
    postMessage({
      type: "error",
      error: (error as Error).message,
    } as WorkerMessage);
  }
};
