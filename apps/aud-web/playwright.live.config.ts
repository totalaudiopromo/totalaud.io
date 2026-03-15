import { defineConfig, devices } from '@playwright/test'
import baseConfig from './playwright.config'

/**
 * Playwright Configuration for Live Environment Testing
 */
export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: 'https://totalaud.io',
  },
  // Skip starting the local dev server
  webServer: undefined,
  // Adjust timeout for live site if needed
  timeout: 60000,
})
