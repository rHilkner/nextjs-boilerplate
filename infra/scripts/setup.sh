#!/bin/bash

# Next.js SaaS Boilerplate - Server Setup Script
# This script sets up a fresh Ubuntu LTS server for deployment

set -e

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log "This script must be run as root. Please use sudo."
    exit 1
fi

log "Starting server setup for Next.js SaaS Boilerplate..."

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
  fail2ban \
  nginx \
  certbot \
  python3-certbot-nginx \
  postgresql-client

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

# Add current user to docker group
if [ "$SUDO_USER" ]; then
    log "Adding user $SUDO_USER to docker group..."
    usermod -aG docker $SUDO_USER
fi

# Configure firewall
log "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
log "Firewall is active and enabled on system startup"

# Configure fail2ban
log "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directories
log "Creating application directories..."
mkdir -p /opt/app
mkdir -p /opt/app/data
mkdir -p /opt/app/logs
mkdir -p /opt/app/backups
mkdir -p /opt/app/uploads

# Set correct permissions
if [ "$SUDO_USER" ]; then
    log "Setting permissions for app directories..."
    chown -R $SUDO_USER:$SUDO_USER /opt/app
fi

# Set up cron job for database backup
log "Setting up database backup cron job..."
cat > /etc/cron.d/app-backup << EOL
# Database backup every day at 04:00 UTC
0 4 * * * root /opt/app/infra/scripts/backup.sh > /opt/app/logs/backup.log 2>&1
EOL
chmod 0644 /etc/cron.d/app-backup

# Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/nextjs-app << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'self' https://js.stripe.com; child-src 'self' https://js.stripe.com; form-action 'self'; base-uri 'self'; frame-ancestors 'self'";

    # Logging
    access_log /var/log/nginx/app-access.log;
    error_log /var/log/nginx/app-error.log;
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Enable nginx to start at boot
systemctl enable nginx

# Create Docker Compose file template
log "Creating Docker Compose template..."
cat > /opt/app/docker-compose.yml << EOL
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: infra/docker/app/Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - db
    env_file:
      - .env.production
    volumes:
      - ./uploads:/app/uploads
      - app-logs:/app/logs

  db:
    image: postgres:14-alpine
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  monitoring:
    image: grafana/grafana:latest
    restart: unless-stopped
    depends_on:
      - prometheus
      - loki
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./infra/monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=\${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false

  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./infra/monitoring/prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'

  loki:
    image: grafana/loki:latest
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./infra/monitoring/loki/config.yaml:/etc/loki/config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/config.yaml

  promtail:
    image: grafana/promtail:latest
    restart: unless-stopped
    volumes:
      - ./infra/monitoring/promtail/config.yaml:/etc/promtail/config.yaml
      - /var/log:/var/log
      - app-logs:/logs
    command: -config.file=/etc/promtail/config.yaml

volumes:
  postgres-data:
  grafana-data:
  prometheus-data:
  loki-data:
  app-logs:
EOL

# Create scripts
log "Creating backup and restore scripts..."

# Backup script
cat > /opt/app/infra/scripts/backup.sh << 'EOL'
#!/bin/bash

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
docker exec -t $(docker ps -q -f name=db) pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_FILE

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
EOL

# Restore script
cat > /opt/app/infra/scripts/restore.sh << 'EOL'
#!/bin/bash

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
gunzip -c $BACKUP_FILE | docker exec -i $(docker ps -q -f name=db) psql -U $POSTGRES_USER $POSTGRES_DB

# Check if restore was successful
if [ $? -eq 0 ]; then
  log "Database restored successfully from: $BACKUP_FILE"
else
  log "Error: Database restore failed"
  exit 1
fi
EOL

# Deployment script
cat > /opt/app/infra/scripts/deploy.sh << 'EOL'
#!/bin/bash

set -e

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting deployment..."

# Navigate to app directory
cd /opt/app

# Pull latest changes
log "Pulling latest changes..."
git pull

# Build and start containers
log "Building and starting containers..."
docker-compose down
docker-compose build
docker-compose up -d

# Run database migrations
log "Running database migrations..."
docker exec $(docker ps -q -f name=app) npx prisma migrate deploy

# Check application health
log "Checking application health..."
for i in {1..10}; do
  if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    log "Application is healthy"
    break
  fi
  
  if [ $i -eq 10 ]; then
    log "Error: Application health check failed"
    exit 1
  fi
  
  log "Waiting for application to start..."
  sleep 5
done

log "Deployment completed successfully"
EOL

# Make scripts executable
chmod +x /opt/app/infra/scripts/*.sh

# Final message
log "Server setup completed successfully!"
log ""
log "Next steps:"
log "1. Update your DNS to point to this server"
log "2. Obtain SSL certificate: certbot --nginx -d yourdomain.com"
log "3. Clone your application to /opt/app"
log "4. Set up .env.production with your environment variables"
log "5. Deploy your application: /opt/app/infra/scripts/deploy.sh"
log ""
log "Happy hosting!"