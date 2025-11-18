/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@total-audio/operator-os',
    '@total-audio/operator-boot',
    '@total-audio/operator-services',
  ],
};

module.exports = nextConfig;
