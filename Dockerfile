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

# Generate Prisma client (this is needed for the build)
RUN npx prisma generate

# Build the application
RUN npm run build

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions for the entire app directory
# This ensures the 'nextjs' user owns everything, including node_modules
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# --- NEW: Add the entrypoint script ---
# Switch back to root temporarily to copy and set permissions
USER root
COPY --chown=nextjs:nodejs entrypoint.sh .
RUN chmod +x entrypoint.sh
# Switch back to the app user
USER nextjs
# --- END NEW ---

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# --- MODIFIED: Set the entrypoint and keep the command ---
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]