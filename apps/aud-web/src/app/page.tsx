export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TotalAud.io
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Marketing your music should be as creative as making it.
          </p>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
            <p className="text-slate-400">
              AI-powered creative studio for music marketing
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

