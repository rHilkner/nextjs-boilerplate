FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data about general usage
# Learn more here: https://nextjs.org/telemetry
# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permissions
RUN mkdir -p /app/.next/cache && \
    mkdir -p /app/uploads && \
    mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app/.next && \
    chown -R nextjs:nodejs /app/uploads && \
    chown -R nextjs:nodejs /app/logs

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Install Prisma client for migrations
RUN npm install --production=false --prefix=/app prisma @prisma/client
RUN npx prisma generate

# Switch to non-root user
USER nextjs

# Expose the listening port
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1

# Run the application
CMD ["node", "server.js"]