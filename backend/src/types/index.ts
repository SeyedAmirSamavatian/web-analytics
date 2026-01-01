import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  body: any;
  params: any;
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
  browserBreakdown: Array<{ label: string; visits: number }>;
  osBreakdown: Array<{ label: string; visits: number }>;
  deviceBreakdown: Array<{ label: string; visits: number }>;
}

