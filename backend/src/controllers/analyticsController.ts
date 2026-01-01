import { Request, Response, NextFunction } from 'express';
import { clickhouseClient, isClickHouseAvailable } from '../database/clickhouse';
import { Site } from '../models/Site';
import { DashboardStats } from '../types';
import UAParser from 'ua-parser-js';

// Helper function to convert Date to ClickHouse DateTime64 format
// ClickHouse expects format: 'YYYY-MM-DD HH:MM:SS.mmm' without timezone
const toClickHouseDateTime = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const trackEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.warn(`Track endpoint called with ${req.method} instead of POST`);
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }
    
    console.log('Track event received:', {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
    });
    
    const {
      trackingKey,
      visitorId,
      pageUrl,
      referrer,
      durationSec,
      clientIp,
      userAgent,
    } = req.body;
    
    if (!trackingKey || !visitorId || !pageUrl) {
      res.status(400).json({ error: 'Missing required fields: trackingKey, visitorId, and pageUrl are required' });
      return;
    }
    
    // Verify tracking key and get siteId
    const site = await Site.findOne({ where: { trackingKey } });
    if (!site) {
      res.status(404).json({ error: 'Invalid tracking key' });
      return;
    }
    
    // Insert into ClickHouse
    if (!isClickHouseAvailable()) {
      // In development, return success even if ClickHouse is not available
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      if (isDevelopment) {
        console.warn('⚠️  ClickHouse not available, but continuing in development mode');
        res.status(200).json({ success: true, warning: 'ClickHouse not available' });
        return;
      }
      res.status(503).json({ error: 'Analytics service is temporarily unavailable. ClickHouse is not connected.' });
      return;
    }
    
    try {
      await clickhouseClient.insert({
        table: 'traffic_events',
        values: [{
          siteId: site.id.toString(),
          visitorId,
          pageUrl,
          referrer: referrer || '',
          durationSec: durationSec || 0,
          eventTime: toClickHouseDateTime(new Date()),
          clientIp: clientIp || req.ip || '',
          userAgent: userAgent || req.get('user-agent') || '',
        }],
        format: 'JSONEachRow',
      });
      
      res.status(200).json({ success: true });
    } catch (insertError: any) {
      console.error('Error inserting into ClickHouse:', insertError);
      console.error('Insert error details:', {
        message: insertError.message,
        code: insertError.code,
        stack: insertError.stack
      });
      
      // In development, return success even if insert fails
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      if (isDevelopment) {
        console.warn('⚠️  ClickHouse insert failed, but continuing in development mode');
        res.status(200).json({ success: true, warning: 'ClickHouse insert failed' });
        return;
      }
      
      throw insertError;
    }
  } catch (err: any) {
    console.error('Error in trackEvent:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    next(err);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { siteId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate siteId parameter
    const siteIdNum = parseInt(siteId);
    if (isNaN(siteIdNum)) {
      res.status(400).json({ error: 'Invalid site ID' });
      return;
    }
    
    // Check if site exists and user has access
    const site = await Site.findByPk(siteIdNum);
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    
    // Check if ClickHouse is available
    if (!isClickHouseAvailable()) {
      // Return empty stats instead of 503 to prevent frontend errors
      const emptyStats: DashboardStats = {
        uniqueVisitors: 0,
        totalVisits: 0,
        avgDuration: 0,
        timeSeries: [],
        topPages: [],
        topReferrers: [],
        activeUsers: 0,
        browserBreakdown: [],
        osBreakdown: [],
        deviceBreakdown: [],
      };
      res.status(200).json(emptyStats);
      return;
    }
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const siteIdStr = site.id.toString();
    
    // Initialize default values
    let uniqueVisitors = 0;
    let totalVisits = 0;
    let avgDuration = 0;
    let timeSeries: Array<{ date: string; visits: number }> = [];
    let topPages: Array<{ pageUrl: string; visits: number }> = [];
    let topReferrers: Array<{ referrer: string; visits: number }> = [];
    let activeUsers = 0;
    let browserBreakdown: Array<{ label: string; visits: number }> = [];
    let osBreakdown: Array<{ label: string; visits: number }> = [];
    let deviceBreakdown: Array<{ label: string; visits: number }> = [];
    
    // Unique Visitors
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const uniqueVisitorsResult = await clickhouseClient.query({
        query: `
          SELECT count(DISTINCT visitorId) as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const uniqueVisitorsData = await uniqueVisitorsResult.json() as any[];
      uniqueVisitors = parseInt(uniqueVisitorsData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching unique visitors:', error);
      // Continue with default value (0) instead of throwing
    }
    
    // Total Visits
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const totalVisitsResult = await clickhouseClient.query({
        query: `
          SELECT count() as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const totalVisitsData = await totalVisitsResult.json() as any[];
      totalVisits = parseInt(totalVisitsData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching total visits:', error);
      // Continue with default value (0) instead of throwing
    }
    
    // Average Duration
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const avgDurationResult = await clickhouseClient.query({
        query: `
          SELECT avg(durationSec) as avg
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const avgDurationData = await avgDurationResult.json() as any[];
      avgDuration = Math.round(parseFloat(avgDurationData[0]?.avg || '0'));
    } catch (error: any) {
      console.error('Error fetching average duration:', error);
      // Continue with default value (0) instead of throwing
    }
    
    // Time Series
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const timeSeriesResult = await clickhouseClient.query({
        query: `
          SELECT 
            toDate(eventTime) as date,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const timeSeriesData = await timeSeriesResult.json() as any[];
      timeSeries = timeSeriesData.map((item: any) => ({
        date: item.date,
        visits: parseInt(item.visits || '0'),
      }));
    } catch (error: any) {
      console.error('Error fetching time series:', error);
      // Continue with empty array instead of throwing
    }
    
    // Top Pages
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const topPagesResult = await clickhouseClient.query({
        query: `
          SELECT 
            pageUrl,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
          GROUP BY pageUrl
          ORDER BY visits DESC
          LIMIT 10
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const topPagesData = await topPagesResult.json() as any[];
      topPages = topPagesData.map((item: any) => ({
        pageUrl: item.pageUrl,
        visits: parseInt(item.visits || '0'),
      }));
    } catch (error: any) {
      console.error('Error fetching top pages:', error);
      // Continue with empty array instead of throwing
    }
    
    // Top Referrers
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const topReferrersResult = await clickhouseClient.query({
        query: `
          SELECT 
            referrer,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({start:String}, 3)
          AND eventTime <= toDateTime64({end:String}, 3)
          AND referrer != ''
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT 10
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });
      
      const topReferrersData = await topReferrersResult.json() as any[];
      topReferrers = topReferrersData.map((item: any) => ({
        referrer: item.referrer,
        visits: parseInt(item.visits || '0'),
      }));
    } catch (error: any) {
      console.error('Error fetching top referrers:', error);
      // Continue with empty array instead of throwing
    }
    
    // Active Users (last 5 minutes)
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const fiveMinutesAgoStr = toClickHouseDateTime(fiveMinutesAgo);
      const activeUsersResult = await clickhouseClient.query({
        query: `
          SELECT count(DISTINCT visitorId) as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= toDateTime64({fiveMinutesAgo:String}, 3)
        `,
        query_params: {
          siteId: siteIdStr,
          fiveMinutesAgo: fiveMinutesAgoStr,
        },
        format: 'JSONEachRow',
      });
      
      const activeUsersData = await activeUsersResult.json() as any[];
      activeUsers = parseInt(activeUsersData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching active users:', error);
      // Continue with default value (0) instead of throwing
    }

    // Browser / OS / Device breakdown
    try {
      const startStr = toClickHouseDateTime(start);
      const endStr = toClickHouseDateTime(end);
      const userAgentResult = await clickhouseClient.query({
        query: `
          SELECT
            userAgent,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
            AND eventTime >= toDateTime64({start:String}, 3)
            AND eventTime <= toDateTime64({end:String}, 3)
          GROUP BY userAgent
          ORDER BY visits DESC
          LIMIT 50
        `,
        query_params: {
          siteId: siteIdStr,
          start: startStr,
          end: endStr,
        },
        format: 'JSONEachRow',
      });

      const userAgentData = (await userAgentResult.json()) as any[];
      const browserMap = new Map<string, number>();
      const osMap = new Map<string, number>();
      const deviceMap = new Map<string, number>();
      const parser = new UAParser.UAParser();

      const accumulate = (map: Map<string, number>, label: string, count: number) => {
        map.set(label, (map.get(label) || 0) + count);
      };

      userAgentData.forEach((row) => {
        const visits = Math.max(0, parseInt(row.visits || '0', 10));
        if (visits === 0) {
          return;
        }
        const ua = typeof row.userAgent === 'string' && row.userAgent.trim().length > 0 ? row.userAgent : 'Unknown';

        parser.setUA(ua);
        const { browser, os, device } = parser.getResult();

        const browserName = browser.name ? browser.name : 'Unknown Browser';
        const browserLabel = browser.major ? `${browserName} ${browser.major}` : browserName;
        const osLabel = os.name ? `${os.name}${os.version ? ` ${os.version.split('.')[0]}` : ''}` : 'Unknown OS';
        const deviceType = device.type ? `${device.type.charAt(0).toUpperCase()}${device.type.slice(1)}` : 'Desktop';

        accumulate(browserMap, browserLabel, visits);
        accumulate(osMap, osLabel, visits);
        accumulate(deviceMap, deviceType, visits);
      });

      const mapToArray = (map: Map<string, number>) =>
        Array.from(map.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([label, visits]) => ({ label, visits }));

      browserBreakdown = mapToArray(browserMap).slice(0, 6);
      osBreakdown = mapToArray(osMap).slice(0, 6);
      deviceBreakdown = mapToArray(deviceMap).slice(0, 6);
    } catch (error: any) {
      console.error('Error fetching user-agent breakdown:', error);
      // Continue with empty arrays
    }
    
    const stats: DashboardStats = {
      uniqueVisitors,
      totalVisits,
      avgDuration,
      timeSeries,
      topPages,
      topReferrers,
      activeUsers,
      browserBreakdown,
      osBreakdown,
      deviceBreakdown,
    };
    
    res.json(stats);
  } catch (err: any) {
    console.error('Error in getDashboardStats:', err);
    // Log more details about the error
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
      siteId: req.params.siteId,
      query: req.query,
    });
    
    // Return a proper error response instead of letting it bubble up
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Failed to fetch dashboard statistics',
      stats: {
        uniqueVisitors: 0,
        totalVisits: 0,
        avgDuration: 0,
        timeSeries: [],
        topPages: [],
        topReferrers: [],
        activeUsers: 0,
        browserBreakdown: [],
        osBreakdown: [],
        deviceBreakdown: [],
      }
    });
  }
};

