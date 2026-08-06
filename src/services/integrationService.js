import { apiRequest } from '../utils/apiClient';
export const integrationService = {
  test: (type, provider) => apiRequest(`/integrations/${type}/test`, { method: 'POST', body: JSON.stringify({ provider }) }),
};
