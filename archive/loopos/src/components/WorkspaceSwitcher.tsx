'use client'

import { useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      await createWorkspace(name, slug)
      toast.success('Workspace created!')
      setShowCreate(false)
      setName('')
      setSlug('')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  if (!currentWorkspace) {
    return (
      <div className="px-4 py-2 bg-background border border-border rounded-lg">
        <p className="text-sm text-foreground/60">No workspace</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-centre gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:border-accent transition-colours"
      >
        <span className="font-medium">{currentWorkspace.name}</span>
        <ChevronDown className="w-4 h-4 text-foreground/60" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-background border border-border rounded-lg shadow-xl z-50">
          {!showCreate ? (
            <>
              <div className="p-2 border-b border-border">
                <p className="text-xs text-foreground/60 px-2 py-1">Your workspaces</p>
              </div>

              <div className="p-2 max-h-64 overflow-y-auto">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      switchWorkspace(workspace.id)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-centre justify-between px-3 py-2 rounded hover:bg-accent/10 transition-colours"
                  >
                    <span className="font-medium">{workspace.name}</span>
                    {workspace.id === currentWorkspace.id && (
                      <Check className="w-4 h-4 text-accent" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-border">
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-centre gap-2 px-3 py-2 rounded hover:bg-accent/10 transition-colours"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create workspace</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4">
              <h3 className="font-semibold mb-4">Create workspace</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }}
                    placeholder="My Campaign"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-campaign"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false)
                      setName('')
                      setSlug('')
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded hover:bg-accent/10 transition-colours"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-3 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
