import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestureEngine } from '../gestures/gestureEngine';
import { NormalizedInputEvent } from '../types';

describe('GestureEngine', () => {
  let engine: GestureEngine;

  beforeEach(() => {
    engine = new GestureEngine();
  });

  it('should create gesture engine', () => {
    expect(engine).toBeDefined();
  });

  it('should detect double-tap gesture', async () => {
    const event1: NormalizedInputEvent = {
      device: 'push2',
      inputType: 'pad',
      inputId: 'pad-0-0',
      value: 127,
      velocity: 100,
      timestamp: Date.now(),
    };

    const event2: NormalizedInputEvent = {
      ...event1,
      timestamp: Date.now() + 100,
    };

    await engine.processEvent(event1);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const gesture = await engine.processEvent(event2);

    expect(gesture).toBeDefined();
    expect(gesture?.type).toBe('double_tap');
  });

  it('should reset engine', () => {
    engine.reset();
    expect(engine).toBeDefined();
  });
});
