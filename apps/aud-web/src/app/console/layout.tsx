import { Sidebar } from '@/components/console/layout/Sidebar'
import { TopBar } from '@/components/console/layout/TopBar'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-ta-black">
      <Sidebar />
      <div className="flex-1 ml-64 max-md:ml-0">
        <TopBar />
        <main className="min-h-[calc(100vh-73px)]">{children}</main>
      </div>
    </div>
  )
}
