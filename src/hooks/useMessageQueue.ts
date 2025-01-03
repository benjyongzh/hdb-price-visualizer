import { useCallback, useState, useEffect } from "react";

export const useMessageQueue = () => {
  const [queue, setQueue] = useState<Array<Function>>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const enqueue = useCallback((item: Function) => {
    setQueue((current) => [...current, item]);
    if (!isProcessing) processQueue();
  }, []);

  const dequeue = useCallback(async () => {
    await queue[0]();
    setQueue((current) => current.slice(1));
  }, []);

  const processQueue = async () => {
    setIsProcessing(true);

    while (queue.length > 0) {
      await dequeue();
      await delay(500); // Delay between function calls
    }
    setIsProcessing(false);
  };

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    // Cleanup if needed (not strictly required in this example)
    return () => {
      setQueue([]); // Reset queue on unmount
    };
  }, []);

  return {
    enqueue,
    queue,
  };
};
