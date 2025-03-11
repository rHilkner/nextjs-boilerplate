import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

// These values would typically come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-at-least-32-chars';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Extend the jose JWTPayload interface with our custom fields
interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  permissions?: string[];
}

/**
 * Signs a JWT token with user data
 */
export async function signJwtToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
  
  return token;
}

/**
 * Verifies a JWT token and returns the payload
 */
export async function verifyJwtToken(token: string): Promise<JwtPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Validate that the payload has the required fields
    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }
    
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Sets the JWT token as an HTTP-only cookie
 */
export function setAuthCookie(token: string) {
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Removes the auth cookie
 */
export function removeAuthCookie() {
  cookies().delete('auth_token');
}

/**
 * Gets the JWT token from the cookies
 */
export function getAuthToken() {
  return cookies().get('auth_token')?.value;
}

/**
 * Gets the authenticated user data from the JWT token
 */
export async function getAuthUser() {
  const token = getAuthToken();
  
  if (!token) {
    return null;
  }
  
  try {
    return await verifyJwtToken(token);
  } catch (error) {
    return null;
  }
}