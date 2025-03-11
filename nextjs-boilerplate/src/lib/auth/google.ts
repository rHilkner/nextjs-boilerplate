import { OAuth2Client } from 'google-auth-library';
import { logger } from '../logging';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback/google`;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  logger.warn('Google OAuth client ID or secret is not set');
}

// Create OAuth2 client
export const googleAuthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
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