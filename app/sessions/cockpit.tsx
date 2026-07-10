"use client"

import { useState } from "react"
import { RefreshCw, Server as ServerIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSessions } from "@/hooks/use-sessions"
import { useIsMobile } from "@/hooks/use-mobile"
import { cockpitPane } from "@/lib/cockpit-pane"
import { SessionList } from "./session-list"
import { SessionDetail } from "./session-detail"
import { NewSessionDialog } from "./new-session-dialog"
import { ServersDialog } from "./servers-dialog"
import { ServerBar } from "./server-bar"

export default function SessionsCockpit() {
  const { state, conn, selectedId, servers, refreshServers, select, deselect, create, send, interrupt, remove, retry } = useSessions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [serversOpen, setServersOpen] = useState(false)
  const isMobile = useIsMobile()

  const sessions = state.order.map((id) => state.sessions[id]).filter(Boolean)
  const selected = selectedId ? state.sessions[selectedId] ?? null : null
  const items = selectedId ? state.transcripts[selectedId] ?? [] : []
  const pane = cockpitPane({ isMobile, selectedId })

  if (conn === "offline" && sessions.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ background: "#06060a" }}
      >
        <p className="text-[13px] text-[#c4a8ff]">
          Orquestrador offline ou desabilitado (ALOY_SESSIONS_ENABLED).
        </p>
        <Button
          variant="outline"
          onClick={() => void retry()}
          className="text-[#c4a8ff]"
          style={{
            borderColor: "rgba(124,58,237,0.40)",
            background: "rgba(124,58,237,0.12)",
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar de novo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex min-h-0" style={{ background: "#06060a" }}>
      {(pane === "list" || pane === "split") && (
        <div className={pane === "list" ? "flex flex-col w-full min-w-0" : "flex flex-col"}>
          {conn !== "online" ? (
            <div
              className="px-3 py-1.5 text-[10px] text-[#c4a8ff] border-b"
              style={{
                background: "rgba(124,58,237,0.12)",
                borderColor: "rgba(124,58,237,0.20)",
              }}
            >
              {conn === "connecting" ? "conectando…" : "reconectando…"}
            </div>
          ) : null}
          <ServerBar servers={servers} sessions={sessions} />
          <SessionList
            sessions={sessions}
            selectedId={selectedId}
            onSelect={(id) => void select(id)}
            onNew={() => setDialogOpen(true)}
            onRemove={(id) => { void remove(id) }}
          />
          <button
            onClick={() => setServersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-[#a1a1b5] hover:text-[#c4a8ff] border-t"
            style={{ borderColor: "rgba(124,58,237,0.20)" }}
          >
            <ServerIcon className="h-3.5 w-3.5" />
            Servidores ({servers.length})
          </button>
        </div>
      )}

      {(pane === "detail" || pane === "split") && (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {pane === "detail" && (
            <button
              onClick={() => deselect()}
              className="flex items-center gap-1 px-3 py-2 text-[12px] text-[#c4a8ff] border-b shrink-0"
              style={{ borderColor: "rgba(124,58,237,0.20)" }}
            >
              <ChevronLeft className="h-4 w-4" />
              Sessões
            </button>
          )}
          <SessionDetail
            session={selected}
            items={items}
            onSend={(text) => send(selectedId as string, text)}
            onInterrupt={() => interrupt(selectedId as string)}
            onRemove={() => remove(selectedId as string)}
          />
        </div>
      )}

      <NewSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={create} servers={servers} />
      <ServersDialog
        open={serversOpen}
        onOpenChange={setServersOpen}
        servers={servers}
        onChanged={() => void refreshServers()}
      />
    </div>
  )
}
