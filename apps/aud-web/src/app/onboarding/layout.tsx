/**
 * Onboarding Layout
 *
 * Forces dynamic rendering to avoid build-time context errors.
 * Wraps children with ProjectEngineProvider for useProjectEngine hook.
 */

import type { ReactNode } from 'react'
import { ProjectEngineProvider } from '@/components/projects/ProjectEngineProvider'
import { CompanionEngineProvider } from '@/components/companion/CompanionEngine'

export const dynamic = 'force-dynamic'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ProjectEngineProvider>
      <CompanionEngineProvider>
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </CompanionEngineProvider>
    </ProjectEngineProvider>
  )
}
