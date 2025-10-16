# Simple, bulletproof Dockerfile
FROM node:20-alpine

# Install required packages
RUN apk add --no-cache libc6-compat wget curl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy prisma files and database to ensure they're accessible
COPY --chown=nextjs:nodejs prisma/ ./prisma/

# Ensure database file exists and is accessible
RUN touch ./prisma/dev.db && chown nextjs:nodejs ./prisma/dev.db

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Creating database and seeding..."\n\
npx prisma db push\n\
npx tsx prisma/seed.ts\n\
echo "Starting application..."\n\
node .next/standalone/server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
