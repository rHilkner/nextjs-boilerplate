import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/lib/auth/google';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

/**
 * Login API endpoint
 * Redirects to Google OAuth login page
 */
export async function GET(req: NextRequest) {
  try {
    // Get the redirect URL from the query parameters
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get('redirectTo') || url.searchParams.get('state') || '/dashboard';
    
    // Generate Google OAuth URL
    const googleOAuthUrl = getGoogleOAuthUrl(redirectTo);
    
    // Redirect to Google OAuth
    return NextResponse.redirect(googleOAuthUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}