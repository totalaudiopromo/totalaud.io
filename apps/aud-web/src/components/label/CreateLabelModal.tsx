'use client'

import { useState, type FormEvent } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import {
  LabelModal,
  fieldInputClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from './ui/LabelModal'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function CreateLabelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createLabel = useLabelStore((s) => s.createLabel)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createLabel(name.trim(), slugify(name), description.trim() || undefined)
      setName('')
      setDescription('')
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <LabelModal open={open} title="New label" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="label-name" className={fieldLabelClass}>
            Label name
          </label>
          <input
            id="label-name"
            className={fieldInputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Night Bus Recordings"
            maxLength={120}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="label-description" className={fieldLabelClass}>
            Description (optional)
          </label>
          <textarea
            id="label-description"
            className={fieldInputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your label stand for?"
            maxLength={500}
          />
        </div>
        {error && <p className="text-xs text-ta-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass} disabled={saving || !name.trim()}>
            {saving ? 'Creating…' : 'Create label'}
          </button>
        </div>
      </form>
    </LabelModal>
  )
}
