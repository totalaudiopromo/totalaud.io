'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Lightbulb, Flag, CheckSquare, Link as LinkIcon, Sparkles, GitBranch } from 'lucide-react'
import type { NodeType } from '@total-audio/loopos-db'

const nodeIcons: Record<NodeType, React.ElementType> = {
  idea: Lightbulb,
  milestone: Flag,
  task: CheckSquare,
  reference: LinkIcon,
  insight: Sparkles,
  decision: GitBranch,
}

interface CampaignNodeData {
  title: string
  content: string
  colour: string
  nodeType: NodeType
  metadata?: Record<string, unknown>
}

export const CampaignNode = memo(({ data }: NodeProps<CampaignNodeData>) => {
  const Icon = nodeIcons[data.nodeType]

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 bg-background shadow-lg min-w-[200px] max-w-[300px]"
      style={{
        borderColor: data.colour,
        boxShadow: `0 0 20px ${data.colour}20`,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2 mb-2">
        <div
          className="p-1.5 rounded"
          style={{
            backgroundColor: `${data.colour}20`,
            color: data.colour,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{data.title}</h4>
          <p className="text-xs text-foreground/60 capitalize">{data.nodeType}</p>
        </div>
      </div>

      {data.content && (
        <p className="text-sm text-foreground/80 line-clamp-2 mb-2">{data.content}</p>
      )}

      {data.metadata?.tags && Array.isArray(data.metadata.tags) && (
        <div className="flex flex-wrap gap-1">
          {(data.metadata.tags as string[]).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {tag}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
})

CampaignNode.displayName = 'CampaignNode'
