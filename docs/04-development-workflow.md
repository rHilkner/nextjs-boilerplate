# Development Workflow

This document outlines the development workflow and practices for the Next.js SaaS boilerplate.

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Docker and Docker Compose
- PostgreSQL (can be run via Docker)
- Git

### Initial Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env.local` and configure
4. Start the development database: `docker-compose up -d db`
5. Run database migrations: `npm run db:migrate`
6. Start the development server: `npm run dev`

## Development Environment

### Environment Variables

The project uses environment variables for configuration. These are managed in the following files:

- `.env.example`: Template file with required variables
- `.env.local`: Local development environment (not committed to Git)
- `.env.test`: Test environment configuration
- `.env.production`: Production environment configuration

### Local Development

The development server includes:

- Hot reload for React components
- Automatic TypeScript typechecking
- ESLint for code quality
- Tailwind CSS with JIT mode

To start the development server:

```bash
npm run dev
```

### Database Migrations

Database schema changes are managed with Prisma migrations:

```bash
# Generate a migration from schema changes
npm run db:migrate:dev

# Apply migrations
npm run db:migrate

# Reset database (dev only)
npm run db:reset
```

## Code Quality Tools

### TypeScript

The project uses TypeScript with strict type checking. Run the type checker:

```bash
npm run typecheck
```

### Linting

ESLint is configured for code quality checks:

```bash
# Lint all files
npm run lint

# Lint and fix
npm run lint:fix
```

### Formatting

Prettier is used for consistent code formatting:

```bash
# Format code
npm run format
```

### Testing

Jest and React Testing Library are used for testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Git Workflow

### Branching Strategy

- `main`: Main branch, always deployable
- `feature/*`: Feature branches for new features
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Commit Convention

Commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build process or tool changes

Examples:
```
feat(auth): add Google OAuth integration
fix(stripe): correct webhook signature validation
docs: update README with deployment instructions
```

### Pull Request Process

1. Create a feature branch from `main`
2. Implement changes with regular commits
3. Write or update tests as needed
4. Ensure all tests pass
5. Update documentation if necessary
6. Push branch and create a pull request
7. Address review comments
8. Merge after approval

## Next.js Rendering Strategy

### Preferred Rendering Approach

1. **Prefer Static Generation**: Whenever possible, use static generation to improve performance and reduce server load.
   
   ```tsx
   // Good example - static generation
   export default function StaticPage() {
     return <div>This page is statically generated</div>
   }
   ```

2. **Favor Client-Side Processing**: Process data on the client-side when possible, using client-side data fetching and state management.

   ```tsx
   'use client';
   
   import { useState, useEffect } from 'react';
   
   // Good example - client-side data fetching
   export default function ClientPage() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       fetch('/api/data')
         .then(res => res.json())
         .then(data => setData(data));
     }, []);
     
     return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>
   }
   ```

3. **Dynamic Rendering Exceptions**: Use dynamic rendering (`dynamic = 'force-dynamic'`) only when:
   - The page requires real-time data that can't be revalidated
   - Server-side processing would significantly improve performance
   - Authentication or authorization requirements can't be handled client-side
   - API routes that need request-specific information (cookies, headers, etc.)

   ```tsx
   // API route that needs to be dynamic
   export const dynamic = 'force-dynamic';
   
   export async function GET(request: Request) {
     // Needs access to cookies, headers, etc.
   }
   ```

### Components and Data Fetching

1. **Static Pages with Dynamic Data**: For pages that are mostly static but need some dynamic data, use client components with React Query or SWR for data fetching.

2. **Server Components**: Use server components for:
   - Data fetching that requires secrets (API keys)
   - Complex data processing that would be inefficient on the client
   - SEO-critical content that needs to be in the initial HTML

3. **API Routes**: Make API routes dynamic when they need request data, but keep them simple and focused on data access.

4. **Client-Side Data Fetching**: Use TanStack Query (React Query) for client-side data fetching:

   ```tsx
   'use client';
   
   import { useQuery } from '@tanstack/react-query';
   
   // Good example - data fetching with React Query
   export function useData() {
     return useQuery({
       queryKey: ['data'],
       queryFn: async () => {
         const response = await fetch('/api/data');
         if (!response.ok) {
           throw new Error('Failed to fetch data');
         }
         return response.json();
       },
     });
   }
   ```

## Adding New Features

### Adding a New Module

1. Create a new directory in `src/modules/<module-name>`
2. Add subdirectories for components, hooks, and services
3. Define types in a `types.ts` file
4. Implement core functionality
5. Add API routes in `src/app/api/<module-name>/`
6. Add UI components and pages as needed
7. Update navigation if necessary
8. Add tests for new functionality

### Adding a New API Endpoint

1. Create a route handler in `src/app/api/<module-name>/[endpoint]/route.ts`
2. Implement request validation with Zod
3. Add authentication/authorization checks
4. Implement the business logic
5. Return appropriate HTTP responses
6. Add tests for the new endpoint

## Deployment

### Building for Production

To build the application for production:

```bash
npm run build
```

### Local Production Testing

To test the production build locally:

```bash
npm run build
npm run start
```

### Docker Deployment

To build and run the Docker containers:

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL connection string
   - Ensure database service is running
   - Verify network connectivity

2. **Authentication issues**
   - Check Google OAuth credentials
   - Verify JWT secret configuration
   - Check cookie settings

3. **Prisma errors**
   - Run `npx prisma generate` to update client
   - Verify database migrations are applied
   - Check Prisma schema syntax