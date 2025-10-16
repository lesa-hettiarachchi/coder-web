#!/bin/sh
# entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database push and seed
echo "Running Prisma migrations and seeding..."
npx prisma db push
npx tsx prisma/seed.ts
echo "Database is ready."

# Execute the main command (passed to the script)
exec "$@"