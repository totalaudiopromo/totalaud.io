/**
 * CRT Effect Component
 *
 * Adds retro CRT monitor effects: scanlines, glow, slight screen curve
 * Used in ASCII Studio for authentic terminal aesthetic
 *
 * Phase 6: Enhancements
 */

'use client';

export interface CRTEffectProps {
  /** Scanline opacity (0-1) */
  scanlineOpacity?: number;
  /** Screen glow intensity (0-1) */
  glowIntensity?: number;
  /** Enable screen curvature */
  enableCurvature?: boolean;
}

export function CRTEffect({
  scanlineOpacity = 0.1,
  glowIntensity = 0.3,
  enableCurvature = false,
}: CRTEffectProps) {
  return (
    <>
      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, ${scanlineOpacity}) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 0, 0, ${scanlineOpacity}) 3px
          )`,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Screen Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(16, 185, 129, ${glowIntensity * 0.1}) 100%)`,
          boxShadow: `inset 0 0 ${100 * glowIntensity}px rgba(16, 185, 129, ${glowIntensity * 0.3})`,
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Optional Curvature (via CSS transform) */}
      {enableCurvature && (
        <style jsx global>{`
          body {
            perspective: 1000px;
          }
          .crt-screen {
            transform: perspective(1000px) rotateX(0.5deg);
          }
        `}</style>
      )}
    </>
  );
}
