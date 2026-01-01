export interface User {
  id: number;
  name: string;
  email: string;
  isPro: boolean;
}

export interface Site {
  id: number;
  url: string;
  trackingKey: string;
  createdAt: string;
}

export interface DashboardStats {
  uniqueVisitors: number;
  totalVisits: number;
  avgDuration: number;
  timeSeries: Array<{ date: string; visits: number }>;
  topPages: Array<{ pageUrl: string; visits: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  activeUsers: number;
  browserBreakdown: Array<{ label: string; visits: number }>;
  osBreakdown: Array<{ label: string; visits: number }>;
  deviceBreakdown: Array<{ label: string; visits: number }>;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  isPro: boolean;
  proExpiryDate: string | null;
  createdAt: string;
}

export interface AdminSiteOwner {
  id: number;
  name: string;
  email: string;
}

export interface AdminSite {
  id: number;
  url: string;
  trackingKey: string;
  createdAt: string;
  user: AdminSiteOwner | null;
}

export interface AdminOverview {
  totalUsers: number;
  totalSites: number;
  latestUsers: AdminUser[];
  latestSites: AdminSite[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

