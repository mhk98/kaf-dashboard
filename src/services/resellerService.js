import { apiRequest, buildQuery } from "../utils/apiClient";

export const resellerService = {
  getAll: (params = {}) => apiRequest(`/resellers${buildQuery(params)}`),
  updateStatus: (id, status) =>
    apiRequest(`/resellers/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id) => apiRequest(`/resellers/${id}`, { method: "DELETE" }),
};
