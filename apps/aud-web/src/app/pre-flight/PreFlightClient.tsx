'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { phases, items, type Phase } from '@/lib/pre-flight-data'

const STORAGE_KEY = 'totalaud-pre-flight-v1'

type ChecklistState = Record<string, boolean>

export function PreFlightClient({
  totalItems,
  totalHours,
}: {
  totalItems: number
  totalHours: number
}) {
  const [checked, setChecked] = useState<ChecklistState>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setChecked(JSON.parse(raw))
    } catch {
      // ignore corrupt state
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    } catch {
      // ignore quota errors
    }
  }, [checked, hydrated])

  const completed = useMemo(() => items.filter((i) => checked[i.id]).length, [checked])
  const percent = Math.round((completed / totalItems) * 100)

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function reset() {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Reset all checks? Progress saved on this device will be cleared.')
    ) {
      setChecked({})
    }
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <Link href="/" style={brandStyle}>
          ← totalaud.io
        </Link>

        <header style={headerStyle}>
          <p style={eyebrowStyle}>Free release checklist · No signup required</p>
          <h1 style={titleStyle}>The Indie Release Pre-Flight</h1>
          <p style={subtitleStyle}>
            The 47 things to check in the four weeks before you drop. Click each item to mark it
            off. Progress saves on this device. Bring it into a free totalaud.io workspace if you
            want it tied to your release date.
          </p>

          <div style={metaRowStyle}>
            <div style={metaPillStyle}>{totalItems} items</div>
            <div style={metaPillStyle}>~{totalHours} hours of work</div>
            <div style={metaPillStyle}>4 phases</div>
          </div>

          <div style={progressOuterStyle}>
            <div
              style={{
                ...progressInnerStyle,
                width: `${percent}%`,
              }}
            />
          </div>
          <p style={progressLabelStyle}>
            {completed} of {totalItems} done · {percent}%
          </p>
          {completed > 0 && (
            <button onClick={reset} style={resetBtnStyle}>
              Reset progress
            </button>
          )}
        </header>

        {phases.map((phase) => (
          <PhaseBlock key={phase.id} phase={phase.id} checked={checked} toggle={toggle} />
        ))}

        <section style={ctaCardStyle}>
          <h2 style={ctaH2Style}>Save this checklist with your release date</h2>
          <p style={ctaPStyle}>
            A totalaud.io workspace ties each item to the right week before your real release date.
            Free to start. No credit card. The checklist pre-loads, and the items show up at the
            right time on the calendar instead of sitting in a long list.
          </p>
          <Link href="/onboarding" style={ctaButtonStyle}>
            Open a free workspace
          </Link>
          <p style={ctaSecondaryStyle}>
            Already have a workspace?{' '}
            <Link href="/login" style={inlineLinkStyle}>
              Sign in
            </Link>
          </p>
        </section>

        <footer style={footerStyle}>
          <p style={footerP}>
            Written by Chris at totalaud.io. The list is opinionated. Not every release needs every
            item, but every release that skipped something on this list cost the artist time, money,
            or both.
          </p>
          <p style={footerP}>
            Part of the Total Audio family ·{' '}
            <a href="https://spotcheck.cc" style={footerLinkStyle}>
              SpotCheck
            </a>{' '}
            ·{' '}
            <a href="https://newsjack.cc" style={footerLinkStyle}>
              NewsJack
            </a>{' '}
            ·{' '}
            <a href="https://totalaudiopromo.com" style={footerLinkStyle}>
              TAP
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}

