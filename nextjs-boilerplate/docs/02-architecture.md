# Architecture Overview

This document outlines the architectural design of the Next.js SaaS boilerplate.

## System Architecture

```
┌───────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                   │     │                 │     │                 │
│  Client Browser   │────►│  Cloudflare CDN │────►│  Next.js App    │
│                   │     │                 │     │                 │
└───────────────────┘     └─────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌───────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                   │     │                 │     │                 │
│  Monitoring       │◄────│  PostgreSQL     │◄────│  Prisma ORM     │
│  Dashboard        │     │  Database       │     │                 │
│                   │     │                 │     │                 │
└───────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                                                  │
        │                                                  │
        │           ┌─────────────────┐                    │
        │           │                 │                    │
        └───────────│  Log Collection │◄───────────────────┘
                    │                 │
                    └─────────────────┘
```

## Application Layers

### Frontend Layer
- **Pages & Layouts**: Next.js App Router with React components
- **State Management**: React Query for server state, Context API for UI state
- **Styling**: Tailwind CSS
- **Client-side Error Handling**: Sentry integration

### API Layer
- **Middleware**: JWT authentication and request validation
- **API Routes**: RESTful endpoints for data access
- **Request Handlers**: Standardized handling with validation
- **External API Clients**: Axios-based service clients

### Data Layer
- **ORM**: Prisma for database interaction
- **Schema**: TypeScript types and Zod validators
- **Migrations**: Prisma migrations
- **Data Access**: Repository pattern for domain entities

### Infrastructure Layer
- **Containerization**: Docker and Docker Compose
- **VPS**: Vultr VPS running Ubuntu LTS
- **CDN**: Cloudflare for asset delivery
- **Storage**: Cloudflare for file storage
- **CI/CD**: GitHub Actions (optional)

## Authentication Flow

1. User initiates Google OAuth sign-in
2. Next.js app processes OAuth callback
3. JWT token is created and stored in HTTP-only cookie
4. Middleware validates JWT on protected routes
5. User role and permissions determine access rights

## Payment Flow

1. User selects subscription plan
2. Client creates Stripe Checkout session via API
3. User completes payment on Stripe hosted page
4. Stripe webhook notifies app of successful payment
5. Subscription status updated in database
6. Email confirmation sent to user

## File Upload Flow

1. User selects file for upload
2. Client validates file size and type
3. File is uploaded to Next.js API endpoint
4. API validates file and uploads to Cloudflare storage
5. File metadata stored in database
6. URL returned to client for access

## Monitoring and Observability

1. JSON logs generated using Pino logger
2. Logs include request ID, user ID, and other context
3. Logs stored in centralized location
4. Metrics dashboard processes logs for visualization
5. Sentry captures and aggregates client-side errors
6. Google Analytics tracks user behavior

## Backup Process

1. Daily pg_dump at 04:00 UTC
2. Backup stored in Cloudflare storage
3. Backup retention policy applied
4. Restore functionality available via management script

## Security Measures

- HTTPS everywhere
- HTTP-only cookies for JWT
- CSRF protection
- Rate limiting
- Input validation with Zod
- Role-based access control
- Secure file handling
- Secure dependency management
- Regular security updates