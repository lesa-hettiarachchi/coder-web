import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Optimize for production
  serverExternalPackages: ['@prisma/client'],
  
  // Image optimization
  images: {
    unoptimized: true, // Disable for static export if needed
  },
};

export default nextConfig;
