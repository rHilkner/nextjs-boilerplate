import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../logging';

// Create a Prisma Client with custom event handling
const logOptions: Prisma.PrismaClientOptions = {
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient 
};

// Check if prisma client already exists in global to avoid multiple instances
export const prisma = globalForPrisma.prisma || new PrismaClient(logOptions);

// Create a type declaration that avoids the "is not assignable to parameter of type 'never'" error
declare module '@prisma/client' {
  // Define event types
  interface QueryEvent {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  }
  
  interface LogEvent {
    timestamp: Date;
    message: string;
    target: string;
  }
  
  interface PrismaClient {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    $on(eventType: string, callback: (event: any) => void): void;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

// Set up event listeners for logging
prisma.$on('query', (event) => {
  if (process.env.DEBUG_PRISMA === 'true') {
    logger.debug({
      query: event.query,
      params: event.params,
      duration: `${event.duration}ms`,
    }, 'Prisma Query');
  }
});

prisma.$on('error', (event) => {
  logger.error({
    error: event.message,
    target: event.target,
  }, 'Prisma Error');
});

prisma.$on('info', (event) => {
  logger.info({
    message: event.message,
    target: event.target,
  }, 'Prisma Info');
});

prisma.$on('warn', (event) => {
  logger.warn({
    message: event.message,
    target: event.target,
  }, 'Prisma Warning');
});

// Save prisma client to global in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;