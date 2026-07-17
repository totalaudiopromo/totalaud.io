/**
 * PerspectivesPanel
 *
 * Finishing notes from four perspectives (producer, mix, listener,
 * industry). Shown in the results stage alongside the analysis metrics.
 *
 * Flow: a small optional context form ("tell us about the track") →
 * calm skeleton loading while the notes are written → tabbed perspectives
 * with observation / worth-considering pairs, plus a small "Before release"
 * checklist when there is one.
 *
 * Only the measurements and the artist's own words are sent — the audio
 * itself never leaves the device.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinishStore } from '@/stores/useFinishStore'
import { PERSPECTIVE_IDS, type PerspectiveId } from '@/lib/finish/perspectives'

// Normal motion token: pane transitions
const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

const PERSPECTIVE_LABELS: Record<PerspectiveId, string> = {
  producer: 'Producer',
  mix: 'Mix',
  listener: 'Listener',
  industry: 'Industry',
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const inputClasses =
    'w-full bg-ta-panel border border-ta-white/[0.08] rounded-ta-sm px-3 py-2 text-xs text-ta-white/80 placeholder:text-ta-white/25 focus:border-ta-cyan/40 focus:outline-none transition-colors'

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-ta-white/40">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  )
}

function ContextForm() {
  const trackContext = useFinishStore((s) => s.trackContext)
  const setTrackContext = useFinishStore((s) => s.setTrackContext)
  const generatePerspectives = useFinishStore((s) => s.generatePerspectives)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={NORMAL_TRANSITION}
      className="space-y-4"
    >
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
          Finishing notes
        </h4>
        <p className="text-xs text-ta-white/40 leading-relaxed pt-1">
          Tell us about the track — all optional — and get a second opinion from four perspectives.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Track name"
          value={trackContext.trackName ?? ''}
          onChange={(v) => setTrackContext({ trackName: v })}
          placeholder="e.g. Night Bus"
        />
        <Field
          label="Genre"
          value={trackContext.genre ?? ''}
          onChange={(v) => setTrackContext({ genre: v })}
          placeholder="e.g. melodic techno"
        />
      </div>

      <Field
        label="What do you want from this release?"
        value={trackContext.intent ?? ''}
        onChange={(v) => setTrackContext({ intent: v })}
        placeholder="e.g. playlist support, a calling card for bookings…"
        multiline
      />

      <Field
        label="What are you unsure about?"
        value={trackContext.unsureAbout ?? ''}
        onChange={(v) => setTrackContext({ unsureAbout: v })}
        placeholder="e.g. whether the low end translates, if the intro is too long…"
        multiline
      />

      <button
        onClick={generatePerspectives}
        className="w-full sm:w-auto px-4 py-2.5 rounded-ta-sm bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
      >
        Get finishing notes
      </button>
    </motion.div>
  )
}

function SkeletonLine({ width, delay }: { width: string; delay: number }) {
  return (
    <motion.div
      className="h-3 rounded-ta-sm bg-ta-white/[0.06]"
      style={{ width }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

function GeneratingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={NORMAL_TRANSITION}
      className="space-y-4"
    >
      <p className="text-xs text-ta-white/50">Reading the numbers…</p>
      <div className="space-y-2.5">
        <SkeletonLine width="85%" delay={0} />
        <SkeletonLine width="70%" delay={0.15} />
        <SkeletonLine width="90%" delay={0.3} />
        <SkeletonLine width="60%" delay={0.45} />
        <SkeletonLine width="78%" delay={0.6} />
      </div>
    </motion.div>
  )
}

function ErrorState() {
  const notesError = useFinishStore((s) => s.notesError)
  const generatePerspectives = useFinishStore((s) => s.generatePerspectives)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={NORMAL_TRANSITION}
      className="space-y-3"
    >
      <p className="text-xs text-ta-white/50 leading-relaxed">
        {notesError || 'Finishing notes are taking a moment — try again shortly.'}
      </p>
      <button
        onClick={generatePerspectives}
        className="px-4 py-2 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-xs hover:border-ta-white/25 hover:text-ta-white/80 transition-colors"
      >
        Try again
      </button>
    </motion.div>
  )
}

function NotesView() {
  const finishingNotes = useFinishStore((s) => s.finishingNotes)
  const notesLocked = useFinishStore((s) => s.notesLocked)
  const firstAvailable =
    PERSPECTIVE_IDS.find((id) => !notesLocked.includes(id)) ?? ('producer' as PerspectiveId)
  const [activeTab, setActiveTab] = useState<PerspectiveId>(firstAvailable)

  if (!finishingNotes) return null

  const isLocked = (id: PerspectiveId) => notesLocked.includes(id)
  const activePerspective = finishingNotes.perspectives.find((p) => p.perspective === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={NORMAL_TRANSITION}
      className="space-y-4"
    >
      <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
        Finishing notes
      </h4>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Perspectives">
        {PERSPECTIVE_IDS.map((id) => {
          const isActive = id === activeTab
          const locked = isLocked(id)
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-ta-sm text-xs transition-colors ${
                isActive
                  ? 'bg-ta-cyan/[0.12] text-ta-cyan'
                  : locked
                    ? 'text-ta-white/25 hover:text-ta-white/40'
                    : 'text-ta-white/40 hover:text-ta-white/70'
              }`}
            >
              {PERSPECTIVE_LABELS[id]}
              {locked && <span aria-hidden> ·</span>}
            </button>
          )
        })}
      </div>

      {/* Active perspective */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={NORMAL_TRANSITION}
          className="space-y-3"
          role="tabpanel"
        >
          {isLocked(activeTab) ? (
            <div className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-4 space-y-2">
              <p className="text-xs text-ta-white/70 leading-relaxed">
                The {PERSPECTIVE_LABELS[activeTab].toLowerCase()} perspective is part of the full
                set of finishing notes.
              </p>
              <p className="text-xs text-ta-white/50 leading-relaxed">
                Create a free account to hear from all four perspectives and keep your notes between
                sessions.
              </p>
              <a
                href="/signup"
                className="inline-block px-4 py-2 rounded-ta-sm bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
              >
                Sign up free
              </a>
            </div>
          ) : activePerspective ? (
            <>
              <p className="text-xs text-ta-white/70 leading-relaxed">
                {activePerspective.summary}
              </p>

              <div className="space-y-2">
                {activePerspective.notes.map((note, i) => (
                  <div
                    key={i}
                    className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-3 space-y-1.5"
                  >
                    <p className="text-xs text-ta-white/80 leading-relaxed">{note.observation}</p>
                    <p className="text-xs text-ta-white/50 leading-relaxed">
                      <span className="text-ta-cyan/70">Worth considering:</span>{' '}
                      {note.worth_considering}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-ta-white/40">No notes from this perspective.</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Before release checklist */}
      {finishingNotes.before_release.length > 0 && (
        <div className="space-y-2 pt-2">
          <h5 className="text-[10px] uppercase tracking-wider text-ta-white/40">Before release</h5>
          <ul className="space-y-1.5">
            {finishingNotes.before_release.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ta-white/60">
                <span className="mt-0.5 w-3 h-3 rounded-[3px] border border-ta-white/20 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

export function PerspectivesPanel() {
  const notesStatus = useFinishStore((s) => s.notesStatus)

  return (
    <div>
      <AnimatePresence mode="wait">
        {notesStatus === 'idle' && (
          <motion.div key="form" exit={{ opacity: 0 }} transition={NORMAL_TRANSITION}>
            <ContextForm />
          </motion.div>
        )}
        {notesStatus === 'generating' && (
          <motion.div key="generating" exit={{ opacity: 0 }} transition={NORMAL_TRANSITION}>
            <GeneratingState />
          </motion.div>
        )}
        {notesStatus === 'error' && (
          <motion.div key="error" exit={{ opacity: 0 }} transition={NORMAL_TRANSITION}>
            <ErrorState />
          </motion.div>
        )}
        {notesStatus === 'ready' && (
          <motion.div key="ready" exit={{ opacity: 0 }} transition={NORMAL_TRANSITION}>
            <NotesView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
