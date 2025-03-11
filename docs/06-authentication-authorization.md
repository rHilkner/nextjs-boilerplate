# Authentication and Authorization

This document outlines the authentication and authorization system used in the Next.js SaaS boilerplate.

## Authentication Overview

The application uses Google OAuth for authentication, combined with JWT tokens for session management. The authentication flow is handled by Next.js API routes and middleware.

### Technologies Used

- **Google OAuth**: For user sign-in
- **JWT Tokens**: For session management
- **HTTP-only Cookies**: For secure token storage
- **Next.js Middleware**: For route protection
- **Prisma**: For user data storage
- **Zod**: For validation

## Authentication Flow

### User Sign-in

1. **Initiate Sign-in**:
   - User clicks "Sign in with Google" button
   - Application redirects to Google OAuth authorization URL

2. **OAuth Callback**:
   - Google redirects back to the application callback URL
   - Application receives authorization code
   - Code is exchanged for access and ID tokens

3. **User Creation/Update**:
   - Application verifies ID token with Google
   - User information is extracted from ID token
   - User is created or updated in the database
   - User role is assigned (default: CUSTOMER)

4. **Session Creation**:
   - JWT token is generated with user ID, role, and permissions
   - Token is stored in HTTP-only, secure cookie
   - User is redirected to the appropriate page

### Session Management

1. **Token Validation**:
   - Next.js middleware intercepts requests to protected routes
   - JWT token is extracted from cookies
   - Token is validated for authenticity and expiration
   - User data is attached to the request context

2. **Token Refresh**:
   - Tokens have a configurable expiration (default: 7 days)
   - Silent refresh is performed when token approaches expiration
   - If refresh fails, user is redirected to login

3. **Logout**:
   - JWT token cookie is cleared
   - User is redirected to the login page

## Authorization

### Role-Based Access Control

The application implements a role-based access control (RBAC) system with the following roles:

- **CUSTOMER**: Regular user with limited access
- **ADMIN**: Administrator with full access

### Permission System

In addition to roles, the application uses a fine-grained permission system:

1. **Permission Types**:
   - Resource-based permissions (e.g., `users:read`, `users:write`)
   - Action-based permissions (e.g., `manage:billing`, `view:reports`)

2. **Permission Assignment**:
   - Permissions are assigned to roles by default
   - Specific permissions can be assigned to individual users
   - Permissions are stored in the database

3. **Permission Checking**:
   - Middleware checks permissions for protected routes
   - API routes check permissions for specific operations
   - UI components hide or disable elements based on permissions

## Implementation Details

### Middleware Implementation

The middleware (`src/middleware.ts`) handles authentication and basic authorization:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/api/auth'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the JWT token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the token
    const payload = await verifyJwtToken(token);
    
    // Check if the route requires specific roles
    const requiresAdmin = request.nextUrl.pathname.startsWith('/admin');
    
    if (requiresAdmin && payload.role !== 'ADMIN') {
      // Unauthorized access attempt
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Attach user information to request headers for API routes
    const requestHeaders = new Headers(request.headers);
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
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes use the middleware
export const config = {
  matcher: [
    // Apply to all routes except _next and public assets
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

### Request Handler

API routes use a request handler that performs additional authorization checks:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging';

export async function withAuth<T>(
  req: NextRequest,
  schema: z.Schema<T>,
  handler: (data: T, userId: string, role: string) => Promise<NextResponse>,
  options: {
    requiredRole?: 'CUSTOMER' | 'ADMIN';
    requiredPermissions?: string[];
  } = {}
) {
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
          { userId, userPermissions: user.permissions, requiredPermissions: options.requiredPermissions },
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
```

### Database Schema

The user and permission model in Prisma schema:

```prisma
enum UserRole {
  CUSTOMER
  ADMIN
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  role          UserRole    @default(CUSTOMER)
  googleId      String?     @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  permissions   Permission[]
  subscriptions Subscription[]
}

model Permission {
  id        String    @id @default(cuid())
  name      String    @unique
  users     User[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## Client-Side Usage

### React Hooks

The application provides React hooks for using authentication in components:

```typescript
// useAuth.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await axios.get('/api/auth/user');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: data,
    isLoading,
    isError: !!error,
    isAuthenticated: !!data && !error,
  };
}

// usePermissions.ts
export function usePermission(permission: string) {
  const { user, isLoading, isError } = useAuth();
  
  if (isLoading || isError || !user) {
    return false;
  }
  
  // Admin has all permissions
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Check user permissions
  return user.permissions.some(p => p.name === permission);
}
```

### Protected Components

Components can be protected based on authentication status or permissions:

```typescript
// WithAuth.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export function WithAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}

// WithPermission.tsx
import { usePermission } from '@/hooks/usePermission';
import { ReactNode } from 'react';

export function WithPermission({ 
  permission, 
  children,
  fallback = null,
}: { 
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return fallback;
  }
  
  return <>{children}</>;
}
```

## Security Considerations

1. **JWT Security**
   - Use strong, randomly generated secrets
   - Short expiration times
   - HTTP-only, secure cookies
   - Include only necessary claims

2. **CSRF Protection**
   - Implement CSRF tokens for state-changing operations
   - SameSite cookie attribute set to 'Lax' or 'Strict'

3. **Rate Limiting**
   - Apply rate limiting to login and token endpoints
   - Protect against brute force attacks

4. **Secure Headers**
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options

5. **Error Handling**
   - Generic error messages for authentication failures
   - Detailed internal logging
   - No exposure of sensitive information