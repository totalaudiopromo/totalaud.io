'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTemplatePacks, getCreativePacks, type DbCreativePack } from '@loopos/db'
import { PackCard } from './PackCard'
import { PackDetailModal } from './PackDetailModal'

interface CreativePacksPanelProps {
  userId?: string
  isOpen: boolean
  onClose: () => void
}

export function CreativePacksPanel({ userId, isOpen, onClose }: CreativePacksPanelProps) {
  const [templates, setTemplates] = useState<DbCreativePack[]>([])
  const [userPacks, setUserPacks] = useState<DbCreativePack[]>([])
  const [selectedPack, setSelectedPack] = useState<DbCreativePack | null>(null)
  const [activeTab, setActiveTab] = useState<'templates' | 'my-packs'>('templates')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPacks()
  }, [userId])

  async function loadPacks() {
    try {
      setLoading(true)
      const [templateData, userData] = await Promise.all([
        getTemplatePacks(),
        userId ? getCreativePacks(userId) : Promise.resolve([]),
      ])
      setTemplates(templateData)
      setUserPacks(userData)
    } catch (error) {
      console.error('Error loading packs:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePackImported() {
    loadPacks()
    setSelectedPack(null)
  }

  const displayPacks = activeTab === 'templates' ? templates : userPacks

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[400px] bg-[#0F1113] border-r border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Creative Packs</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Close panel"
                  >
                    <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'templates'
                        ? 'bg-[#3AA9BE]/20 text-[#3AA9BE]'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => setActiveTab('my-packs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'my-packs'
                        ? 'bg-[#3AA9BE]/20 text-[#3AA9BE]'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    My Packs ({userPacks.length})
                  </button>
                </div>
              </div>

              {/* Pack List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : displayPacks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/40 text-sm">
                      {activeTab === 'templates' ? 'No template packs available' : 'No packs yet'}
                    </p>
                    {activeTab === 'my-packs' && (
                      <p className="text-white/30 text-xs mt-2">Import a template to get started</p>
                    )}
                  </div>
                ) : (
                  displayPacks.map((pack) => (
                    <PackCard key={pack.id} pack={pack} onClick={() => setSelectedPack(pack)} />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pack Detail Modal */}
      {selectedPack && (
        <PackDetailModal
          pack={selectedPack}
          userId={userId}
          onClose={() => setSelectedPack(null)}
          onImported={handlePackImported}
        />
      )}
    </>
  )
}
