'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TIER_DISPLAY_NAMES, TIER_PRICES } from '../constants'

interface SubscriptionSectionProps {
  tier: string | null
  status: string | null
  isSubscribed: boolean
  openPortal: () => Promise<void>
  loading: boolean
}

export function SubscriptionSection({
  tier,
  status,
  isSubscribed,
  openPortal,
  loading,
}: SubscriptionSectionProps) {
  const [portalLoading, setPortalLoading] = useState(false)

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
        Subscription
      </h2>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 13,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Loading subscription...
          </div>
        ) : isSubscribed && tier ? (
          <>
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
                Current Plan
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#3AA9BE',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {TIER_DISPLAY_NAMES[tier] || tier}
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {TIER_PRICES[tier] || ''}
                  </span>
                </div>
                <span
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 500,
                    color: status === 'active' ? '#22c55e' : '#f59e0b',
                    backgroundColor:
                      status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 4,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    textTransform: 'capitalize',
                  }}
                >
                  {status || 'Active'}
                </span>
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <button
                onClick={async () => {
                  setPortalLoading(true)
                  try {
                    await openPortal()
                  } catch {
                    // Handle error silently
                  } finally {
                    setPortalLoading(false)
                  }
                }}
                disabled={portalLoading}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  cursor: portalLoading ? 'wait' : 'pointer',
                  opacity: portalLoading ? 0.7 : 1,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(event) => {
                  if (!portalLoading) {
                    event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                    event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {portalLoading ? 'Opening...' : 'Manage Subscription'}
              </button>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Update payment method, view invoices, or cancel your subscription
              </p>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: 16,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              You&apos;re not subscribed yet. Upgrade to unlock all features.
            </p>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                color: '#0F1113',
                backgroundColor: '#3AA9BE',
                border: 'none',
                borderRadius: 6,
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                transition: 'opacity 0.12s ease',
              }}
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
