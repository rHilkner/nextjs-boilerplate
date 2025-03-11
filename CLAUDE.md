# CLAUDE.md - Next.js Boilerplate Guidelines

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Test: `npm run test`
- Test single file: `npm run test -- path/to/test`
- Format code: `npm run format`
- Database migrations: `npx prisma migrate dev`
- Database UI: `npx prisma studio`

## Project Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/lib` - Shared utilities, API helpers, database access
- `/src/components` - Reusable React components
- `/docs` - Project documentation
- `/prisma` - Database schema and migrations
- `/infra` - Infrastructure configurations

## Important Files
- `/src/lib/env-vars.ts` - Environment variables configuration
- `/src/lib/api/request-handler.ts` - API route wrapper
- `/src/lib/logging/index.ts` - Logger configuration
- `/src/middleware.ts` - Next.js middleware for authentication

## Code Style Guidelines
- **Format**: Use Prettier with 2-space indentation
- **Types**: Use TypeScript with strict type checking
- **Imports**: Group and sort imports (React, external, internal)
- **Components**: Use functional components with explicit return types
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch with custom error classes
- **State Management**: Prefer React Query for server state, Context/Redux for UI
- **File Structure**: Feature-based organization with domain-driven design
- **Testing**: Jest for unit tests, React Testing Library for components
- **CSS**: Use Tailwind or CSS Modules for styling

## Critical Best Practices
1. **Environment Variables**: Always use `env_vars` or `public_env_vars` from `/src/lib/env-vars.ts`
2. **API Routes**: Always wrap API routes in `requestHandler` from `/src/lib/api/request-handler.ts`
3. **Authentication**: Use the middleware and auth context for protected routes
4. **Error Handling**: Use structured error handling with appropriate status codes
5. **Validation**: Use Zod schemas for all data validation
6. **Logging**: Use the application logger for all logging needs

## Documentation References
- Overview: `/docs/01-overview.md`
- Architecture: `/docs/02-architecture.md`
- Project Structure: `/docs/03-project-structure.md`
- Development Workflow: `/docs/04-development-workflow.md`
- Infrastructure: `/docs/05-infrastructure-setup.md`
- Authentication: `/docs/06-authentication-authorization.md`
- Integrations: `/docs/07-integrations.md`
- Best Practices: `/docs/08-best-practices.md`