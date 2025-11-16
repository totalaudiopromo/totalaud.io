'use client'

/**
 * Loop Editor Modal
 * Edit loop configuration, test execution, enable/disable
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoops } from '@totalaud/os-state/campaign'
import type { AgentLoop, LoopInterval, LoopType, LoopStatus } from '@totalaud/os-state/campaign'
import { X, Play, Save, Trash2, AlertCircle } from 'lucide-react'

interface LoopEditorModalProps {
  loop: AgentLoop | null
  isOpen: boolean
  onClose: () => void
  onTestRun?: (loop: AgentLoop) => Promise<void>
  onDelete?: (loopId: string) => void
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const LOOP_TYPES: LoopType[] = ['improvement', 'exploration', 'healthcheck', 'emotion', 'prediction']
const LOOP_INTERVALS: LoopInterval[] = ['5m', '15m', '1h', 'daily']

const INTERVAL_LABELS: Record<LoopInterval, string> = {
  '5m': '5 minutes',
  '15m': '15 minutes',
  '1h': '1 hour',
  'daily': 'Daily',
}

export function LoopEditorModal({
  loop,
  isOpen,
  onClose,
  onTestRun,
  onDelete,
}: LoopEditorModalProps) {
  const { updateLoop } = useLoops()

  const [interval, setInterval] = useState<LoopInterval>('15m')
  const [loopType, setLoopType] = useState<LoopType>('improvement')
  const [status, setStatus] = useState<LoopStatus>('idle')
  const [payload, setPayload] = useState<string>('{}')
  const [payloadError, setPayloadError] = useState<string | null>(null)
  const [isTestRunning, setIsTestRunning] = useState(false)

  // Initialize form when loop changes
  useEffect(() => {
    if (loop) {
      setInterval(loop.interval)
      setLoopType(loop.loopType)
      setStatus(loop.status)
      setPayload(JSON.stringify(loop.payload || {}, null, 2))
      setPayloadError(null)
    }
  }, [loop])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const validatePayload = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString)
      setPayloadError(null)
      return true
    } catch (error) {
      setPayloadError(error instanceof Error ? error.message : 'Invalid JSON')
      return false
    }
  }

  const handlePayloadChange = (value: string) => {
    setPayload(value)
    if (value.trim()) {
      validatePayload(value)
    }
  }

  const handleSave = () => {
    if (!loop) return

    // Validate payload before saving
    if (!validatePayload(payload)) {
      return
    }

    const updates: Partial<AgentLoop> = {
      interval,
      loopType,
      status,
      payload: JSON.parse(payload),
    }

    updateLoop(loop.id, updates)
    onClose()
  }

  const handleTestRun = async () => {
    if (!loop || !onTestRun) return

    setIsTestRunning(true)
    try {
      await onTestRun({
        ...loop,
        interval,
        loopType,
        payload: JSON.parse(payload),
      })
    } catch (error) {
      console.error('Test run failed:', error)
    } finally {
      setIsTestRunning(false)
    }
  }

  const handleDelete = () => {
    if (!loop || !onDelete) return

    if (confirm(`Are you sure you want to delete this ${loop.loopType} loop?`)) {
      onDelete(loop.id)
      onClose()
    }
  }

  const handleToggleEnabled = () => {
    setStatus((prev) => (prev === 'disabled' ? 'idle' : 'disabled'))
  }

  if (!isOpen || !loop) return null

  const agentColour = AGENT_COLOURS[loop.agent] || '#6B7280'
  const isDisabled = status === 'disabled'

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-centre justify-centre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loop-editor-title"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close modal"
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-2xl rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderTop: `4px solid ${agentColour}`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex items-start gap-3">
              {/* Agent Indicator */}
              <div
                className="flex h-10 w-10 items-centre justify-centre rounded-full font-mono text-sm font-bold uppercase"
                style={{
                  backgroundColor: `${agentColour}20`,
                  color: agentColour,
                }}
              >
                {loop.agent.slice(0, 2)}
              </div>

              {/* Title */}
              <div>
                <h3
                  id="loop-editor-title"
                  className="font-mono font-semibold text-[var(--flowcore-colour-fg)]"
                >
                  Edit {loop.agent.charAt(0).toUpperCase() + loop.agent.slice(1)} Loop
                </h3>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-[var(--flowcore-colour-fg)]/50">
                  {loop.loopType} • {INTERVAL_LABELS[loop.interval]}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded p-1 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
              aria-label="Close loop editor modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4 p-6">
            {/* Loop Type */}
            <div>
              <label className="mb-2 block font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                Loop Type
              </label>
              <select
                value={loopType}
                onChange={(e) => setLoopType(e.target.value as LoopType)}
                className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] outline-none focus:border-[var(--flowcore-colour-accent)]"
              >
                {LOOP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Interval */}
            <div>
              <label className="mb-2 block font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                Interval
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as LoopInterval)}
                className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] outline-none focus:border-[var(--flowcore-colour-accent)]"
              >
                {LOOP_INTERVALS.map((int) => (
                  <option key={int} value={int}>
                    {INTERVAL_LABELS[int]}
                  </option>
                ))}
              </select>
            </div>

            {/* Payload */}
            <div>
              <label className="mb-2 block font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                Payload (JSON)
              </label>
              <textarea
                value={payload}
                onChange={(e) => handlePayloadChange(e.target.value)}
                className={`w-full rounded border ${
                  payloadError
                    ? 'border-[var(--flowcore-colour-error)]'
                    : 'border-[var(--flowcore-colour-border)]'
                } bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none focus:border-[var(--flowcore-colour-accent)]`}
                rows={6}
                placeholder='{"key": "value"}'
              />
              {payloadError && (
                <div className="mt-2 flex items-start gap-2 rounded border border-[var(--flowcore-colour-error)] bg-[var(--flowcore-colour-error)]/10 p-2">
                  <AlertCircle size={14} className="mt-0.5 text-[var(--flowcore-colour-error)]" />
                  <p className="font-mono text-xs text-[var(--flowcore-colour-error)]">
                    {payloadError}
                  </p>
                </div>
              )}
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-centre justify-between rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] p-3">
              <div>
                <p className="font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]">
                  Loop Status
                </p>
                <p className="mt-0.5 font-mono text-xs text-[var(--flowcore-colour-fg)]/60">
                  {isDisabled ? 'Loop is disabled' : 'Loop is active'}
                </p>
              </div>

              <button
                onClick={handleToggleEnabled}
                className={`rounded px-4 py-2 font-mono text-xs font-semibold uppercase transition-all ${
                  isDisabled
                    ? 'bg-[var(--flowcore-colour-fg)]/10 text-[var(--flowcore-colour-fg)]/70 hover:bg-[var(--flowcore-colour-fg)]/20'
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isDisabled ? undefined : agentColour,
                }}
              >
                {isDisabled ? 'Enable' : 'Disable'}
              </button>
            </div>

            {/* Info */}
            <div className="rounded border border-[var(--flowcore-colour-border)]/50 bg-[var(--flowcore-overlay-soft)] p-3">
              <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/60">
                <strong>Last run:</strong> {loop.lastRun ? new Date(loop.lastRun).toLocaleString() : 'Never'}
                <br />
                <strong>Next run:</strong> {!isDisabled && loop.nextRun ? new Date(loop.nextRun).toLocaleString() : 'N/A'}
                <br />
                <strong>Created:</strong> {new Date(loop.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-centre justify-between border-t border-[var(--flowcore-colour-border)] p-4">
            <div className="flex gap-2">
              {/* Test Run */}
              <motion.button
                onClick={handleTestRun}
                disabled={isTestRunning || !!payloadError}
                className="flex items-centre gap-2 rounded border border-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-[var(--flowcore-colour-accent)] transition-all hover:bg-[var(--flowcore-colour-accent)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isTestRunning || payloadError ? 1 : 1.02 }}
                whileTap={{ scale: isTestRunning || payloadError ? 1 : 0.98 }}
              >
                <Play size={14} />
                {isTestRunning ? 'Running...' : 'Test Run'}
              </motion.button>

              {/* Delete */}
              <motion.button
                onClick={handleDelete}
                className="flex items-centre gap-2 rounded border border-[var(--flowcore-colour-error)] px-4 py-2 font-mono text-sm font-semibold text-[var(--flowcore-colour-error)] transition-all hover:bg-[var(--flowcore-colour-error)]/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={14} />
                Delete
              </motion.button>
            </div>

            <div className="flex gap-2">
              {/* Cancel */}
              <button
                onClick={onClose}
                className="rounded px-4 py-2 font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]/70 transition-all hover:bg-[var(--flowcore-colour-fg)]/10"
              >
                Cancel
              </button>

              {/* Save */}
              <motion.button
                onClick={handleSave}
                disabled={!!payloadError}
                className="flex items-centre gap-2 rounded px-4 py-2 font-mono text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: agentColour }}
                whileHover={{ scale: payloadError ? 1 : 1.02 }}
                whileTap={{ scale: payloadError ? 1 : 0.98 }}
              >
                <Save size={14} />
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
