// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'synthetiseur.net',
        pathname: '/images/**',
      }
    ]
  }
};

module.exports = nextConfig;