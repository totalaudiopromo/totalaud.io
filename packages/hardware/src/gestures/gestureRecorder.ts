/**
 * Gesture Recorder
 * Records and plays back gesture sequences
 */

import { NormalizedInputEvent } from '../types';
import { DetectedGesture } from './gestureEngine';
import { logger } from '../utils/logger';

const log = logger.createScope('GestureRecorder');

export interface RecordedGesture {
  name: string;
  events: Array<{
    event: NormalizedInputEvent;
    timestamp: number;
    relativeTime: number;
  }>;
  duration: number;
  createdAt: Date;
}

export class GestureRecorder {
  private isRecording = false;
  private recordedEvents: Array<{
    event: NormalizedInputEvent;
    timestamp: number;
  }> = [];
  private recordingStartTime = 0;

  /**
   * Start recording
   */
  startRecording(): void {
    if (this.isRecording) {
      log.warn('Already recording');
      return;
    }

    this.isRecording = true;
    this.recordedEvents = [];
    this.recordingStartTime = Date.now();

    log.info('Recording started');
  }

  /**
   * Stop recording
   */
  stopRecording(name: string): RecordedGesture | null {
    if (!this.isRecording) {
      log.warn('Not recording');
      return null;
    }

    this.isRecording = false;

    const duration = Date.now() - this.recordingStartTime;

    const recordedGesture: RecordedGesture = {
      name,
      events: this.recordedEvents.map((recorded) => ({
        event: recorded.event,
        timestamp: recorded.timestamp,
        relativeTime: recorded.timestamp - this.recordingStartTime,
      })),
      duration,
      createdAt: new Date(),
    };

    log.info('Recording stopped', {
      name,
      eventCount: this.recordedEvents.length,
      duration,
    });

    return recordedGesture;
  }

  /**
   * Record an event
   */
  recordEvent(event: NormalizedInputEvent): void {
    if (!this.isRecording) {
      return;
    }

    this.recordedEvents.push({
      event,
      timestamp: Date.now(),
    });
  }

  /**
   * Play back a recorded gesture
   */
  async playback(
    gesture: RecordedGesture,
    callback: (event: NormalizedInputEvent) => void,
    tempoMultiplier = 1.0
  ): Promise<void> {
    log.info('Playing back gesture', {
      name: gesture.name,
      eventCount: gesture.events.length,
      tempo: tempoMultiplier,
    });

    for (let i = 0; i < gesture.events.length; i++) {
      const recorded = gesture.events[i];
      const nextDelay =
        i < gesture.events.length - 1
          ? (gesture.events[i + 1].relativeTime - recorded.relativeTime) / tempoMultiplier
          : 0;

      // Execute callback with event
      callback(recorded.event);

      // Wait for next event
      if (nextDelay > 0) {
        await this.delay(nextDelay);
      }
    }

    log.info('Playback complete', { name: gesture.name });
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
