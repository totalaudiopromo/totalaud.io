'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useWorkspace } from '@/hooks/useWorkspace'
import { creditsDb, subscriptionDb, usageDb } from '@total-audio/loopos-db'
import { Activity, TrendingUp, Zap, Clock } from 'lucide-react'
import { DEV_MODE_CONFIG } from '@/config/plans'
import type { UsageEvent } from '@total-audio/loopos-db'

export default function BillingPage() {
  return (
    <AuthGuard>
      <BillingContent />
    </AuthGuard>
  )
}

function BillingContent() {
  const { currentWorkspace } = useWorkspace()
  const [balance, setBalance] = useState<number>(0)
  const [planName, setPlanName] = useState<string>('Free')
  const [monthlyAllocation, setMonthlyAllocation] = useState<number>(200)
  const [usageSummary, setUsageSummary] = useState<Record<string, { count: number; credits: number }>>({})
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentWorkspace) return
    loadBillingInfo()
  }, [currentWorkspace])

  const loadBillingInfo = async () => {
    if (!currentWorkspace) return

    try {
      setLoading(true)

      // Get credit balance
      const currentBalance = await creditsDb.getBalance(currentWorkspace.id)
      setBalance(currentBalance)

      // Get plan
      const plan = await subscriptionDb.getPlan(currentWorkspace.id)
      if (plan) {
        setPlanName(plan.name)
        setMonthlyAllocation(plan.ai_credits_per_month)
      }

      // Get usage summary for current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const summary = await usageDb.getSummary(currentWorkspace.id, startOfMonth)
      setUsageSummary(summary)

      // Get recent events
      const events = await usageDb.list(currentWorkspace.id, 20)
      setRecentEvents(events)
    } catch (error) {
      console.error('Failed to load billing info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentWorkspace) {
    return <div className="p-8">No workspace selected</div>
  }

  if (loading) {
    return (
      <div className="flex items-centre justify-centre min-h-screen">
        <Activity className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  const percentage = Math.min((balance / monthlyAllocation) * 100, 100)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
          <p className="text-foreground/60">
            Manage your subscription and track AI credit usage
          </p>
          {DEV_MODE_CONFIG.enabled && (
            <div className="mt-4 p-4 bg-amber-500/20 border border-amber-600/30 rounded-lg flex items-centre gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-400">Development Mode Active</p>
                <p className="text-xs text-amber-500/80">
                  Billing is not enforced. All features are available for testing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-centre gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-medium">Current Balance</h3>
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {balance.toLocaleString()}
            </div>
            <div className="text-sm text-foreground/60">
              of {monthlyAllocation.toLocaleString()} monthly credits
            </div>
            <div className="mt-4 w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Current Plan */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-centre gap-3 mb-2">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="font-medium">Current Plan</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{planName}</div>
            <div className="text-sm text-foreground/60">
              {monthlyAllocation.toLocaleString()} credits/month
            </div>
          </div>

          {/* This Month */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-centre gap-3 mb-2">
              <Activity className="w-5 h-5 text-accent" />
              <h3 className="font-medium">This Month</h3>
            </div>
            <div className="text-3xl font-bold mb-2">
              {Object.values(usageSummary).reduce((sum, cat) => sum + cat.credits, 0).toLocaleString()}
            </div>
            <div className="text-sm text-foreground/60">credits used</div>
          </div>
        </div>

        {/* Usage by Category */}
        <div className="bg-background border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Usage by Category</h2>
          <div className="space-y-4">
            {Object.entries(usageSummary).map(([category, stats]) => (
              <div key={category} className="flex items-centre justify-between">
                <div>
                  <p className="font-medium capitalize">{category.replace('_', ' ')}</p>
                  <p className="text-sm text-foreground/60">{stats.count} actions</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-accent">{stats.credits} credits</p>
                </div>
              </div>
            ))}
            {Object.keys(usageSummary).length === 0 && (
              <p className="text-centre text-foreground/60 py-8">No usage this month</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-centre justify-between p-3 border border-border/50 rounded hover:border-accent/20 transition-colours"
              >
                <div className="flex items-centre gap-3">
                  <Clock className="w-4 h-4 text-foreground/40" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {event.category.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-accent">
                  -{event.credits_used} credits
                </div>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <p className="text-centre text-foreground/60 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
