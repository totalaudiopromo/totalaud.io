'use client'

import { motion, type MotionValue } from 'framer-motion'
import Link from 'next/link'
import { MagneticButton } from './MagneticButton'
import { IDEA_CARDS, IDEA_FILTERS, MOCKUP_MODES } from './landingData'

interface LandingHeroProps {
  heroOpacity: MotionValue<number>
  heroY: MotionValue<number>
  heroScale: MotionValue<number>
  mockupRotateX: MotionValue<number>
  mockupBoxShadow: MotionValue<string>
  mockupY: MotionValue<number>
}

export function LandingHero({
  heroOpacity,
  heroY,
  heroScale,
  mockupRotateX,
  mockupBoxShadow,
  mockupY,
}: LandingHeroProps) {
  return (
    <motion.section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        position: 'relative',
        opacity: heroOpacity,
        y: heroY,
        scale: heroScale,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(58, 169, 190, 0.1)',
          border: '1px solid rgba(58, 169, 190, 0.2)',
          borderRadius: '100px',
          marginBottom: '48px',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#3AA9BE',
            boxShadow: '0 0 10px rgba(58, 169, 190, 0.8)',
          }}
        />
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#3AA9BE',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          For independent artists
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          fontSize: 'clamp(40px, 8vw, 90px)',
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          textAlign: 'center',
          marginBottom: '32px',
          maxWidth: '900px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Your music
        <br />
        <span
          style={{
            background: 'linear-gradient(135deg, #3AA9BE 0%, #56BFD4 50%, #3AA9BE 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 4s ease infinite',
          }}
        >
          deserves to be heard
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.85)',
          textAlign: 'center',
          marginBottom: '56px',
          maxWidth: '520px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Scout contacts. Capture ideas. Plan releases. Craft pitches.
        <br />
        One workspace for everything that matters.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <MagneticButton href="/signup">Start Your Workspace</MagneticButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          marginTop: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#3AA9BE',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          marginTop: '64px',
          width: '100%',
          maxWidth: '900px',
          perspective: '1200px',
          y: mockupY,
        }}
      >
        <motion.div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#0F1113',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            rotateX: mockupRotateX,
            boxShadow: mockupBoxShadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(255, 95, 87, 0.8)',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(255, 189, 46, 0.8)',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(40, 201, 64, 0.8)',
                }}
              />
            </div>
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              totalaud.io/workspace
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              height: 48,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(15, 17, 19, 0.95)',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#3AA9BE',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              totalaud
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {MOCKUP_MODES.map((mode, i) => (
                <div
                  key={mode}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: i === 0 ? 500 : 400,
                    color: i === 0 ? '#3AA9BE' : 'rgba(255, 255, 255, 0.85)',
                    background: i === 0 ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    position: 'relative',
                  }}
                >
                  {mode}
                  {i === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 2,
                        background: '#3AA9BE',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(58, 169, 190, 0.2)',
                border: '1px solid rgba(58, 169, 190, 0.3)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="5" r="4" />
                <path d="M8 8l3 3" />
              </svg>
              Search ideas...
            </div>

            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              {IDEA_FILTERS.map((tab) => (
                <div
                  key={tab.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: tab.active ? '#F7F8F9' : tab.colour || 'rgba(255, 255, 255, 0.85)',
                    background: tab.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {tab.colour && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: tab.colour,
                      }}
                    />
                  )}
                  {tab.label}
                  <span style={{ opacity: 0.5 }}>{tab.count}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '2px',
                padding: '2px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  background: 'rgba(58, 169, 190, 0.15)',
                }}
              >
                <svg width="10" height="10" fill="#3AA9BE">
                  <rect x="0" y="0" width="4" height="4" />
                  <rect x="6" y="0" width="4" height="4" />
                  <rect x="0" y="6" width="4" height="4" />
                  <rect x="6" y="6" width="4" height="4" />
                </svg>
              </div>
              <div style={{ padding: '4px 6px' }}>
                <svg width="10" height="10" fill="rgba(255,255,255,0.8)">
                  <rect x="0" y="0" width="10" height="2" />
                  <rect x="0" y="4" width="10" height="2" />
                  <rect x="0" y="8" width="10" height="2" />
                </svg>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              minHeight: '260px',
              background:
                'linear-gradient(135deg, rgba(15, 17, 19, 1) 0%, rgba(18, 20, 23, 1) 100%)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                  `,
                backgroundSize: '40px 40px',
              }}
            />

            {IDEA_CARDS.map((card, i) => (
              <motion.div
                key={`${card.tag}-${card.x}-${card.y}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.1, duration: 0.3 }}
                style={{
                  position: 'absolute',
                  left: card.x,
                  top: card.y,
                  width: 160,
                  padding: '12px',
                  background: `linear-gradient(135deg, ${card.colour}08 0%, ${card.colour}04 100%)`,
                  border: `1px solid ${card.colour}40`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px ${card.colour}15`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '6px',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: card.colour,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 500,
                      color: card.colour,
                      textTransform: 'capitalize',
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
                {card.content}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
