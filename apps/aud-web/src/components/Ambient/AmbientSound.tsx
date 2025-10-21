'use client';

import { useEffect } from 'react';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';

interface AmbientSoundProps {
  type: 'operator-hum' | 'transition-glide' | 'theme-ambient';
  theme?: string;
  volume?: number;
  autoPlay?: boolean;
}

/**
 * Ambient audio component for onboarding sequence.
 * Handles operator hum, transition glide, and theme-specific ambient loops.
 */
export function AmbientSound({ type, theme, volume, autoPlay = true }: AmbientSoundProps) {
  const ambient = useAmbientAudio({ type, theme, volume });

  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure audio context is ready
      const timer = setTimeout(() => {
        ambient.play();
      }, 100);

      return () => {
        clearTimeout(timer);
        ambient.stop();
      };
    }
  }, [autoPlay, type, theme]);

  // Listen for volume boost event (easter egg)
  useEffect(() => {
    const handleVolumeBoost = (e: Event) => {
      const customEvent = e as CustomEvent<{ increase: number }>;
      ambient.increaseVolume(customEvent.detail.increase);
    };

    window.addEventListener('operator-volume-boost', handleVolumeBoost);
    return () => {
      window.removeEventListener('operator-volume-boost', handleVolumeBoost);
    };
  }, []);

  // No visual component - audio only
  return null;
}
