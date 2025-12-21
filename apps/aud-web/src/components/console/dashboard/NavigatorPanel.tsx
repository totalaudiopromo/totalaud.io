'use client'

import { useState } from 'react'
import { Card } from '../ui/Card'
import { EnhancedButton } from '@/components/ui/EnhancedButton'
import { useNavigator } from '@/hooks/useIntelligence'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigatorPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigator = useNavigator()

  const handleAsk = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    const currentQuestion = question
    setQuestion('') // Clear input immediately for better UX

    try {
      console.log('[NavigatorPanel] Asking:', currentQuestion)
      const result = await navigator.ask(currentQuestion)
      console.log('[NavigatorPanel] Got result:', result)
      setAnswer(result)
    } catch (err) {
      console.error('[NavigatorPanel] Error:', err)
      setError('Failed to get a response. Please try again.')
      setQuestion(currentQuestion) // Restore question on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#161A1D] to-[#0F1113] border border-white/5">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-tap-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex items-start gap-4 z-10">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-tap-cyan/20 to-tap-cyan/5 rounded-xl border border-tap-cyan/20 flex items-center justify-center animate-subtle-float">
          <SparklesIcon className="w-5 h-5 text-tap-cyan" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-tap-white tracking-tight mb-1">AI Navigator</h3>
            <p className="text-sm text-tap-grey/80">
              Ask questions about your campaign data and strategy.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask the navigator anything..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-tap-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-tap-cyan/30 transition-all duration-300"
                disabled={loading}
              />
              {/* Input focus glow */}
              <div className="absolute inset-0 -z-10 bg-tap-cyan/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-xl" />
            </div>

            <EnhancedButton
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              variant="primary"
              glow={true}
              isLoading={loading}
              className="px-6"
            >
              Ask
            </EnhancedButton>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="text-xs font-medium text-tap-cyan tracking-wider uppercase animate-pulse">
                  Thinking
                </span>
              </motion.div>
            )}

            {answer && !loading && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-4 pt-2"
              >
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-tap-white leading-relaxed">{answer.answer}</p>
                </div>

                {answer.recommendedActions && answer.recommendedActions.length > 0 && (
                  <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-xs text-tap-grey font-medium uppercase tracking-wider mb-2 ml-1">
                      Recommended Actions
                    </p>
                    <ul className="space-y-2">
                      {answer.recommendedActions.map((action: string, i: number) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-tap-cyan group-hover:shadow-[0_0_8px_rgba(58,169,190,0.8)] transition-all" />
                          <span className="text-sm text-tap-white/90 group-hover:text-white transition-colors">
                            {action}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}
