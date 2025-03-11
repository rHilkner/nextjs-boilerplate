import pino from 'pino';
import type { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

// Configure logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

/**
 * Get a child logger with a specific context
 * @param context The context (module, function, etc.)
 * @returns A child logger with the provided context
 */
export function getLogger(context: string) {
  return logger.child({ context });
}

/**
 * Middleware to log HTTP requests
 * @param req The HTTP request
 * @param res The HTTP response
 * @param next The next middleware function
 */
export function requestLogger(req: NextRequest, res: NextResponse, next: () => void) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  
  // Create request logger with request ID
  const reqLogger = logger.child({ requestId });
  
  // Log request
  reqLogger.info({
    method: req.method,
    url: req.nextUrl.pathname,
    query: Object.fromEntries(req.nextUrl.searchParams),
    ip: req.ip || '',
    userAgent: req.headers.get('user-agent'),
  }, 'Request received');
  
  // For response logging, we use the reqLogger directly since
  // we can't attach event listeners to NextResponse
  // The response logging would need to be done after processing
  
  // Call next middleware function
  next();
}

export default logger;