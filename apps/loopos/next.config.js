/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@total-audio/core-agent-executor',
    '@total-audio/core-logger',
    '@total-audio/core-supabase',
    '@total-audio/loopos-db',
    '@total-audio/ui',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001'],
    },
  },
}

module.exports = nextConfig
