import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MappingEngine } from '../mappingEngine';
import { NormalizedInputEvent, HardwareMapping, HardwareAction } from '../types';

describe('MappingEngine', () => {
  let mockSupabase: any;
  let engine: MappingEngine;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };

    engine = new MappingEngine(mockSupabase);
  });

  it('should create a mapping engine instance', () => {
    expect(engine).toBeDefined();
    expect(engine.getMappings()).toEqual([]);
  });

  it('should process input events', async () => {
    const mockExecutor = {
      execute: vi.fn(async (action: HardwareAction) => {}),
    };

    engine.setActionExecutor(mockExecutor);

    const inputEvent: NormalizedInputEvent = {
      device: 'push2',
      inputType: 'pad',
      inputId: 'pad-0-0',
      value: 127,
      velocity: 127,
      timestamp: Date.now(),
    };

    await engine.processInput(inputEvent);

    // Since no mappings are loaded, executor should not be called
    expect(mockExecutor.execute).not.toHaveBeenCalled();
  });

  it('should get mappings', () => {
    const mappings = engine.getMappings();
    expect(Array.isArray(mappings)).toBe(true);
  });
});
