import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse MySQL connection URL
const dbUrl = process.env.DATABASE_URL;
const urlParts = new URL(dbUrl);
console.log(`🔍 CONNECTING TO MySQL: ${urlParts.hostname}${urlParts.pathname}`);

// Create MySQL connection pool
export const pool = createPool({
  uri: dbUrl,
  // Connection pool settings
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  // SSL settings for production (Hostinger VPS)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // For self-signed certificates, adjust as needed
  } : undefined,
  // Additional settings
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Initialize Drizzle ORM with MySQL
export const db = drizzle(pool, { schema, mode: 'default' });

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connection successful!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });
