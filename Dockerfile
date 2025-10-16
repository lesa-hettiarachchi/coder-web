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

# Generate Prisma client and create database
RUN npx prisma generate
RUN npx prisma db push
RUN npm run seed-questions

# Build the application
RUN npm run build

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy prisma files to ensure they're accessible
COPY --chown=nextjs:nodejs prisma/ ./prisma/

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["npm", "start"]
