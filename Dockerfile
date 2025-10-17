# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application with standalone output
# Make sure next.config.js has "output: 'standalone'"
RUN npm run build

# ---
# Stage 2: Create the final production image
FROM node:20-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the essential outputs from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# --- FIX: COPY THE PRISMA FOLDER ---
# The entrypoint script needs this to run migrations and seeds.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy the entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

# Set the entrypoint to initialize the database
ENTRYPOINT ["./entrypoint.sh"]

# Use the correct command to start the standalone server
CMD ["node", "server.js"]