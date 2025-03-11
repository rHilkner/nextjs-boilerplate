import pino from 'pino';

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
export function requestLogger(req: any, res: any, next: any) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startTime = Date.now();
  
  // Attach request ID to the request
  req.requestId = requestId;
  
  // Attach a child logger to the request
  req.log = logger.child({ requestId });
  
  // Log request
  req.log.info({
    method: req.method,
    url: req.url,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, 'Request received');
  
  // Log response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    req.log.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
    }, 'Response sent');
  });
  
  next();
}

export default logger;