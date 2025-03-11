import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logging';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

/**
 * Get the current user API endpoint
 */
export async function GET() {
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId });
  
  try {
    // Get the authenticated user from the JWT token
    const authUser = await getAuthUser();
    
    if (!authUser || !authUser.userId) {
      return NextResponse.json(null, { status: 401 });
    }
    
    // Get user from database with permissions
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { permissions: true },
    });
    
    if (!user) {
      log.warn({ userId: authUser.userId }, 'User not found in database');
      return NextResponse.json(null, { status: 401 });
    }
    
    // Return user data
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map(p => p.name),
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    log.error({ error }, 'Error fetching current user');
    return NextResponse.json(null, { status: 500 });
  }
}