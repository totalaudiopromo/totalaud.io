/**
 * Audio Context Manager
 * Singleton manager for Web Audio API AudioContext
 * Handles lazy initialization and user gesture requirements
 */

let audioContext: AudioContext | null = null;
let audioContextState: 'uninitialized' | 'initializing' | 'ready' | 'suspended' | 'error' = 'uninitialized';

/**
 * Get the current AudioContext (may be null if not initialized)
 */
export function getAudioContext(): AudioContext | null {
  return audioContext;
}

/**
 * Ensure AudioContext is created and resumed
 * Must be called from a user gesture (click, etc.)
 */
export async function ensureAudioContext(): Promise<AudioContext | null> {
  if (audioContext && audioContextState === 'ready') {
    return audioContext;
  }

  if (audioContextState === 'initializing') {
    // Wait for initialization to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (audioContextState === 'ready') {
          clearInterval(checkInterval);
          resolve(audioContext);
        } else if (audioContextState === 'error') {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }

  try {
    audioContextState = 'initializing';

    // Create AudioContext
    if (!audioContext) {
      // Use webkitAudioContext for older Safari
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('Web Audio API not supported');
        audioContextState = 'error';
        return null;
      }
      audioContext = new AudioContextClass();
    }

    // Resume if suspended (required for autoplay policies)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    audioContextState = 'ready';
    return audioContext;
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error);
    audioContextState = 'error';
    return null;
  }
}

/**
 * Suspend the AudioContext (pause all audio)
 */
export async function suspendAudio(): Promise<void> {
  if (audioContext && audioContext.state === 'running') {
    await audioContext.suspend();
    audioContextState = 'suspended';
  }
}

/**
 * Resume the AudioContext
 */
export async function resumeAudio(): Promise<void> {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
    audioContextState = 'ready';
  }
}

/**
 * Close the AudioContext (cleanup)
 */
export async function closeAudioContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
    audioContextState = 'uninitialized';
  }
}

/**
 * Get the current state of the audio context
 */
export function getAudioContextState(): typeof audioContextState {
  return audioContextState;
}
