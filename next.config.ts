import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'synthetiseur.net',
        pathname: '/images/**',
      },
    ],
  },
};

export default config;

