'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap } from 'lucide-react'
import { PLANS, formatPrice } from '@/config/plans'
import { DEV_MODE_CONFIG } from '@/config/plans'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlanId?: string
  requiredCredits?: number
  currentBalance?: number
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlanId = 'free',
  requiredCredits,
  currentBalance,
}: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-background border border-border rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-centre justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold flex items-centre gap-2">
                  <Zap className="w-6 h-6 text-accent" />
                  Upgrade Your Plan
                </h2>
                {requiredCredits && currentBalance !== undefined && (
                  <p className="text-sm text-foreground/60 mt-1">
                    You need {requiredCredits} credits but only have {currentBalance}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-accent/10 transition-colours"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plans Comparison */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                  const isCurrent = plan.id === currentPlanId

                  return (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-6 ${
                        isCurrent
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      } transition-colours`}
                    >
                      {/* Plan Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-foreground/60 mt-1">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="text-3xl font-bold text-accent">
                          {formatPrice(plan.monthlyPriceCents)}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-centre gap-2">
                          <Check className="w-4 h-4 text-accent" />
                          <span className="text-sm">
                            {plan.aiCreditsPerMonth.toLocaleString()} AI credits/month
                          </span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="w-4 h-4 text-accent" />
                          <span className="text-sm">
                            {plan.maxWorkspaces} {plan.maxWorkspaces === 1 ? 'workspace' : 'workspaces'}
                          </span>
                        </div>
                        {plan.features.exports && (
                          <div className="flex items-centre gap-2">
                            <Check className="w-4 h-4 text-accent" />
                            <span className="text-sm">Unlimited exports</span>
                          </div>
                        )}
                        {plan.features.realtime && (
                          <div className="flex items-centre gap-2">
                            <Check className="w-4 h-4 text-accent" />
                            <span className="text-sm">Real-time collaboration</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        disabled={isCurrent || !DEV_MODE_CONFIG.enabled}
                        className={`w-full py-2 px-4 rounded font-medium transition-colours ${
                          isCurrent
                            ? 'bg-accent/20 text-accent cursor-not-allowed'
                            : 'bg-accent text-background hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : 'Upgrade (Coming Soon)'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-accent/5">
              <p className="text-sm text-foreground/80 text-centre">
                {DEV_MODE_CONFIG.enabled
                  ? 'Development mode: Billing is not yet active. All features are available for testing.'
                  : 'Upgrade to increase your credit allowance and unlock premium features.'}
              </p>
              {DEV_MODE_CONFIG.enabled && (
                <button
                  onClick={onClose}
                  className="w-full mt-4 py-2 px-4 rounded font-medium bg-accent text-background hover:bg-accent/90 transition-colours"
                >
                  Continue (Dev Mode)
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
