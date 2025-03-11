import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { setAuthCookie, signJwtToken } from '@/lib/auth/jwt';
import { googleAuthClient } from '@/lib/auth/google';
import { requestHandler } from '@/lib/api/request-handler';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

// Query parameters schema
const googleCallbackSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  state: z.string().optional(),
});

export const GET = requestHandler(
  { 
    isPublicEndpoint: true,
    schema: googleCallbackSchema
  },
  async ({ req }, data) => {
    try {
      const { code, error, state } = data;
      
      // Handle OAuth errors
      if (error) {
        return NextResponse.redirect(new URL('/login?error=oauth', req.url));
      }
      
      // Validate required params
      if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
      }
      
      // Exchange code for tokens
      const { tokens } = await googleAuthClient.getToken(code);
      const idToken = tokens.id_token;
      
      if (!idToken) {
        return NextResponse.redirect(new URL('/login?error=missing_id_token', req.url));
      }
      
      // Verify the ID token
      const ticket = await googleAuthClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
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
      
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    } catch (error) {
      return NextResponse.redirect(new URL('/login?error=server_error', req.url));
    }
  }
);