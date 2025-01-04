/** @type {import('next').NextConfig} */
module.exports = {
	output: "standalone",
	poweredByHeader: false,
	reactStrictMode: true,
	rewrites: async () => {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:4000/api/:path*",
			},
			{
				source: "/about",
				destination: "http://localhost:4000/about*",
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
		],

		deviceSizes: [414, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		domains: ["https://concrete-frontend.vercel.app"], // pour utiliser des images externes
	},
};
