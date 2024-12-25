import apiClient from "./apiClient";

const apiService = {
  getBlocks: async () => {
    const res = await fetch(
      import.meta.env.VITE_API_URL + "/blocks/geometry/",
      {
        headers: { Accept: "application/json" },
        mode: "cors", // If cross-origin
      }
    );
    const data = await res.json(); // Convert response to a plain object
    return data; // Return JSON-serializable data
  },

  getLatestAvgPrice: async () => {
    const res = await fetch(
      import.meta.env.VITE_API_URL + "/blocks/price/latest-avg/",
      {
        headers: { Accept: "application/json" },
        mode: "cors", // If cross-origin
      }
    );
    const data = await res.json(); // Convert response to a plain object
    return data; // Return JSON-serializable data
  },

  getFlatTypes: () => {
    return apiClient.get("/flat-types/");
  },

  getMrtStations: () => {
    return apiClient.get("/mrt-stations/");
  },

  postEndpoint2: (data: object) => {
    return apiClient.post("/endpoint2", data);
  },
};

export default apiService;
