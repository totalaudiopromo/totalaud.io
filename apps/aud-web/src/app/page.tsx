"use client"

import { CommandPalette } from "../components/CommandPalette"
import { useState } from "react"

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleCommand(query: string) {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/skills/research-contacts/invoke", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // In production, this would be a real auth token
          "Authorization": "Bearer demo-token"
        },
        body: JSON.stringify({
          query,
          type: "radio",
          genres: ["indie", "electronic"],
          regions: ["UK"],
          max_results: 3
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        console.error("Error:", data)
        alert(`Error: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Request failed:", error)
      alert("Failed to execute skill. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

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
          
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8">
            <p className="text-slate-400 mb-4">
              AI-powered creative studio for music marketing
            </p>
            <p className="text-sm text-slate-500">
              Press <kbd className="px-2 py-1 bg-slate-700 rounded text-blue-400">⌘K</kbd> to get started
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-400">Searching contacts...</span>
              </div>
            </div>
          )}

          {/* Results */}
          {result && result.output && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-left">
              <h3 className="text-xl font-bold text-green-400 mb-4">
                Found {result.output.contacts?.length || 0} contacts
              </h3>
              <div className="space-y-4">
                {result.output.contacts?.map((contact: any, i: number) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-white">{contact.name}</h4>
                        <p className="text-sm text-slate-400">{contact.role} at {contact.outlet}</p>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {Math.round(contact.relevance_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{contact.email}</p>
                    <p className="text-xs text-slate-500 italic">{contact.notes}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Completed in {result.duration_ms}ms
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CommandPalette onSubmit={handleCommand} />
      
      {/* Uncomment to enable Agent Chat bubble */}
      {/* <AgentChat agentName="promo-coach" agentEmoji="🎙️" agentColor="#6366f1" /> */}
    </main>
  )
}

