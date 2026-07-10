"use client"

import type { Server, SessionState } from "@/lib/sessions-types"
import { aggregateByServer } from "@/lib/server-aggregate"

/** Barra agregada: sessões por servidor (contagem + custo somado + online). */
export function ServerBar({
  servers,
  sessions,
}: {
  servers: Server[]
  sessions: SessionState[]
}) {
  const aggs = aggregateByServer(servers, sessions)
  if (aggs.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2 border-b"
      style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(124,58,237,0.05)" }}
    >
      {aggs.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]"
          style={{ background: "rgba(20,18,31,0.7)", border: "1px solid rgba(124,58,237,0.20)" }}
          title={`${a.sessions} sessão(ões) · $${a.cost.toFixed(2)} · ${a.online ? "online" : "offline"}`}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: a.online ? "#a855f7" : "#6b6b80" }}
          />
          <span className="font-semibold text-[#ededf5]">{a.name}</span>
          <span className="font-mono text-[#8b8ba7]">{a.sessions}s · ${a.cost.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
