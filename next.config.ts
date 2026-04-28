import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;
