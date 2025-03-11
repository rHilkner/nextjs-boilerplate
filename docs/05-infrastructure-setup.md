# Infrastructure Setup

This document outlines the infrastructure setup for deploying the Next.js SaaS boilerplate to a production environment.

## Overview

The application is deployed on a Vultr VPS running Ubuntu LTS, using Docker for containerization and orchestration. The setup includes:

- Docker containers for the Next.js application and PostgreSQL database
- Nginx as a reverse proxy with HTTPS configuration
- Automated backups for the database
- Monitoring and logging infrastructure
- Cloudflare for CDN, DNS, and storage

## VPS Setup

### Initial Server Provisioning

1. Create a Vultr VPS instance with Ubuntu LTS
2. Set up SSH key authentication
3. Run the setup script to install required dependencies and configure the server:

```bash
./infra/scripts/setup.sh
```

The setup script performs the following tasks:
- Updates the system packages
- Installs Docker and Docker Compose
- Creates necessary directories for application data
- Sets up system users and permissions
- Configures firewall rules
- Installs monitoring tools
- Sets up backup scripts and cron jobs

### Domain Configuration

1. Register your domain and configure it on Cloudflare
2. Set up DNS records to point to your VPS IP address
3. Enable Cloudflare CDN and security features

## Docker Configuration

### Docker Compose

The `docker-compose.yml` file defines the following services:

1. **Next.js Application**
   - Built from the application Dockerfile
   - Connected to the database
   - Exposed on port 3000 internally

2. **PostgreSQL Database**
   - Persistent volume for data storage
   - Configured for performance and security
   - Regular backups

3. **Monitoring Dashboard**
   - Self-hosted dashboard for application metrics
   - Connected to log collection

4. **Log Collection**
   - Centralized log storage and processing
   - Integration with application logs

### Dockerfile

The application Dockerfile includes:

1. Multi-stage build process for optimized size
2. Node.js runtime with proper security settings
3. Production-only dependencies
4. Non-root user for security
5. Health check configuration

## Database Management

### Backup Process

A daily backup of the PostgreSQL database is performed at 04:00 UTC using `pg_dump`. The script:

1. Creates a timestamped backup file
2. Compresses the backup to save space
3. Uploads the backup to Cloudflare storage
4. Maintains a configurable retention policy for backups
5. Sends a notification on success or failure

```bash
# Manual backup
./infra/scripts/backup.sh
```

### Restore Process

To restore the database from a backup:

```bash
# Restore from the latest backup
./infra/scripts/restore.sh

# Restore from a specific backup file
./infra/scripts/restore.sh /path/to/backup/file.sql.gz
```

## HTTPS Configuration

Nginx is configured as a reverse proxy with HTTPS:

1. Certificates are obtained and renewed using Certbot/Let's Encrypt
2. HTTP traffic is redirected to HTTPS
3. Modern TLS configuration for security
4. HTTP/2 enabled for performance
5. Security headers configured

## Monitoring and Logging

### Monitoring Dashboard

The self-hosted monitoring dashboard provides:

1. Real-time application metrics
2. System resource utilization
3. Database performance monitoring
4. Custom KPI tracking

### Logging

The logging infrastructure includes:

1. Structured JSON logs using Pino
2. Request ID tracking for correlation
3. Centralized log storage
4. Log retention policies
5. Search and analysis capabilities

## Deployment Process

### First Deployment

To perform the initial deployment:

```bash
./infra/scripts/deploy.sh
```

This script:
1. Builds the application Docker image
2. Pushes the image to the container registry
3. Applies database migrations
4. Starts the Docker Compose services
5. Configures Nginx

### Updates

To deploy updates:

```bash
./infra/scripts/deploy.sh
```

The update process:
1. Pulls the latest code
2. Builds a new Docker image
3. Applies database migrations if needed
4. Updates the Docker Compose services with zero downtime
5. Performs health checks

## Security Measures

The infrastructure includes several security measures:

1. **Firewall**
   - Only necessary ports are open (SSH, HTTP, HTTPS)
   - Rate limiting for SSH and HTTP requests

2. **Docker Security**
   - Non-root users in containers
   - Read-only file systems where possible
   - Limited container capabilities

3. **Database Security**
   - Strong passwords
   - No public exposure
   - Encrypted connections

4. **Application Security**
   - HTTPS everywhere
   - Modern TLS configuration
   - Security headers
   - CSRF protection

## Maintenance Tasks

### Regular Updates

System updates should be performed regularly:

```bash
./infra/scripts/update-system.sh
```

### Log Rotation

Logs are automatically rotated to prevent disk space issues:

```bash
# Check log sizes
./infra/scripts/check-logs.sh
```

### Database Maintenance

Regular database maintenance tasks:

```bash
# Vacuum and analyze
./infra/scripts/db-maintenance.sh
```

## Disaster Recovery

### Backup Verification

Regularly verify that backups can be restored:

```bash
./infra/scripts/verify-backup.sh
```

### Recovery Procedure

In case of server failure:

1. Provision a new server
2. Run the setup script
3. Restore from the latest backup
4. Update DNS records if needed

## Environment Variables

The following environment variables must be configured:

```
# Basic Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@db:5432/app

# Authentication
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
EMAIL_PROVIDER=your-email-provider
EMAIL_API_KEY=your-email-api-key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

These variables are stored in a `.env.production` file on the server (not committed to Git) and securely passed to Docker containers.