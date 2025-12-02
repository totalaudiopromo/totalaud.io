'use client'

import { useState } from 'react'
import { Card } from '../ui/Card'
import { useNavigator } from '@/hooks/useIntelligence'
import { SparklesIcon } from '@heroicons/react/24/outline'

export function NavigatorPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const navigator = useNavigator()

  const handleAsk = async () => {
    if (!question.trim()) return

    setLoading(true)
    try {
      const result = await navigator.ask(question)
      setAnswer(result)
    } catch (error) {
      console.error('Navigator error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-tap-panel to-tap-black/50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-tap-cyan/20 rounded-lg flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-tap-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-tap-white lowercase mb-2">ai navigator</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="ask the navigator anything..."
              className="flex-1 bg-tap-black border border-tap-panel/50 rounded-lg px-4 py-2 text-sm text-tap-white placeholder:text-tap-grey lowercase focus:outline-none focus:ring-2 focus:ring-tap-cyan/50"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="px-6 py-2 bg-tap-cyan text-tap-black rounded-lg text-sm font-medium lowercase hover:bg-tap-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180"
            >
              {loading ? 'thinking...' : 'ask'}
            </button>
          </div>

          {answer && (
            <div className="space-y-3">
              <p className="text-sm text-tap-white leading-relaxed">{answer.answer}</p>
              {answer.recommendedActions && answer.recommendedActions.length > 0 && (
                <div className="pt-3 border-t border-tap-panel/30">
                  <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">
                    recommended actions
                  </p>
                  <ul className="space-y-1">
                    {answer.recommendedActions.map((action: string, i: number) => (
                      <li key={i} className="text-xs text-tap-white flex items-start gap-2">
                        <span className="text-tap-cyan">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
