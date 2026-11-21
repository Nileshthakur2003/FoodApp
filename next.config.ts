import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Transpile Konsta UI library packages safely for Next.js Server Components */
  transpilePackages: ['konsta'],
  allowedDevOrigins: [
    '192.168.68.114',
    '192.168.68.126',
    '192.168.68.*',
    '192.168.*',
    'localhost',
    '127.0.0.1',
  ],
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
