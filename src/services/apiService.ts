import apiClient from "./apiClient";

const apiService = {
  getBlocks: () => {
    return fetch(import.meta.env.VITE_API_URL + "/blocks/geometry/", {
      headers: { Accept: "application/json" },
      mode: "cors", // If cross-origin
    });
  },

  // getLatestAvgPrice: () => {
  //   return apiClient.get("/blocks/price/latest-avg/");
  // },

  getLatestAvgPrice: () => {
    return fetch(import.meta.env.VITE_API_URL + "/blocks/price/latest-avg/", {
      headers: { Accept: "application/json" },
      mode: "cors", // If cross-origin
    });
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
