import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@aud-web': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
      '@total-audio/core-logger': path.resolve(
        __dirname,
        '../../packages/core/logger/src/index.ts'
      ),
      '@total-audio/core-agent-executor/client': path.resolve(
        __dirname,
        '../../packages/core/agent-executor/src/client/index.ts'
      ),
      '@total-audio/core-supabase': path.resolve(
        __dirname,
        '../../packages/core/supabase/src/index.ts'
      ),
    },
  },
})
