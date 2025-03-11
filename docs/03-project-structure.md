# Project Structure

This document outlines the directory structure and organization of the Next.js SaaS boilerplate.

## Root Directory Structure

```
/
├── .github/                  # GitHub workflows and templates
├── docs/                     # Project documentation
├── infra/                    # Infrastructure and deployment scripts
│   ├── docker/               # Docker configuration
│   ├── scripts/              # Deployment and maintenance scripts
│   └── templates/            # Configuration templates
├── public/                   # Static assets
└── src/                      # Application source code
    ├── app/                  # Next.js app router pages and layouts
    ├── components/           # React components
    ├── config/               # Application configuration
    ├── hooks/                # React hooks
    ├── lib/                  # Utility libraries and modules
    ├── middleware.ts         # Next.js middleware for auth
    ├── modules/              # Feature modules
    ├── services/             # External service integrations
    ├── styles/               # Global styles
    ├── types/                # TypeScript type definitions
    └── utils/                # Utility functions
```

## Source Code Organization

### App Directory (`src/app`)

```
src/app/
├── (auth)/                   # Authentication related pages
│   ├── login/                # Login page
│   └── callback/             # OAuth callback route
├── (dashboard)/              # Dashboard pages (protected)
│   ├── layout.tsx            # Dashboard layout with navigation
│   ├── page.tsx              # Main dashboard page
│   ├── settings/             # User settings pages
│   └── profile/              # User profile pages
├── (marketing)/              # Public marketing pages
│   ├── layout.tsx            # Marketing layout
│   ├── page.tsx              # Homepage
│   └── pricing/              # Pricing page
├── api/                      # API routes
│   ├── auth/                 # Authentication routes
│   ├── webhooks/             # Webhook handlers
│   ├── uploads/              # File upload handlers
│   └── [module]/             # Module-specific API routes
├── globals.css               # Global styles (Tailwind)
├── layout.tsx                # Root layout
└── not-found.tsx             # 404 page
```

### Component Organization (`src/components`)

```
src/components/
├── auth/                     # Authentication components
│   ├── LoginButton.tsx       # Google OAuth login button
│   └── LogoutButton.tsx      # Logout button
├── common/                   # Shared UI components
│   ├── Button.tsx            # Button component
│   ├── Card.tsx              # Card component
│   ├── Dialog.tsx            # Modal dialog
│   ├── Input.tsx             # Form input
│   └── Toast.tsx             # Toast notifications
├── dashboard/                # Dashboard-specific components
│   ├── Sidebar.tsx           # Dashboard sidebar
│   └── Header.tsx            # Dashboard header
├── forms/                    # Form-related components
│   ├── Form.tsx              # Form wrapper
│   └── FormField.tsx         # Form field with validation
├── layout/                   # Layout components
│   ├── Footer.tsx            # Site footer
│   └── Header.tsx            # Site header
├── marketing/                # Marketing page components
│   ├── Hero.tsx              # Hero section
│   └── PricingTable.tsx      # Pricing table
└── ui/                       # UI library components
    ├── Avatar.tsx            # User avatar
    └── Badge.tsx             # Status badge
```

### Modules Organization (`src/modules`)

```
src/modules/
├── users/                    # User module
│   ├── components/           # User-specific components
│   ├── hooks/                # User-related hooks
│   ├── services/             # User-related services
│   ├── types.ts              # User type definitions
│   └── utils.ts              # User utilities
├── billing/                  # Billing module
│   ├── components/           # Billing-specific components
│   ├── hooks/                # Billing-related hooks
│   ├── services/             # Billing-related services
│   ├── types.ts              # Billing type definitions
│   └── utils.ts              # Billing utilities
└── files/                    # Files module
    ├── components/           # File-specific components
    ├── hooks/                # File-related hooks
    ├── services/             # File-related services
    ├── types.ts              # File type definitions
    └── utils.ts              # File utilities
```

### Services Organization (`src/services`)

```
src/services/
├── api/                      # API client services
│   ├── client.ts             # Base API client with Axios
│   └── endpoints.ts          # API endpoint definitions
├── auth/                     # Authentication services
│   ├── google.ts             # Google OAuth implementation
│   ├── jwt.ts                # JWT token handling
│   └── permissions.ts        # Permission checking utilities
├── database/                 # Database services
│   ├── prisma.ts             # Prisma client instance
│   └── repositories/         # Data repositories
├── email/                    # Email services
│   ├── client.ts             # Email client
│   └── templates/            # Email templates
├── logging/                  # Logging services
│   ├── pino.ts               # Pino logger configuration
│   └── sentry.ts             # Sentry error tracking
├── storage/                  # Storage services
│   ├── cloudflare.ts         # Cloudflare storage client
│   └── local.ts              # Local filesystem storage
└── stripe/                   # Stripe payment services
    ├── client.ts             # Stripe client instance
    ├── products.ts           # Product and price handling
    ├── subscriptions.ts      # Subscription management
    └── webhooks.ts           # Webhook processing
```

### Utilities and Libraries (`src/lib` and `src/utils`)

```
src/lib/                      # Reusable libraries
├── auth/                     # Authentication libraries
├── forms/                    # Form handling libraries
├── http/                     # HTTP request libraries
├── logging/                  # Logging libraries
├── validation/               # Validation libraries
└── zod/                      # Zod schema utilities

src/utils/                    # Utility functions
├── dates.ts                  # Date manipulation utilities
├── formatting.ts             # Text formatting utilities
├── permissions.ts            # Permission checking utilities
├── storage.ts                # Storage utilities
└── validation.ts             # General validation utilities
```

### Configuration (`src/config`)

```
src/config/
├── auth.ts                   # Authentication configuration
├── database.ts               # Database configuration
├── email.ts                  # Email configuration
├── environment.ts            # Environment variables
├── logging.ts                # Logging configuration
├── sentry.ts                 # Sentry configuration
├── storage.ts                # Storage configuration
└── stripe.ts                 # Stripe configuration
```

### Infrastructure Directory (`infra`)

```
infra/
├── docker/                   # Docker configurations
│   ├── app/                  # App container
│   │   └── Dockerfile        # App Dockerfile
│   ├── db/                   # Database container
│   │   └── Dockerfile        # DB Dockerfile
│   └── docker-compose.yml    # Docker Compose file
├── scripts/                  # Infrastructure scripts
│   ├── setup.sh              # Server setup script
│   ├── deploy.sh             # Deployment script
│   ├── backup.sh             # Database backup script
│   └── restore.sh            # Database restore script
└── templates/                # Configuration templates
    ├── nginx/                # Nginx configuration
    └── cron/                 # Cron job configurations
```

## Module Architecture

Each module follows a consistent pattern:

1. **Components**: UI components specific to the module
2. **Hooks**: React hooks for state management and behavior
3. **Services**: Service functions for data fetching and processing
4. **Types**: TypeScript type definitions
5. **Utils**: Utility functions specific to the module

This structure ensures that each module is self-contained and can be easily added, modified, or removed without affecting the rest of the application.