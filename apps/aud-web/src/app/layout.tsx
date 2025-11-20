import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AgentKernelProvider } from '@/components/agents/AgentKernelProvider'
import { AgentTeamOrchestratorProvider } from '@/components/agents/teams/AgentTeamOrchestrator'
import { AmbientEngineProvider } from '@/components/ambient/AmbientEngineProvider'
import { CompanionEngineProvider } from '@/components/companion/CompanionEngine'
import { OSProvider } from '@/components/os/navigation'
import { ProjectEngineProvider } from '@/components/projects/ProjectEngineProvider'
import { PersonaEngineProvider } from '@/components/persona/PersonaEngine'
import { MoodEngineProvider } from '@/components/mood/MoodEngineProvider'
import { RitualEngineProvider } from '@/components/rituals/RitualEngineProvider'
import { RootLayoutClient } from './RootLayoutClient'

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'TotalAud.io Console',
  description: 'FlowCore console for TotalAud.io',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="m-0 p-0">
        <ProjectEngineProvider>
          <OSProvider>
            <AmbientEngineProvider>
              <PersonaEngineProvider>
                <CompanionEngineProvider>
                  <AgentKernelProvider>
                    <MoodEngineProvider>
                      <RitualEngineProvider>
                        <AgentTeamOrchestratorProvider>
                          <RootLayoutClient>{children}</RootLayoutClient>
                        </AgentTeamOrchestratorProvider>
                      </RitualEngineProvider>
                    </MoodEngineProvider>
                  </AgentKernelProvider>
                </CompanionEngineProvider>
              </PersonaEngineProvider>
            </AmbientEngineProvider>
          </OSProvider>
        </ProjectEngineProvider>
      </body>
    </html>
  )
}
