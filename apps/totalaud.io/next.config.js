// Polyfill localStorage for server-side execution in dev (some client packages expect it).
if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof globalThis.localStorage.getItem !== 'function'
) {
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => {
      storage.set(key, String(value))
    },
    removeItem: (key) => {
      storage.delete(key)
    },
    clear: () => storage.clear(),
    key: (index) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size
    },
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@total-audio/operator-os',
    '@total-audio/operator-boot',
    '@total-audio/operator-services',
  ],
}

module.exports = nextConfig
