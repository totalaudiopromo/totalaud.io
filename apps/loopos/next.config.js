/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  transpilePackages: [
    '@total-audio/core-logger',
    '@total-audio/core-supabase',
    '@total-audio/core-agent-executor',
    '@total-audio/schemas-database',
    '@total-audio/ui',
  ],
  typescript: {
    ignoreBuildErrors: false, // Strict TypeScript
  },
  eslint: {
    ignoreDuringBuilds: false, // Strict ESLint
  },
  webpack: (config) => {
    config.resolve.alias['@loopos'] = path.resolve(__dirname, 'src')
    return config
  },
}

module.exports = nextConfig
