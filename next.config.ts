import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  output: 'standalone',

  serverExternalPackages: ['@prisma/client'],

  images: {
    unoptimized: true, 
  },
};

export default nextConfig;
