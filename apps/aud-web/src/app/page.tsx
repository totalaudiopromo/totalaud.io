import { FlowCanvas } from "../components/FlowCanvas"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          TotalAud.io Flow Studio
        </h1>
        <p className="text-center text-slate-400">
          Visualise and orchestrate agent workflows in real time.
        </p>
        <FlowCanvas />
      </div>
    </main>
  )
}

