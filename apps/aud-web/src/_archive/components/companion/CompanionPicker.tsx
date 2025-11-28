'use client'

import React from 'react'
import { useCompanion } from './useCompanion'

interface CompanionPickerProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'compact'
}

export function CompanionPicker({
  title = 'Project companion',
  subtitle = 'Pick the voice that rides shotgun on your agent runs.',
  variant = 'default',
}: CompanionPickerProps) {
  const { companions, activeCompanionId, setCompanion } = useCompanion()

  if (variant === 'compact') {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/85 p-3 text-[11px] text-slate-200">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Companion
            </p>
            <p className="text-xs text-slate-100">{title}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {companions.map((companion) => {
            const isActive = companion.id === activeCompanionId
            return (
              <button
                key={companion.id}
                type="button"
                onClick={() => setCompanion(companion.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[10px] font-medium transition ${
                  isActive
                    ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-50'
                    : 'border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-slate-500 hover:text-slate-50'
                }`}
              >
                <span
                  className="h-[7px] w-[7px] rounded-full shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                  style={{
                    backgroundColor: companion.accent,
                  }}
                />
                <span>{companion.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const active = companions.find((c) => c.id === activeCompanionId) ?? companions[0]

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Companion
          </p>
          <p className="text-sm font-semibold text-slate-50">{title}</p>
          <p className="mt-[2px] text-[11px] text-slate-400">{subtitle}</p>
        </div>
        {active && (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 0%, ${active.accent}55, transparent 55%)`,
              }}
            />
            <span className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100">
              AI
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {companions.map((companion) => {
          const isActive = companion.id === activeCompanionId
          return (
            <button
              key={companion.id}
              type="button"
              onClick={() => setCompanion(companion.id)}
              className={`group flex min-w-[9rem] flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-50'
                  : 'border-slate-700/80 bg-slate-950/90 text-slate-200 hover:border-slate-500 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/80 text-[9px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    boxShadow: isActive
                      ? `0 0 12px ${companion.accent}88`
                      : '0 0 0 1px rgba(15,23,42,0.9)',
                  }}
                >
                  <span
                    className="h-[8px] w-[8px] rounded-full"
                    style={{
                      backgroundColor: companion.accent,
                    }}
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold">{companion.name}</p>
                  <p className="truncate text-[10px] text-slate-400">{companion.tone}</p>
                </div>
              </div>
              {isActive && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Active
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
