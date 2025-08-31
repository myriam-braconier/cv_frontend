/** @type {import('next').NextConfig} */
module.exports = {
    // output: "standalone",
    poweredByHeader: false,
    reactStrictMode: true,
    
    // Configuration Webpack pour éviter les erreurs Redis côté client
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Fallbacks pour les modules Node.js non disponibles côté client
            config.resolve.fallback = {
                ...config.resolve.fallback,
                net: false,
                tls: false,
                fs: false,
                dns: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
            };
        }
        return config;
    },
    
    rewrites: async () => {
        const backendUrl =
            process.env.NODE_ENV === "production"
                ? "https://cvbackend-production-302b.up.railway.app"
                : "http://localhost:4000";
        return [
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: "/auth/:path*",
                destination: `${backendUrl}/auth/:path*`,
            },
        ];
    },
    
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "4000",
                pathname: "/images/**",
            },
            {
                protocol: "https",
                hostname: "synthetiseur.net",
                pathname: "/images/**",
            },
            {
                protocol: "https",
                hostname: "concrete-vibes.up.railway.app",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "api.freepik.com/v1/ai",
                pathname: "/**",
            },
            // Ajout pour les images générées dynamiquement
            {
                protocol: "https",
                hostname: "*.amazonaws.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.cloudinary.com",
                pathname: "/**",
            },
        ],
        minimumCacheTTL: 60,
        deviceSizes: [414, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Formats d'images supportés
        formats: ['image/webp', 'image/avif'],
        // Taille max des images
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    
    // Variables d'environnement exposées côté client (optionnel)
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    
    // Optimisations supplémentaires
    experimental: {
        optimizeCss: true,
        optimizeServerReact: true,
    },
    
    // Configuration des headers de sécurité
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    },
};