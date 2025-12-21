import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/**/*', 'node_modules/**/*'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@aud-web': path.resolve(__dirname, './src'),
    },
  },
})
