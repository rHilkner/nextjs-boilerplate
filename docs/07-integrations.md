# Third-Party Integrations

This document outlines the third-party integrations used in the Next.js SaaS boilerplate and how they are implemented.

## Payment Processing (Stripe)

The application integrates with Stripe for payment processing, supporting both one-time payments and subscriptions.

### Stripe Setup

1. **Client Configuration**:
   - Stripe client initialized with API key from environment variables
   - Webhook secret used for signature verification

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';
import { env } from '@/config/environment';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Next.js SaaS Boilerplate',
    version: '1.0.0',
  },
});
```

### Subscription Management

1. **Creating a Subscription**:
   - Customer objects in Stripe linked to users in the database
   - Subscription products and prices defined in Stripe dashboard
   - Checkout sessions created for subscription purchases

```typescript
// src/app/api/subscriptions/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { logger } from '@/lib/logging';

const createSubscriptionSchema = z.object({
  priceId: z.string(),
});

export async function POST(req: NextRequest) {
  return withAuth(
    req,
    createSubscriptionSchema,
    async (data, userId) => {
      const log = logger.child({ userId, priceId: data.priceId });
      
      try {
        // Get the user from database
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (!user) {
          log.error('User not found');
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
        
        // Get or create Stripe customer
        let stripeCustomerId = user.stripeCustomerId;
        
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
              userId,
            },
          });
          
          stripeCustomerId = customer.id;
          
          // Update user with Stripe customer ID
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId },
          });
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          line_items: [
            {
              price: data.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${env.APP_URL}/dashboard/billing?success=true`,
          cancel_url: `${env.APP_URL}/dashboard/billing?canceled=true`,
          metadata: {
            userId,
          },
        });
        
        return NextResponse.json({ url: session.url });
      } catch (error) {
        log.error({ error }, 'Failed to create subscription');
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }
    }
  );
}
```

### Webhook Handling

1. **Webhook Setup**:
   - Stripe webhooks used to handle asynchronous events
   - Signature verification for security
   - Event handling for subscription lifecycle events

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { env } from '@/config/environment';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  const log = logger.child({ service: 'stripe-webhook' });
  
  if (!signature) {
    log.error('Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    
    log.info({ eventType: event.type }, 'Received Stripe webhook');
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        if (userId && session.subscription) {
          await prisma.subscription.create({
            data: {
              userId,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              priceId: session.metadata?.priceId,
              currentPeriodEnd: new Date(
                (session.subscription_end as number) * 1000
              ),
            },
          });
          
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
          
          if (user) {
            await sendEmail({
              to: user.email,
              subject: 'Subscription Confirmation',
              template: 'subscription-created',
              data: {
                name: user.name,
              },
            });
          }
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
          include: { user: true },
        });
        
        if (subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              currentPeriodEnd: new Date(
                stripeSubscription.current_period_end * 1000
              ),
            },
          });
          
          if (subscription.user) {
            await sendEmail({
              to: subscription.user.email,
              subject: 'Payment Successful',
              template: 'payment-succeeded',
              data: {
                name: subscription.user.name,
                amount: (invoice.amount_paid / 100).toFixed(2),
                currency: invoice.currency.toUpperCase(),
              },
            });
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        const subscriptionId = stripeSubscription.id;
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: 'canceled',
          },
        });
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    log.error({ error }, 'Webhook error');
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
```

## File Storage (Cloudflare)

The application uses Cloudflare for file storage and content delivery.

### Cloudflare Setup

1. **Client Configuration**:
   - Cloudflare R2 client for object storage
   - Configured with account ID and API token

```typescript
// src/lib/storage.ts
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/config/environment';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});
```

### File Upload Implementation

1. **Direct Upload**:
   - Form-based upload to Next.js API route
   - File size and type validation
   - Upload to Cloudflare R2
   - Metadata stored in database

```typescript
// src/app/api/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { r2 } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/environment';
import { logger } from '@/lib/logging';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId });
  
  // Get user ID from headers (set by middleware)
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    log.error('Unauthorized upload attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      log.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      log.error({ fileSize: file.size }, 'File too large');
      return NextResponse.json(
        { error: 'File too large (max 50MB)' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      log.error({ fileType: file.type }, 'Invalid file type');
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // Generate file key
    const fileName = file.name;
    const fileId = uuidv4();
    const fileKey = `uploads/${userId}/${fileId}-${fileName}`;
    
    // Upload file to Cloudflare R2
    await r2.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET_NAME,
        Key: fileKey,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        ContentDisposition: `inline; filename="${fileName}"`,
      })
    );
    
    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        name: fileName,
        key: fileKey,
        size: file.size,
        type: file.type,
        userId,
      },
    });
    
    // Generate signed URL for access
    const url = `${env.CLOUDFLARE_PUBLIC_URL}/${fileKey}`;
    
    log.info({ fileId: fileRecord.id }, 'File uploaded successfully');
    
    return NextResponse.json({
      id: fileRecord.id,
      name: fileRecord.name,
      url,
      type: fileRecord.type,
      size: fileRecord.size,
    });
  } catch (error) {
    log.error({ error }, 'File upload error');
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}
```

## Email Service

The application integrates with email service providers to send notifications and transactional emails.

### Email Client Setup

1. **Provider Configuration**:
   - Configurable email provider (options include SendGrid, Mailjet, etc.)
   - Template-based emails
   - Tracking and analytics

```typescript
// src/lib/email.ts
import { env } from '@/config/environment';
import { logger } from '@/lib/logging';

