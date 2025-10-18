"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { motion } from "framer-motion"

const statusIcons = {
  pending: "⏸",
  running: "▶",
  completed: "✓",
  failed: "✗"
}

const statusColors = {
  pending: "#6b7280",
  running: "#3b82f6",
  completed: "#10b981",
  failed: "#ef4444"
}

export const FlowNode = memo(({ data, selected }: NodeProps) => {
  const status = data.status || "pending"
  const color = statusColors[status as keyof typeof statusColors]
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-600 !border-2 !border-slate-400"
      />
      
      <div
        className="bg-slate-900 border-2 rounded-xl overflow-hidden min-w-[180px]"
        style={{
          borderColor: color,
          boxShadow: selected
            ? `0 0 0 2px ${color}40, 0 0 20px ${color}30`
            : `0 0 10px ${color}20`
        }}
      >
        {/* ASCII Header */}
        <div className="font-mono text-[10px] leading-tight text-slate-600 bg-slate-950/50 px-2 py-1 border-b border-slate-800 select-none">
          <div className="ascii-art">
{`┌─ ${data.skillName || "node"} ─┐`}
          </div>
        </div>

        {/* Node Content */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.span
                animate={
                  status === "running"
                    ? { rotate: [0, 360] }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: status === "running" ? Infinity : 0,
                  ease: "linear"
                }}
                className="text-lg"
              >
                {statusIcons[status as keyof typeof statusIcons]}
              </motion.span>
              <span className="text-sm font-medium text-white">
                {data.label}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">status:</span>
              <span
                className="font-semibold"
                style={{ color }}
              >
                {status}
              </span>
            </div>
            
            {data.duration_ms && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500">time:</span>
                <span className="text-slate-300 tabular-nums">
                  {data.duration_ms}ms
                </span>
              </div>
            )}
          </div>

          {/* Output Preview */}
          {data.output && status === "completed" && (
            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">
                {typeof data.output === 'object' && data.output.contacts
                  ? `${data.output.contacts.length} contacts found`
                  : "Output ready"}
              </div>
            </div>
          )}
        </div>

        {/* ASCII Footer */}
        <div className="font-mono text-[10px] leading-tight text-slate-700 bg-slate-950/50 px-2 py-1 border-t border-slate-800 select-none">
          <div className="ascii-art">
{`└${"─".repeat((data.skillName || "node").length + 4)}┘`}
          </div>
        </div>

        {/* Running Animation Overlay */}
        {status === "running" && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}20, transparent)`
            }}
            animate={{
              x: ["-100%", "200%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-600 !border-2 !border-slate-400"
      />
    </motion.div>
  )
})

FlowNode.displayName = "FlowNode"

