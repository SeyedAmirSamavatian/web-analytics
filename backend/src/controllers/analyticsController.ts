import { Request, Response, NextFunction } from 'express';
import { clickhouseClient, isClickHouseAvailable } from '../database/clickhouse';
import { Site } from '../models/Site';
import { TrackEventData, DashboardStats } from '../types';
import { AppError } from '../middleware/errorHandler';

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
      res.status(400).json({ error: 'Missing required fields' });
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
    if (!isClickHouseAvailable()) {
      res.status(503).json({ 
        error: 'Analytics service is temporarily unavailable. ClickHouse is not connected.',
        stats: {
          uniqueVisitors: 0,
          totalVisits: 0,
          avgDuration: 0,
          timeSeries: [],
          topPages: [],
          topReferrers: [],
          activeUsers: 0,
        }
      });
      return;
    }
    
    const { siteId } = req.params;
    const { startDate, endDate } = req.query;
    
    const site = await Site.findByPk(parseInt(siteId));
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const siteIdStr = site.id.toString();
    
    // Unique Visitors
    let uniqueVisitors = 0;
    try {
      const uniqueVisitorsResult = await clickhouseClient.query({
        query: `
          SELECT count(DISTINCT visitorId) as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
        },
        format: 'JSONEachRow',
      });
      
      const uniqueVisitorsData = await uniqueVisitorsResult.json() as any[];
      uniqueVisitors = parseInt(uniqueVisitorsData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching unique visitors:', error);
      throw new Error(`Failed to fetch unique visitors: ${error.message}`);
    }
    
    // Total Visits
    let totalVisits = 0;
    try {
      const totalVisitsResult = await clickhouseClient.query({
        query: `
          SELECT count() as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
        },
        format: 'JSONEachRow',
      });
      
      const totalVisitsData = await totalVisitsResult.json() as any[];
      totalVisits = parseInt(totalVisitsData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching total visits:', error);
      throw new Error(`Failed to fetch total visits: ${error.message}`);
    }
    
    // Average Duration
    let avgDuration = 0;
    try {
      const avgDurationResult = await clickhouseClient.query({
        query: `
          SELECT avg(durationSec) as avg
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
        },
        format: 'JSONEachRow',
      });
      
      const avgDurationData = await avgDurationResult.json() as any[];
      avgDuration = Math.round(parseFloat(avgDurationData[0]?.avg || '0'));
    } catch (error: any) {
      console.error('Error fetching average duration:', error);
      throw new Error(`Failed to fetch average duration: ${error.message}`);
    }
    
    // Time Series
    let timeSeries: Array<{ date: string; visits: number }> = [];
    try {
      const timeSeriesResult = await clickhouseClient.query({
        query: `
          SELECT 
            toDate(eventTime) as date,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
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
      throw new Error(`Failed to fetch time series: ${error.message}`);
    }
    
    // Top Pages
    let topPages: Array<{ pageUrl: string; visits: number }> = [];
    try {
      const topPagesResult = await clickhouseClient.query({
        query: `
          SELECT 
            pageUrl,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
          GROUP BY pageUrl
          ORDER BY visits DESC
          LIMIT 10
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
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
      throw new Error(`Failed to fetch top pages: ${error.message}`);
    }
    
    // Top Referrers
    let topReferrers: Array<{ referrer: string; visits: number }> = [];
    try {
      const topReferrersResult = await clickhouseClient.query({
        query: `
          SELECT 
            referrer,
            count() as visits
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {start:DateTime64}
          AND eventTime <= {end:DateTime64}
          AND referrer != ''
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT 10
        `,
        query_params: {
          siteId: siteIdStr,
          start: toClickHouseDateTime(start),
          end: toClickHouseDateTime(end),
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
      throw new Error(`Failed to fetch top referrers: ${error.message}`);
    }
    
    // Active Users (last 5 minutes)
    let activeUsers = 0;
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsersResult = await clickhouseClient.query({
        query: `
          SELECT count(DISTINCT visitorId) as count
          FROM traffic_events
          WHERE siteId = {siteId:String}
          AND eventTime >= {fiveMinutesAgo:DateTime64}
        `,
        query_params: {
          siteId: siteIdStr,
          fiveMinutesAgo: toClickHouseDateTime(fiveMinutesAgo),
        },
        format: 'JSONEachRow',
      });
      
      const activeUsersData = await activeUsersResult.json() as any[];
      activeUsers = parseInt(activeUsersData[0]?.count || '0');
    } catch (error: any) {
      console.error('Error fetching active users:', error);
      throw new Error(`Failed to fetch active users: ${error.message}`);
    }
    
    const stats: DashboardStats = {
      uniqueVisitors,
      totalVisits,
      avgDuration,
      timeSeries,
      topPages,
      topReferrers,
      activeUsers,
    };
    
    res.json(stats);
  } catch (err: any) {
    console.error('Error in getDashboardStats:', err);
    // Log more details about the error
    if (err.message) {
      console.error('Error message:', err.message);
    }
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
    next(err);
  }
};

