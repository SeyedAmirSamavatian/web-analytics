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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

