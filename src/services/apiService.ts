import apiClient from "./apiClient";

// TODO set URLs here
const apiService = {
  getBlocks: () => {
    return apiClient.get("/blocks/");
  },

  getLatestAvgPrice: () => {
    return apiClient.get("/blocks/?price=latest-avg/");
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
