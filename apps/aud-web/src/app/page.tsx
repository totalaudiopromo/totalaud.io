import { FlowCanvas } from "../components/FlowCanvas"
import ConsoleShell from "../components/ConsoleShell"
import ThemeToggle from "../components/ThemeToggle"

export default function HomePage() {
  return (
    <main className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            TotalAud.io Flow Studio
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Marketing your music should be as creative as making it. Visualise and orchestrate agent workflows in real time.
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">●</span>
              <span className="text-slate-500">4 Agents Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">●</span>
              <span className="text-slate-500">Realtime Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">●</span>
              <span className="text-slate-500">Console Mode Ready</span>
            </div>
          </div>
        </div>

        {/* Flow Canvas wrapped in Console Shell */}
        <ConsoleShell 
          title="AGENT WORKFLOW ORCHESTRATOR"
          accentColor="#6366f1"
        >
          <div className="h-[70vh]">
            <FlowCanvas />
          </div>
        </ConsoleShell>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: "Scout", emoji: "🧭", color: "#10b981", status: "Ready" },
            { name: "Coach", emoji: "🎙️", color: "#6366f1", status: "Ready" },
            { name: "Tracker", emoji: "📊", color: "#f59e0b", status: "Ready" },
            { name: "Insight", emoji: "💡", color: "#8b5cf6", status: "Ready" }
          ].map((agent) => (
            <div
              key={agent.name}
              className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
              style={{
                boxShadow: `0 0 20px -10px ${agent.color}20`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{agent.emoji}</span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-mono"
                  style={{
                    backgroundColor: `${agent.color}20`,
                    color: agent.color
                  }}
                >
                  {agent.status}
                </span>
              </div>
              <div className="text-white font-medium">{agent.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">
                agent_{agent.name.toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </main>
  )
}

