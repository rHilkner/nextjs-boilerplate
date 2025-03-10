# CLAUDE.md - Next.js Boilerplate Guidelines

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Test: `npm run test`
- Test single file: `npm run test -- path/to/test`
- Format code: `npm run format`

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