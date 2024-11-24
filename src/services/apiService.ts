import apiClient from "./apiClient";

// TODO set URLs here
const apiService = {
  getBlocks: () => {
    return apiClient.get("/blocks/").then((res) => res.data);
  },

  getFlatTypes: () => {
    return apiClient
      .get("/flat-types/")
      .then((res) => res.data)
      .then((res) => res.results);
  },

  getLatestAvgPrice: () => {
    return apiClient.get("/blocks/?price=latest-avg/").then((res) => res.data);
  },

  getMrtStations: () => {
    return apiClient.get("/mrt-stations/").then((res) => res.data);
  },

  postEndpoint2: (data: object) => {
    return apiClient.post("/endpoint2", data);
  },
};

export default apiService;
