"use client"

import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import type { SessionState, SessionStatus } from "@/lib/sessions-types"

export const STATUS_META: Record<SessionStatus, { label: string; dot: string; text: string }> = {
  working: { label: "trabalhando", dot: "#a855f7", text: "#c4a8ff" },
  idle: { label: "ociosa", dot: "#8b8ba7", text: "#8b8ba7" },
  stopped: { label: "parada", dot: "#6b6b80", text: "#6b6b80" },
  failed: { label: "falhou", dot: "#f87171", text: "#f87171" },
}

export function SessionCard({
  session,
  selected,
  onSelect,
  onRemove,
}: {
  session: SessionState
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const meta = STATUS_META[session.status]
  const isWorking = session.status === "working"

  return (
    <motion.div
      onClick={onSelect}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full text-left rounded-xl border p-3 mb-2 transition-colors cursor-pointer"
      style={{
        background: selected ? "rgba(124,58,237,0.16)" : "rgba(20,18,31,0.7)",
        borderColor: selected ? "#9333ea" : "rgba(124,58,237,0.20)",
        boxShadow: selected ? "0 0 18px rgba(168,85,247,0.30)" : undefined,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        aria-label="Remover sessão"
        className="absolute top-2 right-2 p-1 rounded transition-colors text-[#a1a1b5] hover:text-[#f87171]"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2 pr-6">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{
            background: meta.dot,
            boxShadow: isWorking ? "0 0 6px rgba(168,85,247,0.70)" : undefined,
          }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{
            color: meta.text,
            textShadow: isWorking ? "0 0 8px rgba(168,85,247,0.60)" : undefined,
          }}
        >
          {meta.label}
        </span>
        <span className="text-[9px] font-mono uppercase tracking-wide text-[#8b8ba7]">
          {session.platform === "opencode" ? "opencode" : "claude"}
        </span>
        {session.server && session.server !== "local" && (
          <span className="text-[9px] font-mono uppercase tracking-wide text-[#7c8aff]">
            @{session.server}
          </span>
        )}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-[#ededf5] line-clamp-2 pr-6">
        {session.task}
      </div>
      <div className="mt-1 text-[11px] font-mono text-[#8b8ba7] truncate">{session.cwd}</div>
      <div className="mt-2 text-[10px] text-[#a1a1b5]">
        ${session.cost_usd.toFixed(2)} · {session.files_touched.length} arquivos
      </div>
    </motion.div>
  )
}
