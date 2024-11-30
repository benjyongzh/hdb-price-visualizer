import apiClient from "./apiClient";

// TODO set URLs here
const apiService = {
  getBlocks: () => {
    return fetch(import.meta.env.VITE_API_URL + "/blocks/", {
      headers: { Accept: "application/json" },
      mode: "cors", // If cross-origin
    });
    // return apiClient.get("/blocks/", {responseType: "stream"}).then((res) => res.data);
  },

  getLatestAvgPrice: () => {
    return fetch(import.meta.env.VITE_API_URL + "/blocks/?price=latest-avg/", {
      headers: { Accept: "application/json" },
      mode: "cors", // If cross-origin
    });
    // return apiClient.get("/blocks/?price=latest-avg/");
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
