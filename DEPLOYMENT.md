# Vercel Deployment Guide

## Database Setup

This application requires a PostgreSQL database for Vercel deployment. SQLite (used locally) is not supported on Vercel.

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Select your project
3. Go to Storage tab
4. Create a new Postgres database
5. Copy the connection string
6. Add it as `DATABASE_URL` environment variable in Vercel

### Option 2: External PostgreSQL
Use services like:
- Neon (neon.tech)
- Supabase (supabase.com)
- PlanetScale (planetscale.com)
- Railway (railway.app)

## Environment Variables
Add these in your Vercel project settings:
```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
```

## Migration Commands
After setting up the database, run these commands:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed the database (optional)
npm run seed-questions
```

## Local Development
For local development, you can still use SQLite by creating a `.env.local` file:
```
DATABASE_URL="file:./dev.db"
```