// Interface for email sending
export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Email sending function (implementation depends on chosen provider)
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  const log = logger.child({ 
    to: emailData.to,
    template: emailData.template,
    subject: emailData.subject,
  });
  
  try {
    // Implementation will differ based on the selected email provider
    // This is a placeholder for the implementation
    log.info('Sending email');
    
    // Return success
    return true;
  } catch (error) {
    log.error({ error }, 'Failed to send email');
    return false;
  }
}
```

### Email Templates

1. **Template System**:
   - HTML templates with variable substitution
   - Responsive design for all devices
   - Branding and styling consistent with the application

```typescript
// src/services/email/templates.ts
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { env } from '@/config/environment';

// Cache compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

export function renderTemplate(templateName: string, data: Record<string, any>): string {
  // Check if template is already compiled and cached
  if (!templateCache.has(templateName)) {
    const templatePath = path.join(process.cwd(), 'src/services/email/templates', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    templateCache.set(templateName, Handlebars.compile(templateSource));
  }
  
  // Get compiled template
  const template = templateCache.get(templateName)!;
  
  // Render with data and common variables
  return template({
    ...data,
    appName: env.APP_NAME,
    appUrl: env.APP_URL,
    year: new Date().getFullYear(),
  });
}
```

## Analytics and Error Tracking

The application uses Google Analytics for user behavior tracking and Sentry for error monitoring.

### Google Analytics Setup

1. **Client Configuration**:
   - Google Analytics script added to app layout
   - Event tracking for key user actions

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { env } from '@/config/environment';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics measurementId={env.GA_MEASUREMENT_ID} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Sentry Integration

1. **Client Configuration**:
   - Sentry initialized in the application
   - Error boundaries for React components
   - Custom error handling

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';
import { env } from '@/config/environment';

export function initSentry() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }
}
```

## Authentication with Google OAuth

The application uses Google OAuth for user authentication.

### Google OAuth Setup

1. **Provider Configuration**:
   - Google OAuth client ID and secret from environment variables
   - Callback URL configuration
   - Scope definition for required user information

```typescript
// src/lib/auth/google.ts
import { OAuth2Client } from 'google-auth-library';
import { env } from '@/config/environment';

// Create OAuth client
export const googleOAuthClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.APP_URL}/api/auth/callback/google`
);

// Generate OAuth URL
export function getGoogleOAuthUrl(): string {
  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
  });
}

// Verify ID token
export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  
  return ticket.getPayload();
}
```

## Monitoring Dashboard

The application includes a self-hosted monitoring dashboard for tracking application metrics and performance.

### Dashboard Setup

1. **Implementation**:
   - Dashboard container in Docker Compose
   - Integration with application logs
   - Custom metrics collection

```yaml
# docker-compose.yml (monitoring section)
services:
  # ... other services ...
  
  monitoring:
    image: grafana/grafana:latest
    depends_on:
      - prometheus
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./infra/monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./infra/monitoring/prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./infra/monitoring/loki/config.yaml:/etc/loki/config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/config.yaml
    restart: unless-stopped
    
  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./infra/monitoring/promtail/config.yaml:/etc/promtail/config.yaml
      - /var/log:/var/log
      - app-logs:/var/log/app
    command: -config.file=/etc/promtail/config.yaml
    restart: unless-stopped

volumes:
  grafana-data:
  prometheus-data:
  loki-data:
  app-logs:
