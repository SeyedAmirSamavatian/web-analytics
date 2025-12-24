import { apiClient } from './client';
import { DashboardStats } from '../types';

export const analyticsApi = {
  getDashboardStats: async (siteId: number, startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<DashboardStats>(
      `/api/analytics/dashboard/${siteId}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },
};

