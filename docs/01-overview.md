# Next.js SaaS Boilerplate Overview

This boilerplate provides a foundation for building SaaS applications using Next.js as a full-stack framework. It includes all necessary components for authentication, payment processing, role-based access control, file uploads, monitoring, and more.

## Technology Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with middleware
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth
- **Payment Processing**: Stripe (USD)
- **Email**: Resend
- **Monitoring**: Self-hosted dashboard for KPIs and metrics
- **Logging**: Pino (JSON format) with centralized log collection
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **CDN/Storage**: Cloudflare
- **Deployment**: Docker-based deployment to Vultr VPS (Ubuntu LTS)
- **Backups**: Daily database backups using pg_dump

## Core Features

- **Authentication & Authorization**
  - Google OAuth integration
  - JWT authentication with middleware
  - Role-based access control (CUSTOMER, ADMIN)
  - Permission-based authorization

- **Payment Processing**
  - Stripe integration for subscription and one-time payments
  - Payment webhook handling
  - Email notifications for payment events

- **File Management**
  - File uploads up to 50MB
  - Cloudflare storage integration
  - Secure access control for uploaded files

- **API Structure**
  - Standardized request handlers
  - Request validation with Zod
  - Consistent error handling
  - HTTP client using Axios

- **UI Components**
  - Responsive design with Tailwind
  - Toast/snackbar notifications
  - Modal dialogs
  - Cookie consent banner
  - Custom React hooks
  - Form components

- **Monitoring & Observability**
  - Self-hosted metrics dashboard
  - Structured logging with request IDs
  - Error tracking with Sentry
  - User analytics with Google Analytics

- **Infrastructure**
  - Single-command server setup
  - Docker-based deployment
  - Database backup and restore scripts
  - HTTPS configuration

## Project Structure

The boilerplate follows a modular approach, allowing easy addition or removal of features. The code is structured to be maintainable, well-documented, and accessible to both developers and AI assistants.

## Documentation

Comprehensive documentation is provided in the `/docs` directory, covering:
- Architecture overview
- Setup and installation
- Adding new features
- Development workflow
- Testing strategy
- Deployment process
- Maintenance tasks