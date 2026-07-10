"use client"

import type { SessionState, TranscriptItem } from "@/lib/sessions-types"
import { describeActivity } from "@/lib/session-statusline"
import { STATUS_META } from "./session-card"

/** Faixa de status ao vivo por sessão (estilo statusline de editor). */
export function SessionStatusline({
  session,
  items,
}: {
  session: SessionState
  items: TranscriptItem[]
}) {
  const meta = STATUS_META[session.status]
  const isWorking = session.status === "working"
  const activity = describeActivity(session.status, items)

  return (
    <div
      className="flex items-center gap-1.5 px-4 py-1 border-b text-[10px] font-mono text-[#8b8ba7] overflow-hidden"
      style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(124,58,237,0.05)" }}
    >
      <span className="uppercase tracking-wide text-[#a1a1b5] shrink-0">
        {session.platform === "opencode" ? "opencode" : "claude"}
      </span>
      {session.server && session.server !== "local" && (
        <span className="uppercase tracking-wide text-[#7c8aff] shrink-0">@{session.server}</span>
      )}
      <span className="opacity-40 shrink-0">·</span>
      <span className="shrink-0 max-w-[180px] truncate">{session.model ?? "padrão"}</span>
      <span className="opacity-40 shrink-0">·</span>
      <span className="flex items-center gap-1 shrink-0">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: meta.dot,
            boxShadow: isWorking ? "0 0 5px rgba(168,85,247,0.70)" : undefined,
          }}
        />
        <span style={{ color: meta.text }}>{meta.label}</span>
      </span>
      <span className="opacity-40 shrink-0">·</span>
      <span className="shrink-0">${session.cost_usd.toFixed(2)}</span>
      <span className="opacity-40 shrink-0">·</span>
      <span className="shrink-0">{session.files_touched.length} arq</span>
      <span className="opacity-40 shrink-0">·</span>
      <span className="truncate text-[#c4a8ff]">{activity}</span>
    </div>
  )
}
