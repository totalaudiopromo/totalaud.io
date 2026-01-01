'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface AccountSectionProps {
  userEmail: string | null | undefined
  displayName: string | null | undefined
}

export function AccountSection({ userEmail, displayName }: AccountSectionProps) {
  const [saving, setSaving] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(displayName || '')
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleUpdateName = async () => {
    if (!newDisplayName.trim()) {
      setNameError('Display name cannot be empty')
      return
    }

    setSaving(true)
    setNameError('')
    setNameSuccess(false)

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.updateUser({
        data: { display_name: newDisplayName.trim() },
      })

      if (error) throw error

      setNameSuccess(true)
      setEditingName(false)
      setTimeout(() => setNameSuccess(false), 3000)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setChangingPassword(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setPasswordSuccess(true)
      setShowPasswordForm(false)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: 16,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Account
      </h2>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 4,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Email
          </label>
          <div
            style={{
              fontSize: 14,
              color: '#F7F8F9',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {userEmail || 'Not available'}
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 4,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Display Name
          </label>
          {editingName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                value={newDisplayName}
                onChange={(event) => setNewDisplayName(event.target.value)}
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  outline: 'none',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
              {nameError && <span style={{ fontSize: 12, color: '#ef4444' }}>{nameError}</span>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleUpdateName}
                  disabled={saving}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#0F1113',
                    backgroundColor: '#3AA9BE',
                    border: 'none',
                    borderRadius: 6,
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewDisplayName(displayName || '')
                    setNameError('')
                  }}
                  style={{
                    padding: '8px 14px',
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: '#F7F8F9',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {displayName || 'Not set'}
              </span>
              <button
                onClick={() => setEditingName(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Edit
              </button>
            </div>
          )}
          {nameSuccess && (
            <span style={{ fontSize: 12, color: '#22c55e', marginTop: 8, display: 'block' }}>
              Display name updated successfully
            </span>
          )}
        </div>

        <div style={{ padding: '16px 20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 4,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Password
          </label>
          {showPasswordForm ? (
            <form
              onSubmit={handleChangePassword}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  outline: 'none',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  outline: 'none',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              />
              {passwordError && (
                <span style={{ fontSize: 12, color: '#ef4444' }}>{passwordError}</span>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#0F1113',
                    backgroundColor: '#3AA9BE',
                    border: 'none',
                    borderRadius: 6,
                    cursor: changingPassword ? 'wait' : 'pointer',
                    opacity: changingPassword ? 0.7 : 1,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  style={{
                    padding: '8px 14px',
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
            </form>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: '#F7F8F9',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
              </span>
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Change
              </button>
            </div>
          )}
          {passwordSuccess && (
            <span style={{ fontSize: 12, color: '#22c55e', marginTop: 8, display: 'block' }}>
              Password changed successfully
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
