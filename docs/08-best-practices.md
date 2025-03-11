# Best Practices

This document outlines the best practices and standards to follow when working with this Next.js boilerplate.

## API Development

### Request Handler

**IMPORTANT**: All API routes should be wrapped in the `requestHandler` function from `src/lib/api/request-handler.ts`.

```typescript
import { requestHandler } from '@/lib/api/request-handler';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const POST = requestHandler(
  {
    schema: userSchema,
    isPublicEndpoint: false, // Requires authentication
    requiredRole: 'admin', // Optional role-based access control
  },
  async ({ authCtx }, data) => {
    // Your business logic here
    return NextResponse.json({ success: true });
  }
);
```

The `requestHandler` provides:
- Consistent error handling
- Authentication and authorization
- Request validation with Zod schemas
- Logging via the application logger
- Type safety

## Environment Variables

**IMPORTANT**: Always use environment variables from the `env_vars` object defined in `src/lib/env-vars.ts`:

```typescript
import { env_vars } from '@/lib/env-vars';

// For backend code:
console.log(env_vars.JWT_SECRET);

// For frontend-safe variables:
import { public_env_vars } from '@/lib/env-vars';
console.log(public_env_vars.NEXT_PUBLIC_APP_URL);
```

Benefits:
- Type safety with Zod validation
- Default values for development
- Clear distinction between public and private variables
- Runtime validation to catch missing variables early

## Error Handling

- Use structured error handling with appropriate status codes
- Log errors with contextual information
- Return user-friendly error messages
- Use custom error classes for domain-specific errors

```typescript
try {
  // Business logic
} catch (error) {
  logger.error({ error }, 'Failed to process operation');
  return NextResponse.json({ message: 'Operation failed' }, { status: 500 });
}
```

## Authentication

- Use the built-in JWT authentication system for user sessions
- Leverage the middleware for protecting routes
- For OAuth authentication, use the provided Google integration as a reference
- Check `authCtx` in route handlers to access user info

## Performance Optimization

- Use Next.js built-in optimizations (Image component, route prefetching)
- Implement proper caching strategies
- Minimize client-side JavaScript
- Use code splitting and lazy loading
- Optimize API responses for size

## Security Best Practices

- Validate all inputs with Zod schemas
- Use CSRF protection for forms
- Implement proper Content Security Policy
- Keep dependencies updated
- Follow the OWASP Top 10 guidelines
- Use environment variables for secrets

## Testing

- Write unit tests for utility functions and components
- Implement integration tests for API routes
- Use mock data for external dependencies
- Follow the testing pyramid approach

## Coding Guidelines

- Follow the style guide defined in CLAUDE.md
- Document complex logic with comments
- Use TypeScript for all new code
- Create reusable components and hooks
- Follow the DRY (Don't Repeat Yourself) principle