import { api } from '../api/client';
import { endpoints } from '../api/endpoints';

export const homeService = {
  getHomePayload: async () => {
    return api.get(endpoints.home.payload);
  },
};

export default homeService;

