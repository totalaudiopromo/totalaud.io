import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-matte-black text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold glow-slate-cyan text-slate-cyan">
              LoopOS
            </h1>
            <p className="text-xl text-gray-400">
              Your cinematic campaign engine — from concept to execution
            </p>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            <NavCard
              href="/timeline"
              title="Timeline"
              description="Cinematic canvas for campaign sequencing"
              icon="🎬"
            />
            <NavCard
              href="/journal"
              title="Journal"
              description="Daily reflections and campaign notes"
              icon="📔"
            />
            <NavCard
              href="/coach"
              title="Coach"
              description="AI-powered campaign guidance"
              icon="🎯"
            />
            <NavCard
              href="/moodboard"
              title="Moodboard"
              description="Visual inspiration and references"
              icon="🎨"
            />
            <NavCard
              href="/packs"
              title="Creative Packs"
              description="Pre-built campaign templates"
              icon="📦"
            />
            <NavCard
              href="/playbook"
              title="Playbook"
              description="Strategic campaign chapters"
              icon="📖"
            />
            <NavCard
              href="/insights"
              title="Flow Insights"
              description="Real-time campaign metrics"
              icon="📊"
            />
            <NavCard
              href="/agents"
              title="Agent Workbench"
              description="Test and run agent skills"
              icon="🤖"
            />
            <NavCard
              href="/export"
              title="Export Centre"
              description="Generate campaign deliverables"
              icon="📤"
            />
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>LoopOS • Phase 6 Implementation • British English • Matte Black × Slate Cyan</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-slate-cyan/50 transition-all duration-240 hover:shadow-lg hover:shadow-slate-cyan/10"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white group-hover:text-slate-cyan transition-colours">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </Link>
  )
}