```

### Metrics Collection

1. **Application Metrics**:
   - Metrics middleware for API routes
   - Performance tracking
   - Custom business metrics

```typescript
// src/middleware/metrics.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { logger } from '@/lib/logging';

// Initialize Prometheus metrics
collectDefaultMetrics();

// Define custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export async function metrics(request: NextRequest) {
  // Start timing
  const start = Date.now();
  
  // Continue to the next middleware/route handler
  const response = NextResponse.next();
  
  // Record metrics after response
  const duration = (Date.now() - start) / 1000;
  const path = request.nextUrl.pathname;
  const method = request.method;
  const status = response.status;
  
  // Increment request counter
  httpRequestsTotal.inc({ method, path, status });
  
  // Record request duration
  httpRequestDuration.observe({ method, path, status }, duration);
  
  // Log request details
  logger.info({
    method,
    path,
    status,
    duration,
  }, 'HTTP Request');
  
  return response;
}
```

## Infrastructure as Code

The application uses infrastructure as code principles for reproducible deployments.

### Server Setup Script

1. **Implementation**:
   - Bash script for initial server configuration
   - Installation of required dependencies
   - Security hardening

```bash
#!/bin/bash
# infra/scripts/setup.sh

set -e

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting server setup..."

# Update system packages
log "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required dependencies
log "Installing dependencies..."
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw \
  fail2ban

# Install Docker
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure firewall
log "Configuring firewall..."
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw --force enable

# Configure fail2ban
log "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
log "Creating application directory..."
mkdir -p /opt/app
mkdir -p /opt/app/data
mkdir -p /opt/app/logs
mkdir -p /opt/app/backups

# Set up cron job for database backup
log "Setting up database backup cron job..."
(crontab -l 2>/dev/null || echo "") | { cat; echo "0 4 * * * /opt/app/infra/scripts/backup.sh > /opt/app/logs/backup.log 2>&1"; } | crontab -

log "Server setup completed successfully!"
```

### Database Backup and Restore Scripts

1. **Backup Script**:
   - Daily pg_dump execution
   - Upload to Cloudflare storage
   - Rotation of old backups

```bash
#!/bin/bash
# infra/scripts/backup.sh

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/app/backups"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

log "Starting database backup..."

# Load environment variables
source /opt/app/.env.production

# Perform backup
log "Creating database dump..."
docker exec -t postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  log "Database dump created successfully: $BACKUP_FILE"
  
  # Upload to Cloudflare R2 (if configured)
  if [ -n "$CLOUDFLARE_ACCESS_KEY_ID" ] && [ -n "$CLOUDFLARE_SECRET_ACCESS_KEY" ]; then
    log "Uploading backup to Cloudflare R2..."
    
    # Use AWS CLI compatible with R2
    docker run --rm \
      -e AWS_ACCESS_KEY_ID=$CLOUDFLARE_ACCESS_KEY_ID \
      -e AWS_SECRET_ACCESS_KEY=$CLOUDFLARE_SECRET_ACCESS_KEY \
      -v $BACKUP_DIR:/backups \
      amazon/aws-cli \
      s3 cp /backups/$(basename $BACKUP_FILE) \
      s3://$CLOUDFLARE_BUCKET_NAME/backups/$(basename $BACKUP_FILE) \
      --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com
    
    log "Backup uploaded to Cloudflare R2"
  fi
  
  # Delete old backups
  log "Cleaning up old backups..."
  find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  
  log "Backup completed successfully"
else
  log "Error: Database backup failed"
  exit 1
fi
```

2. **Restore Script**:
   - Database restoration from backup
   - Support for specific backup file selection

```bash
#!/bin/bash
# infra/scripts/restore.sh

set -e

# Configuration
BACKUP_DIR="/opt/app/backups"

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if a specific backup file is provided
if [ $# -eq 1 ]; then
  BACKUP_FILE=$1
else
  # Use latest backup file
  BACKUP_FILE=$(ls -t $BACKUP_DIR/backup_*.sql.gz | head -1)
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  log "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

log "Starting database restore from: $BACKUP_FILE"

# Load environment variables
source /opt/app/.env.production

# Confirm before proceeding
read -p "This will overwrite the current database. Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log "Restore cancelled"
  exit 0
fi

# Perform restore
log "Restoring database..."
gunzip -c $BACKUP_FILE | docker exec -i postgres psql -U $POSTGRES_USER $POSTGRES_DB

# Check if restore was successful
if [ $? -eq 0 ]; then
  log "Database restored successfully from: $BACKUP_FILE"
else
  log "Error: Database restore failed"
  exit 1
fi
```