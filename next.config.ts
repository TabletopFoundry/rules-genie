import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // The `@tabletopfoundry/*` packages ship raw TypeScript (no build step),
  // so Next/SWC must transpile them at build time alongside our own src.
  transpilePackages: ['@tabletopfoundry/catalog'],
  // The platform packages follow the ESM-style "import './file.js'" pattern
  // (required by NodeNext resolution); webpack needs to know how to map
  // the .js specifier back to the actual .ts source when bundling them.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js']
    };
    return config;
  },
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;
