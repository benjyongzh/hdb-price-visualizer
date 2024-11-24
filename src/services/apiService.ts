import apiClient from "./apiClient";

// TODO set URLs here
const apiService = {
  getBaseGeosjonPolygons: () => {
    return apiClient.get("/endpoint1").then((res) => res.data);
  },

  getFlatTypes: () => {
    return apiClient
      .get("/flat-types/")
      .then((res) => res.data)
      .then((res) => res.results);
  },

  getLatestAvg: () => {
    return apiClient.get("/polyons/latest-avg/").then((res) => res.data);
  },

  postEndpoint2: (data: object) => {
    return apiClient.post("/endpoint2", data);
  },
};

export default apiService;