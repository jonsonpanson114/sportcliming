import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'img.youtube.com' },
      { hostname: 'i.ytimg.com' },
    ],
  },
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-libsql', '@libsql/client'],
};

export default nextConfig;
