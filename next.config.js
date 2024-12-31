// next.config.js

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*'
      },
    ]
  },
  
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