import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requestHandler } from '@/lib/api/request-handler';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint
 * This route is public and doesn't require authentication
 */
export const GET = requestHandler(
  { isPublicEndpoint: true },
  async () => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Return success response
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
        },
      });
    } catch (error) {
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
);