/**
 * Command Palette
 * ⌘K powered global search and actions
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { createClient } from '@/lib/supabase/client'
import type { LoopOSNode, LoopOSNote } from '@total-audio/loopos-db'
import { useUser } from '@/hooks/useUser'
import { Search, FileText, Circle, Hash, ArrowRight } from 'lucide-react'

interface CommandItem {
  id: string
  type: 'node' | 'note' | 'action' | 'navigation'
  title: string
  subtitle?: string
  icon: React.ReactNode
  onSelect: () => void
}

interface CommandPaletteProps {
  onClose?: () => void
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [nodes, setNodes] = useState<LoopOSNode[]>([])
  const [notes, setNotes] = useState<LoopOSNote[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { user } = useUser()
  const supabase = createClient()

  // ⌘K to open/close
  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    setIsOpen((prev) => !prev)
  })

  // Escape to close
  useHotkeys(
    'escape',
    () => {
      if (isOpen) {
        setIsOpen(false)
      }
    },
    { enableOnFormTags: ['INPUT'] }
  )

  // Arrow navigation
  useHotkeys(
    'down',
    (e) => {
      if (isOpen) {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      }
    },
    { enableOnFormTags: ['INPUT'] }
  )

  useHotkeys(
    'up',
    (e) => {
      if (isOpen) {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }
    },
    { enableOnFormTags: ['INPUT'] }
  )

  // Enter to select
  useHotkeys(
    'enter',
    (e) => {
      if (isOpen && filteredCommands[selectedIndex]) {
        e.preventDefault()
        filteredCommands[selectedIndex].onSelect()
        closeCommand()
      }
    },
    { enableOnFormTags: ['INPUT'] }
  )

  // Fetch data when opened
  useEffect(() => {
    if (isOpen && user) {
      fetchData()
    }
  }, [isOpen, user])

  async function fetchData() {
    if (!user) return

    const [nodesRes, notesRes] = await Promise.all([
      supabase.from('loopos_nodes').select('*').eq('user_id', user.id),
      supabase.from('loopos_notes').select('*').eq('user_id', user.id),
    ])

    if (nodesRes.data) setNodes(nodesRes.data as LoopOSNode[])
    if (notesRes.data) setNotes(notesRes.data as LoopOSNote[])
  }

  function closeCommand() {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
    onClose?.()
  }

  // Build command items
  const commands = useMemo((): CommandItem[] => {
    const items: CommandItem[] = []

    // Actions
    items.push({
      id: 'create-node',
      type: 'action',
      title: 'Create new node',
      icon: <Circle className="w-4 h-4" />,
      onSelect: () => {
        // TODO: Open create node modal
        console.log('Create node')
      },
    })

    items.push({
      id: 'create-note',
      type: 'action',
      title: 'Create new note',
      icon: <FileText className="w-4 h-4" />,
      onSelect: () => {
        // TODO: Open create note modal
        console.log('Create note')
      },
    })

    // Navigation
    items.push({
      id: 'nav-canvas',
      type: 'navigation',
      title: 'Go to Canvas',
      icon: <ArrowRight className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = '/app/canvas'
      },
    })

    items.push({
      id: 'nav-notes',
      type: 'navigation',
      title: 'Go to Notes',
      icon: <ArrowRight className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = '/app/notes'
      },
    })

    items.push({
      id: 'nav-insights',
      type: 'navigation',
      title: 'Go to Loop Health',
      icon: <ArrowRight className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = '/app/insights'
      },
    })

    // Nodes
    for (const node of nodes) {
      items.push({
        id: `node-${node.id}`,
        type: 'node',
        title: node.title,
        subtitle: `${node.node_type} • ${node.status}`,
        icon: <Circle className="w-4 h-4" />,
        onSelect: () => {
          window.location.href = `/app/nodes/${node.id}`
        },
      })
    }

    // Notes
    for (const note of notes) {
      items.push({
        id: `note-${note.id}`,
        type: 'note',
        title: note.title,
        subtitle: note.tags.join(', '),
        icon: <FileText className="w-4 h-4" />,
        onSelect: () => {
          window.location.href = `/app/notes/${note.id}`
        },
      })
    }

    return items
  }, [nodes, notes])

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query) return commands

    const lowerQuery = query.toLowerCase()

    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery)
      const subtitleMatch = cmd.subtitle?.toLowerCase().includes(lowerQuery)
      return titleMatch || subtitleMatch
    })
  }, [commands, query])

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={closeCommand}
      />

      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-matte-black border border-slate-cyan/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-cyan/20">
            <Search className="w-5 h-5 text-slate-cyan" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes, notes, or actions..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-black/50 border border-slate-cyan/20 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="p-2">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.onSelect}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-slate-cyan/20 border border-slate-cyan/40'
                        : 'hover:bg-slate-cyan/10'
                    }`}
                  >
                    <div className="text-slate-cyan">{cmd.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-xs text-gray-400 truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {cmd.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-cyan/20 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-black/50 border border-slate-cyan/20 rounded">
                  ↑↓
                </kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-black/50 border border-slate-cyan/20 rounded">
                  ↵
                </kbd>{' '}
                Select
              </span>
            </div>
            <span>{filteredCommands.length} results</span>
          </div>
        </div>
      </div>
    </>
  )
}
