import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logging';

/**
 * Health check endpoint
 * This route is public and doesn't require authentication
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId });
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    log.info('Health check successful');
    
    // Return success response
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
      },
    });
  } catch (error) {
    log.error({ error }, 'Health check failed');
    
    // Return error response
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: 'error',
      },
    }, { status: 500 });
  }
}