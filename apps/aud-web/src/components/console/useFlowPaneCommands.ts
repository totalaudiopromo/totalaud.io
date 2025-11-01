/**
 * Flow Pane Commands Hook
 *
 * Provides Command Palette integration for Flow Pane workflow actions.
 * Allows users to add nodes, execute workflows, and manage templates via ⌘K.
 */

import { useCallback } from 'react'
import type { Node } from 'reactflow'
import { Plus, Play, Save, FileText } from 'lucide-react'
import type { CommandAction } from '../ui/CommandPalette'

interface UseFlowPaneCommandsProps {
  addNode: (type: string) => void
  executeWorkflow: () => void
  saveWorkflow: () => void
  isExecuting: boolean
  isSaving: boolean
}

export function useFlowPaneCommands({
  addNode,
  executeWorkflow,
  saveWorkflow,
  isExecuting,
  isSaving,
}: UseFlowPaneCommandsProps): CommandAction[] {
  return [
    {
      id: 'flow-add-research',
      label: 'add research node',
      description: 'Add research node to workflow (find contacts)',
      icon: Plus,
      action: () => addNode('research'),
      keywords: ['workflow', 'node', 'research', 'contacts', 'add'],
    },
    {
      id: 'flow-add-score',
      label: 'add score node',
      description: 'Add score node to workflow (analyse contacts)',
      icon: Plus,
      action: () => addNode('score'),
      keywords: ['workflow', 'node', 'score', 'analyse', 'add'],
    },
    {
      id: 'flow-add-pitch',
      label: 'add pitch node',
      description: 'Add pitch node to workflow (generate outreach)',
      icon: Plus,
      action: () => addNode('pitch'),
      keywords: ['workflow', 'node', 'pitch', 'outreach', 'add'],
    },
    {
      id: 'flow-add-followup',
      label: 'add follow-up node',
      description: 'Add follow-up node to workflow (track responses)',
      icon: Plus,
      action: () => addNode('follow-up'),
      keywords: ['workflow', 'node', 'follow', 'track', 'add'],
    },
    {
      id: 'flow-add-custom',
      label: 'add custom node',
      description: 'Add custom node to workflow (define your own action)',
      icon: Plus,
      action: () => addNode('custom'),
      keywords: ['workflow', 'node', 'custom', 'add'],
    },
    {
      id: 'flow-run-workflow',
      label: 'run workflow',
      description: 'Execute all nodes in current workflow',
      icon: Play,
      action: executeWorkflow,
      keywords: ['workflow', 'run', 'execute', 'start'],
      // @ts-expect-error - CommandAction type incomplete
      disabled: isExecuting,
    },
    {
      id: 'flow-save-workflow',
      label: 'save workflow',
      description: 'Save current workflow to database',
      icon: Save,
      action: saveWorkflow,
      // @ts-expect-error - CommandAction type incomplete
      keywords: ['workflow', 'save', 'persist'],
      disabled: isSaving,
    },
  ]
}
