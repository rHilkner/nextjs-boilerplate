import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requestHandler } from '@/lib/api/request-handler';
import { logger } from '@/lib/logging';

// Schema for updating profile information
const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  preferences: z
    .object({
      emailNotifications: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

// GET - Protected endpoint to fetch the user's profile
export const GET = requestHandler(
  { isPublicEndpoint: false },
  async ({ authCtx }) => {
    logger.info({ userId: authCtx.userId }, 'User fetching their profile');
    
    // In a real app, this would fetch the user from the database
    const user = {
      id: authCtx.userId,
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software developer passionate about React and TypeScript',
      avatar: 'https://example.com/avatar.jpg',
      role: authCtx.role,
      createdAt: '2023-01-01T00:00:00.000Z',
      preferences: {
        emailNotifications: true,
        theme: 'system',
        timezone: 'UTC',
      },
    };
    
    return NextResponse.json(user);
  }
);

// PATCH - Protected endpoint to update the user's profile
export const PATCH = requestHandler(
  { schema: profileUpdateSchema },
  async ({ authCtx }, data) => {
    logger.info(
      { userId: authCtx.userId, updateData: data },
      'User updating their profile'
    );
    
    // In a real app, this would update the user in the database
    const updatedUser = {
      id: authCtx.userId,
      name: data.name || 'John Doe',
      email: 'john@example.com',
      bio: data.bio || 'Software developer passionate about React and TypeScript',
      avatar: data.avatar || 'https://example.com/avatar.jpg',
      role: authCtx.role,
      preferences: {
        emailNotifications: data.preferences?.emailNotifications ?? true,
        theme: data.preferences?.theme || 'system',
        timezone: data.preferences?.timezone || 'UTC',
      },
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(updatedUser);
  }
);