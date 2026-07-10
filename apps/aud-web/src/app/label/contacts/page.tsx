'use client'

/**
 * Label OS — Contacts: the label's promo relationships.
 */

import { useEffect, useMemo, useState } from 'react'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ContactFormModal } from '@/components/label/contacts/ContactFormModal'
import { fieldInputClass, primaryButtonClass } from '@/components/label/ui/LabelModal'
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  type ContactRow,
  type ContactType,
} from '@/lib/label/types'

export default function ContactsPage() {
  const activeLabel = useLabelStore(selectActiveLabel)
  const contacts = useLabelStore((s) => s.contacts)
  const isLoading = useLabelStore((s) => s.isLoadingContacts)
  const loadContacts = useLabelStore((s) => s.loadContacts)
  const deleteContact = useLabelStore((s) => s.deleteContact)

  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContactRow | null>(null)

  useEffect(() => {
    if (activeLabel) void loadContacts(activeLabel.id)
  }, [activeLabel, loadContacts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.outlet ?? '').toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [contacts, typeFilter, search])

  if (!activeLabel) return null

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ta-white">Contacts</h1>
          <p className="text-sm text-ta-grey mt-1">
            Relationships are the label&apos;s quiet asset. Keep them warm.
          </p>
        </div>
        <button
          type="button"
          className={`${primaryButtonClass} flex items-center gap-1.5`}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Add contact
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <input
          className={`${fieldInputClass} max-w-xs`}
          placeholder="Search name, outlet or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(['all', ...CONTACT_TYPES] as (ContactType | 'all')[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-ta-pill text-xs transition-colors duration-120 ${
              typeFilter === t
                ? 'bg-ta-cyan/15 text-ta-cyan'
                : 'text-ta-grey hover:text-ta-white hover:bg-white/[0.05]'
            }`}
          >
            {t === 'all' ? 'All' : CONTACT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {isLoading && contacts.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/[0.03] rounded-ta animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={contacts.length === 0 ? 'No contacts yet' : 'No matches'}
          description={
            contacts.length === 0
              ? 'Add the radio, playlist and press people you work with.'
              : 'Try a different search or filter.'
          }
          variant="large"
        />
      ) : (
        <div className="rounded-ta border border-ta-border bg-ta-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ta-muted border-b border-ta-border">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Outlet</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Tags</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Last contacted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-ta-border last:border-b-0 hover:bg-white/[0.02] group"
                >
                  <td className="px-5 py-3 text-ta-white">{contact.name}</td>
                  <td className="px-5 py-3 text-ta-grey hidden sm:table-cell">
                    {contact.outlet ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    {contact.type ? (
                      <span className="px-2 py-0.5 rounded-ta-pill bg-white/[0.05] text-[11px] text-ta-grey">
                        {CONTACT_TYPE_LABELS[contact.type]}
                      </span>
                    ) : (
                      <span className="text-ta-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ta-grey hidden md:table-cell">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-ta-cyan transition-colors duration-120"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-ta-pill bg-white/[0.04] text-[10px] text-ta-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ta-grey hidden md:table-cell">
                    {contact.last_contacted
                      ? new Date(`${contact.last_contacted}T00:00:00`).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-120">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(contact)
                          setModalOpen(true)
                        }}
                        className="text-ta-muted hover:text-ta-white"
                        aria-label={`Edit ${contact.name}`}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${contact.name}?`)) {
                            void deleteContact(contact.id)
                          }
                        }}
                        className="text-ta-muted hover:text-ta-error"
                        aria-label={`Delete ${contact.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ContactFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelId={activeLabel.id}
        contact={editing}
      />
    </div>
  )
}
