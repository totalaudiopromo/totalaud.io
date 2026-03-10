'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/AppShell'
import { BookMarked } from 'lucide-react'

export default function JournalPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Journal</h1>
            <p className="text-foreground/60">
              Capture reflections, voice memos, and creative insights
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-8">
            <div className="text-centre py-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-centre justify-centre mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Journal coming soon</h2>
              <p className="text-foreground/60">Record voice memos and written reflections</p>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
