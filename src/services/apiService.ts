import apiClient from "./apiClient";

// TODO set URLs here
const apiService = {
  getBaseGeosjonPolygons: () => {
    return apiClient.get("/endpoint1");
  },

  getFlatTypes: () => {
    return apiClient.get("/flat-types/");
  },

  getLatestAvg: () => {
    return apiClient.get("/polyons/latest-avg/");
  },

  postEndpoint2: (data: object) => {
    return apiClient.post("/endpoint2", data);
  },
};

export default apiService;
