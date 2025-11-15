/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@total-audio/ui',
    '@total-audio/core-logger',
    '@total-audio/core-supabase',
    '@total-audio/loopos-db',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
