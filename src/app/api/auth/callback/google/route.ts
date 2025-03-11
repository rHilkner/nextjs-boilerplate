import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging';
import { prisma } from '@/lib/db/prisma';
import { setAuthCookie, signJwtToken } from '@/lib/auth/jwt';
import { googleAuthClient } from '@/lib/auth/google';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId });
  
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    
    // Handle OAuth errors
    if (error) {
      log.error({ error }, 'Google OAuth error');
      return NextResponse.redirect(new URL('/login?error=oauth', req.url));
    }
    
    // Validate required params
    if (!code) {
      log.error('Missing authorization code');
      return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
    }
    
    // Exchange code for tokens
    const { tokens } = await googleAuthClient.getToken(code);
    const idToken = tokens.id_token;
    
    if (!idToken) {
      log.error('Missing ID token');
      return NextResponse.redirect(new URL('/login?error=missing_id_token', req.url));
    }
    
    // Verify the ID token
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      log.error('Invalid ID token payload');
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }
    
    const { email, sub: googleId, name, picture } = payload;
    
    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ],
      },
      include: {
        permissions: true,
      },
    });
    
    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          name: name || user.name,
          avatar: picture || user.avatar,
        },
        include: {
          permissions: true,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          avatar: picture,
          role: 'CUSTOMER', // Default role
        },
        include: {
          permissions: true,
        },
      });
      
      log.info({ userId: user.id }, 'New user created');
    }
    
    // Create JWT token
    const token = await signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map(p => p.name),
    });
    
    // Set auth cookie
    setAuthCookie(token);
    
    // Redirect to the requested page or dashboard
    const redirectUrl = state ? decodeURIComponent(state) : '/dashboard';
    
    log.info({ userId: user.id, redirectUrl }, 'User authenticated successfully');
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    log.error({ error }, 'Google OAuth callback error');
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}