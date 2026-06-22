import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the floating "N" dev indicator so it doesn't cover the sidebar.
  devIndicators: false,
  // Keep mongoose out of the bundler — it must run in the Node runtime only.
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;