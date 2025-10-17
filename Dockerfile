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

# Copy the essential outputs from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy types folder for seed script
COPY --from=builder --chown=nextjs:nodejs /app/types ./types

# Copy package.json for tsx dependency
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./

# Install only production dependencies including tsx for seeding
RUN npm ci --only=production && npm install tsx

# Switch to non-root user
USER nextjs

# Copy the entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

# Set the entrypoint to initialize the database
ENTRYPOINT ["./entrypoint.sh"]

# Use the correct command to start the standalone server
CMD ["node", "server.js"]