/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  transpilePackages: [
    '@total-audio/core-logger',
    '@total-audio/core-supabase',
    '@total-audio/core-skills-engine',
    '@total-audio/ui',
  ],
  typescript: {
    // Build checks re-enabled after security hardening (December 2025)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Build checks re-enabled after security hardening (December 2025)
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Fix path alias resolution for Vercel builds
    // Use package-scoped alias instead of generic @/* for better monorepo compatibility
    config.resolve.alias['@aud-web'] = path.resolve(__dirname, 'src')
    return config
  },
}

module.exports = nextConfig
