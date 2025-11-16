'use client'

import { useEffect, useState } from 'react'
import { creditsDb, subscriptionDb } from '@total-audio/loopos-db'
import { Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { DEV_MODE_CONFIG } from '@/config/plans'

interface CreditMeterProps {
  workspaceId: string
}

export function CreditMeter({ workspaceId }: CreditMeterProps) {
  const [balance, setBalance] = useState<number>(0)
  const [planName, setPlanName] = useState<string>('Free')
  const [monthlyAllocation, setMonthlyAllocation] = useState<number>(200)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCreditInfo()
  }, [workspaceId])

  const loadCreditInfo = async () => {
    try {
      setLoading(true)

      // Get credit balance
      const currentBalance = await creditsDb.getBalance(workspaceId)
      setBalance(currentBalance)

      // Get plan
      const plan = await subscriptionDb.getPlan(workspaceId)
      if (plan) {
        setPlanName(plan.name)
        setMonthlyAllocation(plan.ai_credits_per_month)
      }
    } catch (error) {
      console.error('Failed to load credit info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-centre gap-2 px-3 py-2">
        <Activity className="w-4 h-4 animate-spin text-accent" />
        <span className="text-sm text-foreground/60">Loading...</span>
      </div>
    )
  }

  const percentage = Math.min((balance / monthlyAllocation) * 100, 100)
  const isLow = percentage < 20

  return (
    <Link
      href="/settings/billing"
      className="flex items-centre gap-3 px-3 py-2 rounded hover:bg-accent/5 transition-colours"
    >
      <div className="flex items-centre gap-2">
        <TrendingUp className={`w-4 h-4 ${isLow ? 'text-amber-500' : 'text-accent'}`} />
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{balance.toLocaleString()}</span>
            <span className="text-xs text-foreground/60">
              / {monthlyAllocation.toLocaleString()} credits
            </span>
          </div>
          <span className="text-xs text-foreground/60">{planName} Plan</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isLow ? 'bg-amber-500' : 'bg-accent'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {DEV_MODE_CONFIG.enabled && (
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-medium">
          DEV
        </span>
      )}
    </Link>
  )
}
