/**
 * Console Page - Main Workspace Entry
 *
 * Replaces the dashboard with a single-screen workspace.
 * Route: /console
 */

import { ConsoleLayout } from '@aud-web/layouts/ConsoleLayout'

export const metadata = {
  title: 'Console | aud',
  description: 'Campaign command center',
}

export default function ConsolePage() {
  return <ConsoleLayout />
}
