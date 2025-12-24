import { apiClient } from './client';
import { Site } from '../types';

export interface AddSiteData {
  url: string;
}

export interface AddSiteResponse {
  message: string;
  site: Site;
}

export interface SitesListResponse {
  sites: Site[];
}

export const sitesApi = {
  addSite: async (data: AddSiteData): Promise<AddSiteResponse> => {
    const response = await apiClient.post<AddSiteResponse>('/api/user/site/add', data);
    return response.data;
  },
  
  getSites: async (): Promise<SitesListResponse> => {
    const response = await apiClient.get<SitesListResponse>('/api/user/site/list');
    return response.data;
  },
  
  deleteSite: async (siteId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/user/site/${siteId}`);
    return response.data;
  },
};

