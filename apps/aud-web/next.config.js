/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@total-audio/core-supabase',
    '@total-audio/core-skills-engine',
    '@total-audio/ui'
  ]
}

module.exports = nextConfig

