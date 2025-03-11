# Next.js SaaS Boilerplate

A robust, full-stack SaaS boilerplate built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Authentication**: Google OAuth with JWT token management
- **Authorization**: Role-based access control and permission system
- **Database**: PostgreSQL with Prisma ORM
- **Payment Processing**: Stripe integration for subscriptions
- **File Storage**: Cloudflare R2 for file storage up to 50MB
- **Monitoring**: Self-hosted metrics dashboard with Grafana and Prometheus
- **Logging**: Structured JSON logging with Pino
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics
- **UI Components**: Modern UI with Tailwind CSS
- **Type Safety**: Strong typing with TypeScript and Zod validation
- **Infrastructure**: Docker-based deployment to Vultr VPS

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Docker and Docker Compose (for local database)
- PostgreSQL (can run via Docker)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/nextjs-saas-boilerplate.git
cd nextjs-saas-boilerplate
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` to add your specific configuration values.

4. Start the development database:

```bash
docker-compose up -d db
```

5. Run database migrations:

```bash
npm run db:migrate
```

6. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Overview](./docs/01-overview.md)
- [Architecture](./docs/02-architecture.md)
- [Project Structure](./docs/03-project-structure.md)
- [Development Workflow](./docs/04-development-workflow.md)
- [Infrastructure Setup](./docs/05-infrastructure-setup.md)
- [Authentication & Authorization](./docs/06-authentication-authorization.md)
- [Integrations](./docs/07-integrations.md)

## Key Commands

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server

# Database
npm run db:migrate    # Run database migrations
npm run db:reset      # Reset database (dev only)
npm run db:seed       # Seed database with sample data

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting and Formatting
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier

# Type Checking
npm run typecheck     # Run TypeScript type checking
```

## Deployment

For production deployment, follow the instructions in the [Infrastructure Setup](./docs/05-infrastructure-setup.md) document. The boilerplate includes scripts for deploying to a Vultr VPS using Docker.

## Infrastructure

The application is designed to be deployed to a Vultr VPS running Ubuntu LTS. The setup includes:

- Docker containers for the application and database
- Nginx as a reverse proxy
- Automated daily backups
- Monitoring and logging infrastructure

To set up a new server:

```bash
# Run from the project root
./infra/scripts/setup.sh
```

## Customization

This boilerplate is designed to be highly customizable:

1. Add or remove modules in `src/modules/`
2. Customize UI components in `src/components/`
3. Configure API endpoints in `src/app/api/`
4. Adjust database schema in `prisma/schema.prisma`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
