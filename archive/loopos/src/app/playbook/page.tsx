'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/AppShell'
import { BookOpen } from 'lucide-react'

export default function PlaybookPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Playbook</h1>
            <p className="text-foreground/60">
              Strategic guidance and frameworks for music promotion
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-8">
            <div className="text-centre py-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-centre justify-centre mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Playbook coming soon</h2>
              <p className="text-foreground/60">
                Structured chapters on release strategy, audience growth, and more
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
