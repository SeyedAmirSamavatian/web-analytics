import { apiClient } from './client';
import { AdminOverview } from '../types';

export const adminApi = {
  getOverview: async (): Promise<AdminOverview> => {
    const response = await apiClient.get<AdminOverview>('/api/admin/overview');
    return response.data;
  },
};

