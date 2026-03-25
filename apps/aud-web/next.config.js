/** @type {import('next').NextConfig} */
const path = require('path')
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  transpilePackages: ['@total-audio/core-logger', '@total-audio/core-supabase', '@total-audio/ui'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Fix path alias resolution for Vercel builds
    // Use package-scoped alias instead of generic @/* for better monorepo compatibility
    config.resolve.alias['@aud-web'] = path.resolve(__dirname, 'src')
    return config
  },
}

// Only wrap with Sentry if DSN is configured
module.exports =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, {
        // Suppresses source map uploading logs during build
        silent: true,

        // Source map upload configuration
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Widen scope of uploads to include all source map files
        widenClientFileUpload: true,

        // Automatically instrument server functions and API routes
        automaticVercelMonitors: true,
      })
    : nextConfig
