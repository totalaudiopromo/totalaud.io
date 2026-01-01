/**
 * Settings Page
 * Phase 9: MVP Polish
 *
 * User settings and preferences for totalaud.io
 */

'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { AccountSection } from './components/AccountSection'
import { DangerZoneSection } from './components/DangerZoneSection'
import { GuestSettingsFallback } from './components/GuestSettingsFallback'
import { PreferencesSection } from './components/PreferencesSection'
import { SessionSection } from './components/SessionSection'
import { SettingsHeader } from './components/SettingsHeader'
import { SubscriptionSection } from './components/SubscriptionSection'

export default function SettingsPage() {
  const { user, isGuest, displayName, signOut } = useAuth()
  const { tier, status, isSubscribed, openPortal, loading: subLoading } = useSubscription()

  if (isGuest) {
    return <GuestSettingsFallback />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
      }}
    >
      <SettingsHeader />

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

          <AccountSection userEmail={user?.email} displayName={displayName} />
          <SubscriptionSection
            tier={tier}
            status={status}
            isSubscribed={isSubscribed}
            openPortal={openPortal}
            loading={subLoading}
          />
          <PreferencesSection />
          <SessionSection onSignOut={signOut} />
          <DangerZoneSection onSignOut={signOut} />
        </motion.div>
      </main>
    </div>
  )
}
