/**
 * Database configuration
 */

// Get the database URL from the environment
export const databaseUrl = process.env.DATABASE_URL;

// Database connection configuration
export const databaseConfig = {
  // The maximum number of connections in the pool
  maxConnections: 10,
  
  // The minimum number of connections in the pool
  minConnections: 2,
  
  // The maximum time in milliseconds that a connection can be idle before being removed
  idleTimeoutMs: 10000,
  
  // The maximum time in milliseconds to wait for a connection from the pool
  connectionTimeoutMs: 30000,
  
  // Log SQL queries in development
  log: process.env.NODE_ENV === 'development',
  
  // Slow query threshold in milliseconds
  slowQueryThresholdMs: 1000,
};

// Database retry configuration for transient errors
export const databaseRetry = {
  // Maximum number of retries
  maxRetries: 3,
  
  // Retry delay in milliseconds
  retryDelayMs: 500,
  
  // Exponential backoff factor
  backoffFactor: 2,
  
  // Error codes that should trigger a retry
  retryableErrorCodes: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'PROTOCOL_CONNECTION_LOST',
  ],
};

// Export default database configuration
const dbConfig = {
  databaseUrl,
  databaseConfig,
  databaseRetry,
};

export default dbConfig;