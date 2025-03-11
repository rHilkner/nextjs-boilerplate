import { PrismaClient } from '@prisma/client';
import { logger } from '../logging';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

// Log query events
prisma.$on('query', (e) => {
  if (process.env.DEBUG_PRISMA === 'true') {
    logger.debug({
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    }, 'Prisma Query');
  }
});

// Log error events
prisma.$on('error', (e) => {
  logger.error({
    error: e.message,
    target: e.target,
  }, 'Prisma Error');
});

// Log info events
prisma.$on('info', (e) => {
  logger.info({
    message: e.message,
    target: e.target,
  }, 'Prisma Info');
});

// Log warn events
prisma.$on('warn', (e) => {
  logger.warn({
    message: e.message,
    target: e.target,
  }, 'Prisma Warning');
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;