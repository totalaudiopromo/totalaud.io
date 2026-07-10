'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  type ContactRow,
  type ContactType,
} from '@/lib/label/types'
import {
  LabelModal,
  fieldInputClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../ui/LabelModal'

interface ContactFormModalProps {
  open: boolean
  onClose: () => void
  labelId: string
  contact?: ContactRow | null
}

export function ContactFormModal({ open, onClose, labelId, contact }: ContactFormModalProps) {
  const createContact = useLabelStore((s) => s.createContact)
  const updateContact = useLabelStore((s) => s.updateContact)

  const [name, setName] = useState('')
  const [outlet, setOutlet] = useState('')
  const [type, setType] = useState<ContactType | ''>('')
  const [email, setEmail] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? '')
      setOutlet(contact?.outlet ?? '')
      setType(contact?.type ?? '')
      setEmail(contact?.email ?? '')
      setTags(contact?.tags.join(', ') ?? '')
      setNotes(contact?.notes ?? '')
      setError(null)
    }
  }, [open, contact])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    const payload = {
      name: name.trim(),
      outlet: outlet.trim() || null,
      type: type || null,
      email: email.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 15),
      notes: notes.trim() || null,
    }

    try {
      if (contact) {
        await updateContact(contact.id, payload)
      } else {
        await createContact({ label_id: labelId, ...payload })
      }
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <LabelModal open={open} title={contact ? 'Edit contact' : 'Add contact'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="contact-name" className={fieldLabelClass}>
              Name
            </label>
            <input
              id="contact-name"
              className={fieldInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="contact-outlet" className={fieldLabelClass}>
              Outlet
            </label>
            <input
              id="contact-outlet"
              className={fieldInputClass}
              value={outlet}
              onChange={(e) => setOutlet(e.target.value)}
              placeholder="e.g. BBC 6 Music"
              maxLength={160}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="contact-type" className={fieldLabelClass}>
              Type
            </label>
            <select
              id="contact-type"
              className={fieldInputClass}
              value={type}
              onChange={(e) => setType(e.target.value as ContactType | '')}
            >
              <option value="">—</option>
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CONTACT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact-email" className={fieldLabelClass}>
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className={fieldInputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-tags" className={fieldLabelClass}>
            Tags (comma separated)
          </label>
          <input
            id="contact-tags"
            className={fieldInputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. electronic, replies fast"
          />
        </div>
        <div>
          <label htmlFor="contact-notes" className={fieldLabelClass}>
            Notes
          </label>
          <textarea
            id="contact-notes"
            className={fieldInputClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={5000}
          />
        </div>
        {error && <p className="text-xs text-ta-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : contact ? 'Save changes' : 'Add contact'}
          </button>
        </div>
      </form>
    </LabelModal>
  )
}
