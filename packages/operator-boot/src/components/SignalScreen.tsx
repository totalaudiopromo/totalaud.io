/**
 * SignalScreen
 * Shows loading of core systems with progress indicators
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, X } from 'lucide-react';
import { executeBootChecks, type BootCheck } from '../bootSequence';

interface SignalScreenProps {
  onComplete: () => void;
}

export function SignalScreen({ onComplete }: SignalScreenProps) {
  const [checks, setChecks] = useState<BootCheck[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    executeBootChecks(setChecks)
      .then(result => {
        if (result.success) {
          // Wait a moment then transition to Ready
          setTimeout(onComplete, 500);
        } else {
          setError(result.error || 'Boot failed');
        }
      })
      .catch(err => {
        setError(err.message);
      });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black to-[#0a0e12] flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#3AA9BE] font-['JetBrains_Mono'] mb-2">
            SIGNAL
          </h1>
          <p className="text-sm text-[#7ec8d3]">
            Wiring in platform capabilities
          </p>
        </motion.div>

        {/* Checks Grid */}
        <div className="grid grid-cols-2 gap-3">
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#3AA9BE]/20 rounded"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {check.status === 'pending' && (
                  <div className="w-4 h-4 border-2 border-[#3AA9BE]/30 rounded-full" />
                )}
                {check.status === 'checking' && (
                  <Loader2 className="w-4 h-4 text-[#3AA9BE] animate-spin" />
                )}
                {check.status === 'success' && (
                  <Check className="w-4 h-4 text-[#10b981]" />
                )}
                {check.status === 'error' && (
                  <X className="w-4 h-4 text-[#ef4444]" />
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#E0F2F7] font-['JetBrains_Mono']">
                  {check.name}
                </div>
                {check.message && (
                  <div className="text-xs text-[#7ec8d3] mt-0.5">
                    {check.message}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-[#ef4444]/10 border border-[#ef4444] rounded text-center"
          >
            <p className="text-[#ef4444] text-sm font-['JetBrains_Mono']">
              {error}
            </p>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {!error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="h-1 bg-[#0f1419] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#3AA9BE]"
                initial={{ width: '0%' }}
                animate={{
                  width: `${(checks.filter(c => c.status === 'success').length / checks.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
