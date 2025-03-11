/**
 * Authentication configuration
 */
import { env_vars } from '@/lib/env-vars';

// Define the authentication routes
export const authRoutes = {
  // Route for signing in
  signIn: '/auth/login',
  
  // Route for signing out
  signOut: '/auth/logout',
  
  // Route to redirect to after signing in
  signInRedirect: '/dashboard',
  
  // Route to redirect to after signing out
  signOutRedirect: '/',
  
  // OAuth callback routes
  callbacks: {
    google: '/api/auth/callback/google',
  },
};

// Define the authentication providers
export const authProviders = {
  google: {
    name: 'Google',
    icon: 'google',
    clientId: env_vars.GOOGLE_CLIENT_ID,
    clientSecret: env_vars.GOOGLE_CLIENT_SECRET,
    callbackUrl: `${env_vars.APP_URL}/api/auth/callback/google`,
  },
};

// Define the protected routes that require authentication
export const protectedRoutes = {
  // Routes that start with these paths are protected
  startsWith: ['/dashboard', '/settings', '/profile', '/app'],
  
  // Routes that exactly match these paths are protected
  exact: [],
  
  // Routes that are accessible to the public (no authentication required)
  // These override the protected routes if there's a conflict
  publicOverrides: ['/api/health'],
};

// JWT configuration
export const jwtConfig = {
  secret: env_vars.JWT_SECRET,
  expiresIn: env_vars.JWT_EXPIRY,
};

// Authentication timeouts in milliseconds
export const authTimeouts = {
  // The session expiration time (30 days)
  session: 30 * 24 * 60 * 60 * 1000,
  
  // The token expiration time (1 hour)
  token: 60 * 60 * 1000,
};

// Export default authentication configuration
const authConfig = {
  authRoutes,
  authProviders,
  protectedRoutes,
  jwtConfig,
  authTimeouts,
};

export default authConfig;