import type { NextConfig } from 'next';

const config: NextConfig = {
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
