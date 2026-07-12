'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { transition } from '@/lib/motion'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'
import { CreateLabelModal } from './CreateLabelModal'

export function LabelSwitcher() {
  const labels = useLabelStore((s) => s.labels)
  const activeLabel = useLabelStore(selectActiveLabel)
  const setActiveLabel = useLabelStore((s) => s.setActiveLabel)
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-ta-sm border border-ta-border bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-120 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ta-white truncate">
            {activeLabel?.name ?? 'Choose a label'}
          </span>
          <span className="block text-xs text-ta-grey capitalize">
            {activeLabel?.member_role ?? 'no label yet'}
          </span>
        </span>
        <ChevronUpDownIcon className="h-4 w-4 text-ta-grey shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition.fast}
            className="absolute left-0 right-0 mt-1 z-30 rounded-ta-sm border border-ta-border bg-ta-panel shadow-ta-lg overflow-hidden"
          >
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => {
                  setActiveLabel(label.id)
                  setOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors duration-120 hover:bg-white/[0.05] ${
                  label.id === activeLabel?.id ? 'text-ta-cyan' : 'text-ta-white'
                }`}
              >
                {label.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setShowCreate(true)
              }}
              className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-ta-grey hover:bg-white/[0.05] hover:text-ta-white transition-colors duration-120 border-t border-ta-border"
            >
              <PlusIcon className="h-4 w-4" />
              New label
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateLabelModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
