import { describe, it, expect } from 'vitest';
import { ScriptEngine } from '../scripts/scriptEngine';

describe('ScriptEngine', () => {
  it('should validate valid script', () => {
    const script = {
      name: 'Test Script',
      steps: [
        { action: 'open_window', target: 'cis' },
        { delay: 300 },
      ],
    };

    const result = ScriptEngine.validateScript(script);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid script', () => {
    const script = {
      steps: 'invalid',
    };

    const result = ScriptEngine.validateScript(script);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
