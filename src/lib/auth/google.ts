import { OAuth2Client } from 'google-auth-library';
import { logger } from '../logging';
import { env_vars } from '../env-vars';

const REDIRECT_URI = `${env_vars.APP_URL}/api/auth/callback/google`;

if (!env_vars.GOOGLE_CLIENT_ID || !env_vars.GOOGLE_CLIENT_SECRET) {
  logger.warn('Google OAuth client ID or secret is not set');
}

// Create OAuth2 client
export const googleAuthClient = new OAuth2Client(
  env_vars.GOOGLE_CLIENT_ID,
  env_vars.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * Generate a URL for Google OAuth authentication
 * @param redirectTo Optional URL to redirect to after authentication
 * @returns The Google OAuth URL
 */
export function getGoogleOAuthUrl(redirectTo?: string): string {
  const state = redirectTo ? encodeURIComponent(redirectTo) : '';
  
  return googleAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
    state,
  });
}