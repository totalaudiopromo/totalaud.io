/**
 * Settings Page
 * Phase 9: MVP Polish
 *
 * User settings and preferences for totalaud.io
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { user, isAuthenticated, isGuest, displayName, signOut } = useAuth()
  const [saving, setSaving] = useState(false)

  // Profile editing state
  const [editingName, setEditingName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(displayName || '')
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Handle display name update
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

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
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
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      // Call API to delete account (server-side with service role)
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      // Sign out and redirect
      await signOut()
      window.location.href = '/?deleted=true'
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  // Redirect hint for guests
  if (isGuest) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0F1113',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 12,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Sign in to access settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: 24,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              lineHeight: 1.6,
            }}
          >
            Create an account or sign in to manage your preferences and account settings.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#0F1113',
                backgroundColor: '#3AA9BE',
                border: 'none',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Sign up free
            </Link>
          </div>
          <Link
            href="/workspace"
            style={{
              display: 'inline-block',
              marginTop: 24,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            ← Back to workspace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          href="/workspace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: 16 }}>←</span>
          Back to workspace
        </Link>
        <Link href="/">
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={32}
            height={32}
            style={{ opacity: 0.9 }}
          />
        </Link>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 8,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 40,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Manage your account and preferences
          </p>

          {/* Account Section */}
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
              {/* Email (read-only) */}
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
                  {user?.email || 'Not available'}
                </div>
              </div>

              {/* Display Name (editable) */}
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
                      onChange={(e) => setNewDisplayName(e.target.value)}
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
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                    {nameError && (
                      <span style={{ fontSize: 12, color: '#ef4444' }}>{nameError}</span>
                    )}
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

              {/* Password */}
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
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      ••••••••
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

          {/* Preferences Section */}
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
              Preferences
            </h2>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  textAlign: 'center',
                  padding: '20px 0',
                }}
              >
                More preferences coming soon...
              </p>
            </div>
          </section>

          {/* Session */}
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
              Session
            </h2>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '20px',
              }}
            >
              <button
                onClick={async () => {
                  await signOut()
                  window.location.href = '/'
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Sign out
              </button>
            </div>
          </section>

          {/* Danger Zone - Account Deletion */}
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
                Permanently delete your account and all associated data. This action cannot be
                undone.
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
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
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
                  {deleteError && (
                    <span style={{ fontSize: 12, color: '#ef4444' }}>{deleteError}</span>
                  )}
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Delete account
                </button>
              )}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
