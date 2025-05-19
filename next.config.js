/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let Next.js use its default directory
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    unoptimized: true,
  },
  // Ensure output is visible for Vercel
  output: 'standalone',
};

module.exports = nextConfig; 