import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { prisma } from '../db/prisma';
import { logger } from '../logging';

interface RequestHandlerOptions {
  requiredRole?: 'CUSTOMER' | 'ADMIN';
  requiredPermissions?: string[];
}

/**
 * A typed request handler utility for Next.js API routes
 * 
 * @param req The Next.js request object
 * @param schema The Zod schema for validating the request body
 * @param handler The handler function to process the request
 * @param options Options for authorization
 * @returns A Next.js response
 */
export async function withAuth<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  handler: (data: T, userId: string, role: string) => Promise<NextResponse>,
  options: RequestHandlerOptions = {}
) {
  // Get request ID from headers (set by middleware)
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId });
  
  try {
    // Extract user information from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId || !userRole) {
      log.error('User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check role requirements
    if (options.requiredRole && userRole !== options.requiredRole) {
      log.error({ userRole, requiredRole: options.requiredRole }, 'Insufficient role');
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
      });
      
      if (!user) {
        log.error({ userId }, 'User not found');
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      const hasPermissions = options.requiredPermissions.every(
        permission => user.permissions.some(p => p.name === permission)
      );
      
      if (!hasPermissions) {
        log.error(
          { 
            userId, 
            userPermissions: user.permissions.map(p => p.name), 
            requiredPermissions: options.requiredPermissions 
          },
          'Insufficient permissions'
        );
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    // Parse and validate request data
    let data: T;
    
    try {
      const body = await req.json();
      data = schema.parse(body);
    } catch (error) {
      log.error({ error }, 'Invalid request data');
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Call the handler with validated data and user info
    return await handler(data, userId, userRole);
  } catch (error) {
    log.error({ error }, 'Request handler error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * A typed request handler utility for Next.js API routes that don't require authentication
 * 
 * @param req The Next.js request object
 * @param schema The Zod schema for validating the request body
 * @param handler The handler function to process the request
 * @returns A Next.js response
 */
export async function withoutAuth<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<NextResponse>
) {
  // Get request ID from headers (set by middleware)
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId });
  
  try {
    // Parse and validate request data
    let data: T;
    
    try {
      const body = await req.json();
      data = schema.parse(body);
    } catch (error) {
      log.error({ error }, 'Invalid request data');
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Call the handler with validated data
    return await handler(data);
  } catch (error) {
    log.error({ error }, 'Request handler error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}