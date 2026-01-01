/**
 * Threads Panel Component
 * Phase 2: Side panel for managing Signal Threads
 *
 * Features:
 * - View all threads
 * - Create new threads
 * - Generate AI narrative
 * - Edit thread properties
 * - Delete threads
 */

'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useSignalThreadStore,
  type SignalThread,
  type ThreadType,
} from '@/stores/useSignalThreadStore'
import { ThreadCreateForm } from './threads/ThreadCreateForm'
import { ThreadDetail } from './threads/ThreadDetail'
import { ThreadListView } from './threads/ThreadListView'
import { ThreadsPanelHeader } from './threads/ThreadsPanelHeader'

interface ThreadsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_THREAD_STATE = {
  title: '',
  threadType: 'narrative' as ThreadType,
  colour: '#3AA9BE',
}

export function ThreadsPanel({ isOpen, onClose }: ThreadsPanelProps) {
  const threads = useSignalThreadStore((state) => state.threads)
  const isLoading = useSignalThreadStore((state) => state.isLoading)
  const isGenerating = useSignalThreadStore((state) => state.isGenerating)
  const createThread = useSignalThreadStore((state) => state.createThread)
  const deleteThread = useSignalThreadStore((state) => state.deleteThread)
  const generateNarrative = useSignalThreadStore((state) => state.generateNarrative)
  const setActiveThread = useSignalThreadStore((state) => state.setActiveThread)
  const activeThreadId = useSignalThreadStore((state) => state.activeThreadId)

  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedThread, setSelectedThread] = useState<SignalThread | null>(null)
  const [newThread, setNewThread] = useState(DEFAULT_THREAD_STATE)

  const handleCreate = useCallback(async () => {
    if (!newThread.title.trim()) return

    await createThread({
      title: newThread.title,
      threadType: newThread.threadType,
      colour: newThread.colour,
    })
    setNewThread(DEFAULT_THREAD_STATE)
    setView('list')
  }, [newThread, createThread])

  const handleSelectThread = useCallback(
    (thread: SignalThread) => {
      setSelectedThread(thread)
      setActiveThread(thread.id)
      setView('detail')
    },
    [setActiveThread]
  )

  const handleGenerateNarrative = useCallback(
    async (threadId: string) => {
      await generateNarrative(threadId)
    },
    [generateNarrative]
  )

  const handleDelete = useCallback(
    async (threadId: string) => {
      await deleteThread(threadId)
      setView('list')
      setSelectedThread(null)
    },
    [deleteThread]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 360,
            backgroundColor: 'rgba(15, 17, 19, 0.98)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
          }}
        >
          <ThreadsPanelHeader
            view={view}
            selectedTitle={selectedThread?.title}
            onBack={() => setView('list')}
            onClose={onClose}
          />

          <div
            style={{
              flex: 1,
              padding: 20,
              overflowY: 'auto',
            }}
          >
            {view === 'list' && (
              <ThreadListView
                threads={threads}
                activeThreadId={activeThreadId}
                isLoading={isLoading}
                onCreateClick={() => setView('create')}
                onSelect={handleSelectThread}
              />
            )}

            {view === 'create' && (
              <ThreadCreateForm
                newThread={newThread}
                setNewThread={setNewThread}
                onCreate={handleCreate}
                isLoading={isLoading}
              />
            )}

            {view === 'detail' && selectedThread && (
              <ThreadDetail
                thread={selectedThread}
                isGenerating={isGenerating}
                onGenerateNarrative={() => handleGenerateNarrative(selectedThread.id)}
                onDelete={() => handleDelete(selectedThread.id)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
