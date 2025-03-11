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