function PhaseBlock({
  phase,
  checked,
  toggle,
}: {
  phase: Phase
  checked: ChecklistState
  toggle: (id: string) => void
}) {
  const meta = phases.find((p) => p.id === phase)
  if (!meta) return null
  const phaseItems = items.filter((i) => i.phase === phase)
  const phaseDone = phaseItems.filter((i) => checked[i.id]).length

  return (
    <section style={phaseStyle}>
      <header style={phaseHeaderStyle}>
        <p style={phaseEyebrowStyle}>{meta.weekOffset}</p>
        <h2 style={phaseLabelStyle}>{meta.label}</h2>
        <p style={phaseIntroStyle}>{meta.intro}</p>
        <p style={phaseProgressStyle}>
          {phaseDone} / {phaseItems.length} done in this phase
        </p>
      </header>

      <ul style={listStyle}>
        {phaseItems.map((item) => (
          <li key={item.id} style={itemLi(checked[item.id])}>
            <button
              onClick={() => toggle(item.id)}
              style={itemBtn(checked[item.id])}
              aria-pressed={Boolean(checked[item.id])}
            >
              <span style={checkboxStyle(checked[item.id])} aria-hidden="true">
                {checked[item.id] ? '✓' : ''}
              </span>
              <span style={itemTextStyle}>
                <span style={itemTitleStyle(checked[item.id])}>{item.title}</span>
                <span style={itemWhyStyle}>{item.why}</span>
                <span style={itemEstStyle}>~{item.estMinutes} min</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0A0B0C',
  color: '#fff',
  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  padding: '40px 24px 80px',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '760px',
  margin: '0 auto',
}

const brandStyle: React.CSSProperties = {
  color: '#3AA9BE',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
}

const headerStyle: React.CSSProperties = {
  marginTop: '40px',
  marginBottom: '40px',
  paddingBottom: '32px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const eyebrowStyle: React.CSSProperties = {
  color: '#3AA9BE',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '16px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '44px',
  fontWeight: 800,
  letterSpacing: '-1.5px',
  lineHeight: 1.05,
  margin: 0,
  marginBottom: '20px',
}

const subtitleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '17px',
  lineHeight: 1.6,
  margin: 0,
  marginBottom: '24px',
  maxWidth: '600px',
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '24px',
}

const metaPillStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '999px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.7)',
}

const progressOuterStyle: React.CSSProperties = {
  height: '8px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '8px',
}

const progressInnerStyle: React.CSSProperties = {
  height: '100%',
  background: '#3AA9BE',
  transition: 'width 0.2s ease',
}

const progressLabelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '13px',
  margin: 0,
}

const resetBtnStyle: React.CSSProperties = {
  marginTop: '12px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.5)',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const phaseStyle: React.CSSProperties = {
  marginBottom: '40px',
}

const phaseHeaderStyle: React.CSSProperties = {
  marginBottom: '16px',
}

const phaseEyebrowStyle: React.CSSProperties = {
  color: '#3AA9BE',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
}

const phaseLabelStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  margin: 0,
  marginBottom: '8px',
}

const phaseIntroStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: 0,
  marginBottom: '8px',
  maxWidth: '600px',
}

const phaseProgressStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '12px',
  margin: 0,
  fontFamily: 'var(--font-geist-mono), monospace',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: '8px',
}

function itemLi(done: boolean | undefined): React.CSSProperties {
  return { margin: 0, opacity: done ? 0.55 : 1, transition: 'opacity 0.15s' }
}

function itemBtn(done: boolean | undefined): React.CSSProperties {
  return {
    display: 'flex',
    width: '100%',
    gap: '14px',
    alignItems: 'flex-start',
    background: done ? 'rgba(58,169,190,0.04)' : '#121315',
    border: `1px solid ${done ? 'rgba(58,169,190,0.2)' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: '8px',
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#fff',
    fontFamily: 'inherit',
    transition: 'background 0.15s, border-color 0.15s',
  }
}

function checkboxStyle(done: boolean | undefined): React.CSSProperties {
  return {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: `1.5px solid ${done ? '#3AA9BE' : 'rgba(255,255,255,0.25)'}`,
    background: done ? '#3AA9BE' : 'transparent',
    color: '#0A0B0C',
    fontWeight: 700,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
  }
}

const itemTextStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
}

function itemTitleStyle(done: boolean | undefined): React.CSSProperties {
  return {
    fontSize: '15px',
    fontWeight: 500,
    textDecoration: done ? 'line-through' : 'none',
    textDecorationColor: 'rgba(255,255,255,0.3)',
  }
}

const itemWhyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.55)',
  lineHeight: 1.5,
}

const itemEstStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.35)',
  fontFamily: 'var(--font-geist-mono), monospace',
}

const ctaCardStyle: React.CSSProperties = {
  marginTop: '40px',
  padding: '32px',
  background: 'linear-gradient(180deg, rgba(58,169,190,0.08) 0%, rgba(58,169,190,0.02) 100%)',
  border: '1px solid rgba(58,169,190,0.2)',
  borderRadius: '16px',
}

const ctaH2Style: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  margin: 0,
  marginBottom: '12px',
}

const ctaPStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '15px',
  lineHeight: 1.6,
  margin: 0,
  marginBottom: '20px',
}

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 28px',
  background: '#3AA9BE',
  color: '#0A0B0C',
  borderRadius: '999px',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '15px',
  marginRight: '12px',
}

const ctaSecondaryStyle: React.CSSProperties = {
  marginTop: '16px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.45)',
}

const inlineLinkStyle: React.CSSProperties = {
  color: '#3AA9BE',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(58,169,190,0.4)',
}

const footerStyle: React.CSSProperties = {
  marginTop: '48px',
  paddingTop: '24px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
}

const footerP: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '13px',
  margin: 0,
  marginBottom: '10px',
  lineHeight: 1.6,
}

const footerLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
}
