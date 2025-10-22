/**
 * Parallax Background Component
 *
 * Multi-layer parallax scrolling background for Aqua Studio
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParallaxBackgroundProps {
  layers?: number;
  baseColor?: string;
  accentColor?: string;
}

export function ParallaxBackground({
  layers = 3,
  baseColor = '#60a5fa',
  accentColor = '#3b82f6',
}: ParallaxBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Far background circles */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 10,
          y: mousePosition.y * 10,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      >
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: baseColor }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: accentColor }}
        />
      </motion.div>

      {/* Layer 2: Mid background shapes */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 25 }}
      >
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-2xl opacity-25"
          style={{ background: accentColor }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full blur-2xl opacity-20"
          style={{ background: baseColor }}
        />
      </motion.div>

      {/* Layer 3: Foreground subtle shapes */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 30,
          y: mousePosition.y * 30,
        }}
        transition={{ type: 'spring', stiffness: 90, damping: 30 }}
      >
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full blur-xl opacity-30"
          style={{ background: baseColor }}
        />
      </motion.div>
    </div>
  );
}
