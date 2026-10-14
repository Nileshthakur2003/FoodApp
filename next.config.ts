import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Transpile Konsta UI library packages safely for Next.js Server Components */
  transpilePackages: ['konsta'],
  allowedDevOrigins: ['192.168.68.126']
};

export default nextConfig;
