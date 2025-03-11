import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Generate a request ID for logging and tracking
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  
  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/api/auth',
    '/api/webhooks',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/assets'
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );
  
  if (isPublicPath) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Get the JWT token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If there's no token, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify the token
    const payload = await verifyJwtToken(token);
    
    // Check route permissions
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    
    if (isAdminRoute && payload.role !== 'ADMIN') {
      // Unauthorized access attempt to admin route
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Attach user information to request headers
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    
    // Continue to the route
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid or expired token
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};