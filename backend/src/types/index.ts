export interface AuthRequest extends Express.Request {
  userId?: number;
}

export interface TrackEventData {
  siteId: string;
  visitorId: string;
  pageUrl: string;
  referrer: string;
  durationSec: number;
  clientIp: string;
  userAgent: string;
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

