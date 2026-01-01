'use client'

import { useState } from 'react'

interface DangerZoneSectionProps {
  onSignOut: () => Promise<void>
}

export function DangerZoneSection({ onSignOut }: DangerZoneSectionProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      await onSignOut()
      window.location.href = '/?deleted=true'
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <section>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#ef4444',
          marginBottom: 16,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Danger Zone
      </h2>
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 12,
          padding: '20px',
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: 16,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.5,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: '#ef4444',
                fontWeight: 500,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Type DELETE to confirm account deletion:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="DELETE"
              style={{
                padding: '10px 12px',
                fontSize: 14,
                color: '#F7F8F9',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 6,
                outline: 'none',
                fontFamily: 'var(--font-geist-mono), monospace',
                maxWidth: 200,
              }}
            />
            {deleteError && <span style={{ fontSize: 12, color: '#ef4444' }}>{deleteError}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#fff',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: 6,
                  cursor: deleting ? 'wait' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
              event.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
              event.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
            }}
          >
            Delete account
          </button>
        )}
      </div>
    </section>
  )
}
