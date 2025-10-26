/**
 * Console Page - Unified Workspace Entry
 *
 * Phase 10: Unified Console Refactor
 * Cinematic workspace with theme selector, tool switcher, and mode navigation
 * Route: /console
 */

import { ConsoleDashboard } from '@aud-web/components/layouts/ConsoleDashboard'

export const metadata = {
  title: 'Console | totalaud.io',
  description: 'Unified creative workspace',
}

export default function ConsolePage() {
  return <ConsoleDashboard />
}
