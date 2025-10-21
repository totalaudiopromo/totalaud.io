'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentSpawner, type AgentRole, type SpawnParams } from '@/hooks/useAgentSpawner';
import { useUISound } from '@/hooks/useUISound';

interface AgentSpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawn?: (name: string) => void;
  initialRole?: AgentRole;
}

const AGENT_ROLES: { id: AgentRole; label: string; description: string }[] = [
  { id: 'scout', label: 'scout', description: 'discovers contacts and opportunities' },
  { id: 'coach', label: 'coach', description: 'drafts pitches and content' },
  { id: 'tracker', label: 'tracker', description: 'monitors campaign progress' },
  { id: 'insight', label: 'insight', description: 'analyses results and trends' },
  { id: 'custom', label: 'custom', description: 'build your own agent' },
];

const AGENT_COLOURS = [
  '#10b981', // green
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

/**
 * Modal for spawning new agents with name, role, and personality configuration.
 * Full keyboard navigation (Tab, Enter, Escape).
 */
export function AgentSpawnModal({
  isOpen,
  onClose,
  onSpawn,
  initialRole,
}: AgentSpawnModalProps) {
  const { spawn, isSpawning, error } = useAgentSpawner();
  const sound = useUISound();

  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole>(initialRole || 'scout');
  const [personality, setPersonality] = useState('');
  const [colour, setColour] = useState(AGENT_COLOURS[0]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setRole(initialRole || 'scout');
      setPersonality('');
      setColour(AGENT_COLOURS[0]);
    }
  }, [isOpen, initialRole]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSpawning) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSpawning, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        sound.error();
        return;
      }

      const params: SpawnParams = {
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        role,
        personality: personality.trim() || undefined,
        colour,
      };

      const manifest = await spawn(params);

      if (manifest) {
        sound.success();
        onSpawn?.(manifest.name);
        onClose();
      }
    },
    [name, role, personality, colour, spawn, sound, onSpawn, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="agent-spawn-modal-overlay">
        <motion.div
          className="agent-spawn-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="agent-spawn-modal__header">
            <h2 className="agent-spawn-modal__title">signal&gt; spawn agent</h2>
            <p className="agent-spawn-modal__subtitle">
              configure new agent for your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="agent-spawn-modal__form">
            {/* Name Input */}
            <div className="agent-spawn-modal__field">
              <label htmlFor="agent-name" className="agent-spawn-modal__label">
                name
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-scout"
                className="agent-spawn-modal__input"
                autoFocus
                disabled={isSpawning}
                maxLength={50}
              />
              <span className="agent-spawn-modal__hint">
                lowercase, no spaces (will auto-format)
              </span>
            </div>

            {/* Role Selection */}
            <div className="agent-spawn-modal__field">
              <label htmlFor="agent-role" className="agent-spawn-modal__label">
                role
              </label>
              <select
                id="agent-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AgentRole)}
                className="agent-spawn-modal__select"
                disabled={isSpawning}
              >
                {AGENT_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Personality Input */}
            <div className="agent-spawn-modal__field">
              <label htmlFor="agent-personality" className="agent-spawn-modal__label">
                personality (optional)
              </label>
              <textarea
                id="agent-personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="e.g. focused on UK radio, friendly tone"
                className="agent-spawn-modal__textarea"
                disabled={isSpawning}
                maxLength={200}
                rows={3}
              />
              <span className="agent-spawn-modal__hint">
                {personality.length}/200 characters
              </span>
            </div>

            {/* Colour Selection */}
            <div className="agent-spawn-modal__field">
              <label className="agent-spawn-modal__label">colour</label>
              <div className="agent-spawn-modal__colours">
                {AGENT_COLOURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`agent-spawn-modal__colour ${colour === c ? 'agent-spawn-modal__colour--active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      setColour(c);
                      sound.click();
                    }}
                    disabled={isSpawning}
                    aria-label={`Select colour ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="agent-spawn-modal__error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="agent-spawn-modal__actions">
              <button
                type="button"
                onClick={onClose}
                className="agent-spawn-modal__button agent-spawn-modal__button--secondary"
                disabled={isSpawning}
              >
                cancel
              </button>
              <button
                type="submit"
                className="agent-spawn-modal__button agent-spawn-modal__button--primary"
                disabled={isSpawning || !name.trim()}
              >
                {isSpawning ? 'spawning...' : 'spawn agent'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
