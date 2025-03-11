import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';

// Mark this route as dynamic to fix build error
export const dynamic = 'force-dynamic';

/**
 * Logout API endpoint
 * Removes the auth cookie and returns a success response
 */
export async function POST() {
  // Remove the auth cookie
  removeAuthCookie();
  
  // Return success
  return NextResponse.json({ success: true });
}