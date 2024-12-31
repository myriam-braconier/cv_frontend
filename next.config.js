// next.config.js

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
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