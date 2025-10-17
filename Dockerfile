# Multi-stage Dockerfile for optimized production build
FROM node:20-alpine AS base

# Install required packages
RUN apk add --no-cache libc6-compat wget curl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Update npm to latest version
RUN npm install -g npm@latest

COPY package.json ./


RUN npm install --no-package-lock

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application (standalone output)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./

# Copy Prisma files and database
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh .
RUN chmod +x entrypoint.sh

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

EXPOSE 3000

# Set the entrypoint and command
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]