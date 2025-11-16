'use client'

/**
 * ASCII OS Page - Terminal & Agent Commands
 * Supports director typing and command execution
 */

import { useEffect, useState, useRef } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { Terminal } from 'lucide-react'

export function AsciiOSPage() {
  const director = useDirector()
  const [inputValue, setInputValue] = useState('')
  const [output, setOutput] = useState<string[]>([
    '> aud-os v2.0.0',
    '> Type "help" for available commands',
    '',
  ])
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Register director callbacks
  useEffect(() => {
    director.engine.setCallbacks({
      onTypeAscii: async (text: string, durationMs: number) => {
        setIsTyping(true)
        setInputValue('')

        // Simulate typing character by character
        const charDelay = durationMs / text.length
        for (let i = 0; i <= text.length; i++) {
          setInputValue(text.slice(0, i))
          await new Promise((resolve) => setTimeout(resolve, charDelay))
        }

        setIsTyping(false)
      },

      onRunAsciiCommand: () => {
        handleSubmit()
      },
    })
  }, [director])

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    const newOutput = [...output, `> ${inputValue}`]

    // Simple command parsing
    if (inputValue.startsWith('agent run coach')) {
      newOutput.push('⚡ Running agent: coach')
      newOutput.push('📤 Request sent to agent kernel')
      newOutput.push('⏳ Waiting for response...')
      newOutput.push('')

      // Simulate agent response after a delay
      setTimeout(() => {
        setOutput((prev) => [
          ...prev,
          '✅ Agent completed',
          '📊 View results in XP Agent Monitor',
          '',
        ])
      }, 2000)
    } else if (inputValue === 'help') {
      newOutput.push('Available commands:')
      newOutput.push('  agent run <type> "<prompt>" - Run an AI agent')
      newOutput.push('  help - Show this help message')
      newOutput.push('  clear - Clear terminal')
      newOutput.push('')
    } else if (inputValue === 'clear') {
      setOutput([])
      setInputValue('')
      return
    } else {
      newOutput.push(`Command not found: ${inputValue}`)
      newOutput.push('Type "help" for available commands')
      newOutput.push('')
    }

    setOutput(newOutput)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="w-full h-full bg-[#0F1113] text-[#00FF00] p-8 font-mono overflow-auto">
      {/* Header */}
      <div className="flex items-centre gap-3 mb-6">
        <Terminal className="w-6 h-6" />
        <div>
          <h1 className="text-xl font-bold">ASCII Terminal</h1>
          <p className="text-xs text-[#00FF00]/60">aud-os command interface</p>
        </div>
      </div>

      {/* Terminal output */}
      <div className="mb-4 space-y-1">
        {output.map((line, i) => (
          <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>

      {/* Input line */}
      <div className="flex items-centre gap-2">
        <span className="text-[#00FF00]">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => !isTyping && setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          className="flex-1 bg-transparent border-none outline-none text-[#00FF00] font-mono text-sm"
          placeholder={isTyping ? '' : 'Type a command...'}
          autoFocus
        />
        <span className="animate-pulse">_</span>
      </div>

      {/* CRT scan lines effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        }}
      />

      {/* Glow effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,255,0,0.1)',
        }}
      />
    </div>
  )
}
