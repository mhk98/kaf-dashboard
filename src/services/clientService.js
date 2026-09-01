import { apiRequest, buildQuery } from "../utils/apiClient";

export const clientService = {
  getAll: (params) => apiRequest(`/clients${buildQuery(params)}`),
  getAllList: () => apiRequest("/clients/all"),
  getById: (id) => apiRequest(`/clients/${id}`),
  create: (data) => apiRequest("/clients/create", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/clients/${id}`, { method: "DELETE" }),
};
