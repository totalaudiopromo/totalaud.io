import { Sidebar } from '@/components/console/layout/Sidebar'
import { TopBar } from '@/components/console/layout/TopBar'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-tap-black">
      <Sidebar />
      <div className="flex-1 ml-64 max-md:ml-0">
        <TopBar />
        <main className="min-h-[calc(100vh-73px)]">{children}</main>
      </div>
    </div>
  )
}
