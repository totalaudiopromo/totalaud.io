/**
 * BootScreen
 * Initial boot screen with ASCII-style animation
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_TEXT = [
  'OPERATOROS v0.1.0',
  '',
  'Initialising operator environment...',
  'Loading core systems...',
  'Establishing signal connection...',
];

export function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    // Show lines one by one
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= BOOT_TEXT.length) {
          clearInterval(interval);
          // Wait a bit then transition to next phase
          setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center font-['JetBrains_Mono']">
      <div className="max-w-2xl w-full px-8">
        {BOOT_TEXT.slice(0, visibleLines).map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="text-[#3AA9BE] text-sm mb-2"
          >
            {line || '\u00A0'}
          </motion.div>
        ))}

        {/* Cursor */}
        {visibleLines === BOOT_TEXT.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-[#3AA9BE] ml-1"
          />
        )}
      </div>
    </div>
  );
}
