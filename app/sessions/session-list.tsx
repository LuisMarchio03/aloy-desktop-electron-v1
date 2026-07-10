"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SessionState } from "@/lib/sessions-types"
import { SessionCard } from "./session-card"

export function SessionList({
  sessions,
  selectedId,
  onSelect,
  onNew,
  onRemove,
}: {
  sessions: SessionState[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div
      className="flex flex-col h-full w-full md:w-[300px] md:border-r"
      style={{ borderColor: "rgba(124,58,237,0.20)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-3 border-b"
        style={{ borderColor: "rgba(124,58,237,0.20)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-[#ededf5]">
          Sessões
        </span>
        <Button
          size="sm"
          onClick={onNew}
          className="h-7 px-2 text-xs text-white border-0"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            boxShadow: "0 0 14px rgba(168,85,247,0.45)",
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nova
        </Button>
      </div>
      <ScrollArea className="flex-1 p-3">
        {sessions.length === 0 ? (
          <p className="text-[11px] text-[#a1a1b5] mt-4 text-center">
            Nenhuma sessão. Crie uma com "+ Nova".
          </p>
        ) : (
          sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              selected={s.id === selectedId}
              onSelect={() => onSelect(s.id)}
              onRemove={() => onRemove(s.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  )
}
