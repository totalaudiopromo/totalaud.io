/**
 * ReadyScreen
 * Short transitional screen before entering OperatorOS
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ReadyScreenProps {
  onComplete: () => void;
}

export function ReadyScreen({ onComplete }: ReadyScreenProps) {
  useEffect(() => {
    // Auto-transition after animation completes
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e12] to-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="text-center"
      >
        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-[#3AA9BE] font-['JetBrains_Mono'] mb-4">
            READY
          </h1>
          <p className="text-xl text-[#7ec8d3] mb-2">
            Operator ready.
          </p>
          <p className="text-lg text-[#7ec8d3]/60">
            Signal locked in.
          </p>
        </motion.div>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-[#3AA9BE]/20 via-transparent to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}
