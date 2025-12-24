import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.MYSQL_DATABASE || 'web_analytics';

export const sequelize = new Sequelize(
  dbName,
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const cleanupDuplicateIndexes = async (): Promise<void> => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: dbName,
    });

    // Get all indexes for users table
    const [indexes] = await connection.query(`
      SELECT 
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
        AND INDEX_NAME != 'PRIMARY'
      GROUP BY INDEX_NAME
      HAVING COUNT(*) > 0
    `, [dbName]) as any[];

    // Find duplicate indexes (same columns, different names)
    const indexMap = new Map<string, string[]>();
    for (const index of indexes) {
      const columns = index.COLUMNS;
      if (!indexMap.has(columns)) {
        indexMap.set(columns, []);
      }
      indexMap.get(columns)!.push(index.INDEX_NAME);
    }

    // Drop duplicate indexes (keep the first one)
    for (const [columns, indexNames] of indexMap.entries()) {
      if (indexNames.length > 1) {
        console.log(`Found duplicate indexes for columns ${columns}: ${indexNames.join(', ')}`);
        // Keep the first index, drop the rest
        for (let i = 1; i < indexNames.length; i++) {
          try {
            await connection.query(`ALTER TABLE users DROP INDEX \`${indexNames[i]}\``);
            console.log(`✅ Dropped duplicate index: ${indexNames[i]}`);
          } catch (err: any) {
            console.warn(`⚠️  Could not drop index ${indexNames[i]}:`, err.message);
          }
        }
      }
    }

    await connection.end();
  } catch (error) {
    console.warn('⚠️  Could not cleanup duplicate indexes:', error);
    // Don't throw - this is optional cleanup
  }
};

export const connectMySQL = async (): Promise<void> => {
  try {
    // First, connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' is ready.`);
    await connection.end();

    // Now connect with Sequelize
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
    
    // Sync models (in production, use migrations)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Try with alter first, but catch the "too many keys" error
        await sequelize.sync({ alter: true });
        console.log('✅ MySQL models synchronized.');
      } catch (error: any) {
        // If we get "too many keys" error, try to clean up duplicate indexes
        if (error.original?.code === 'ER_TOO_MANY_KEYS' || error.code === 'ER_TOO_MANY_KEYS') {
          console.warn('⚠️  Too many keys in table. Attempting to clean up duplicate indexes...');
          await cleanupDuplicateIndexes();
          try {
            // Try to sync without alter (won't modify existing structure)
            await sequelize.sync({ alter: false });
            console.log('✅ MySQL models synchronized (without altering existing structure).');
          } catch (syncError) {
            console.error('❌ Failed to sync models:', syncError);
            // Continue anyway - tables might already exist
            console.warn('⚠️  Continuing with existing database structure...');
          }
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error);
    throw error;
  }
};

