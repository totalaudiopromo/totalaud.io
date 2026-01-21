import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import WorkspaceClientLayout from './ClientLayout'

/**
 * Server-side Workspace Layout
 * Enforces authentication before rendering the client layout.
 */
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <WorkspaceClientLayout>{children}</WorkspaceClientLayout>
}
