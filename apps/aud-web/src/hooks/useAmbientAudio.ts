'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserPrefs } from './useUserPrefs';

type AmbientType = 'operator-hum' | 'transition-glide' | 'theme-ambient';

interface AmbientAudioConfig {
  type: AmbientType;
  theme?: string;
  volume?: number;
}

/**
 * Manages ambient audio for onboarding sequence:
 * - operator-hum: 50Hz sine tone at -24dB
 * - transition-glide: 440Hz → 220Hz glide
 * - theme-ambient: theme-specific ambient loop
 */
export function useAmbientAudio(config: AmbientAudioConfig) {
  const audioContext = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { prefs } = useUserPrefs();

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContext.current = new AudioContext();
    }

    return () => {
      stop();
    };
  }, []);

  // Check if sounds are muted
  const isMuted = prefs?.mute_sounds ?? false;
  const userVolume = prefs?.audio_volume ?? 0.7;

  const play = () => {
    if (!audioContext.current || isMuted || isPlaying) return;

    try {
      const ctx = audioContext.current;

      // Ensure context is running (required for some browsers)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      const baseVolume = config.volume ?? 0.15;
      const finalVolume = baseVolume * userVolume;

      if (config.type === 'operator-hum') {
        // 50Hz sine tone at -24dB (~0.063 linear gain)
        oscillator.type = 'sine';
        oscillator.frequency.value = 50;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.063, ctx.currentTime + 0.3);
      } else if (config.type === 'transition-glide') {
        // 440Hz → 220Hz glide over 2 seconds
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 2);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.2, ctx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

        // Auto-stop after glide completes
        setTimeout(() => {
          stop();
        }, 2100);
      } else if (config.type === 'theme-ambient') {
        // Theme-specific ambient configuration
        const themeConfigs: Record<string, { freq: number; type: OscillatorType }> = {
          ascii: { freq: 110, type: 'square' },
          xp: { freq: 220, type: 'sine' },
          aqua: { freq: 165, type: 'triangle' },
          daw: { freq: 130.81, type: 'sawtooth' }, // C3
          analogue: { freq: 130.81, type: 'sine' }, // C3
        };

        const themeConfig = themeConfigs[config.theme || 'ascii'];
        oscillator.type = themeConfig.type;
        oscillator.frequency.value = themeConfig.freq;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.1, ctx.currentTime + 0.5);
      }

      oscillator.start(ctx.currentTime);
      setIsPlaying(true);
    } catch (error) {
      console.warn('Failed to play ambient audio:', error);
    }
  };

  const stop = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioContext.current) {
      try {
        const ctx = audioContext.current;
        const gainNode = gainNodeRef.current;

        // Fade out over 300ms
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        setTimeout(() => {
          oscillatorRef.current?.stop();
          oscillatorRef.current = null;
          gainNodeRef.current = null;
          setIsPlaying(false);
        }, 350);
      } catch (error) {
        console.warn('Failed to stop ambient audio:', error);
      }
    }
  };

  const fadeOut = (duration = 0.5) => {
    if (gainNodeRef.current && audioContext.current) {
      try {
        const ctx = audioContext.current;
        const gainNode = gainNodeRef.current;

        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        setTimeout(() => {
          stop();
        }, duration * 1000 + 50);
      } catch (error) {
        console.warn('Failed to fade out ambient audio:', error);
      }
    }
  };

  const increaseVolume = (amount: number) => {
    if (gainNodeRef.current && audioContext.current) {
      try {
        const ctx = audioContext.current;
        const gainNode = gainNodeRef.current;
        const currentGain = gainNode.gain.value;
        const newGain = Math.min(1, currentGain + amount);

        gainNode.gain.setValueAtTime(currentGain, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(newGain, ctx.currentTime + 0.2);
      } catch (error) {
        console.warn('Failed to increase volume:', error);
      }
    }
  };

  return {
    play,
    stop,
    fadeOut,
    increaseVolume,
    isPlaying,
  };
}
