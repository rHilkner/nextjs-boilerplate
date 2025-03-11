import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requestHandler } from '@/lib/api/request-handler';

// Schema for user creation or update
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).optional(),
});

// GET - Public endpoint to fetch users (demo)
export const GET = requestHandler(
  { isPublicEndpoint: true },
  async ({ query }) => {
    // Mock user data for demonstration
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    ];
    
    // Pagination and filtering would happen here in a real app
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const page = query.page ? parseInt(query.page, 10) : 1;
    
    return NextResponse.json({
      users: users.slice(0, limit),
      pagination: {
        total: users.length,
        page,
        limit,
      },
    });
  }
);

// POST - Protected endpoint to create a user
export const POST = requestHandler(
  { schema: userSchema, requiredRole: 'admin' },
  async ({ authCtx }, data) => {
    // In a real app, this would create the user in the database
    const newUser = {
      id: crypto.randomUUID(),
      ...data,
      createdBy: authCtx.userId,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newUser, { status: 201 });
  }
);

// PUT - Protected endpoint to update a user
export const PUT = requestHandler(
  { schema: userSchema.extend({ id: z.string().uuid() }), requiredRole: 'admin' },
  async ({ authCtx }, data) => {
    const { id, ...updateData } = data;
    
    // In a real app, this would update the user in the database
    const updatedUser = {
      id,
      ...updateData,
      updatedBy: authCtx.userId,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(updatedUser);
  }
);