import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';

dotenv.config();

export const clickhouseClient = createClient({
  host: `http://${process.env.CLICKHOUSE_HOST || 'localhost'}:${process.env.CLICKHOUSE_PORT || '8123'}`,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'web_analytics',
});

let isClickHouseConnected = false;

export const isClickHouseAvailable = (): boolean => {
  return isClickHouseConnected;
};

export const connectClickHouse = async (): Promise<void> => {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  try {
    // Test connection only
    await clickhouseClient.ping();
    console.log('✅ ClickHouse connection established successfully.');
    isClickHouseConnected = true;
  } catch (error) {
    // اگر اتصال اولیه برقرار نشد، در محیط توسعه فقط هشدار بده و ادامه بده
    if (isDevelopment) {
      console.warn('⚠️  ClickHouse connection test failed. Analytics features will be limited.');
      console.warn('   To enable full analytics, please install and run ClickHouse.');
      console.warn('   Server will continue without ClickHouse in development mode.');
      console.warn('   Underlying error:', error);
      isClickHouseConnected = false;
      return;
    } else {
      console.error('❌ Unable to connect to ClickHouse:', error);
      isClickHouseConnected = false;
      throw error;
    }
  }

  // در صورت موفق بودن اتصال، تلاش برای ساخت دیتابیس و جدول‌ها (در صورت خطا، فقط لاگ بگیر)
  try {
    await clickhouseClient.exec({
      query: `CREATE DATABASE IF NOT EXISTS ${process.env.CLICKHOUSE_DATABASE || 'web_analytics'}`,
    });

    await clickhouseClient.exec({
      query: `
        CREATE TABLE IF NOT EXISTS traffic_events (
          siteId String,
          visitorId String,
          pageUrl String,
          referrer String,
          durationSec Int32,
          eventTime DateTime64(3),
          clientIp String,
          userAgent String
        ) ENGINE = MergeTree()
        ORDER BY (siteId, eventTime)
        PARTITION BY toYYYYMM(eventTime)
        TTL eventTime + INTERVAL 1 YEAR
        SETTINGS index_granularity = 8192
      `,
    });

    console.log('✅ ClickHouse database and tables initialized.');
  } catch (schemaError) {
    console.warn('⚠️  ClickHouse schema initialization failed. Analytics may be partially available.');
    console.warn('   Underlying schema error:', schemaError);
    // اتصال کلی برقرار است، پس isClickHouseConnected را false نکن
  }
};

