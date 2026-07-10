"use client"

import { useEffect, useRef, useState } from "react"
import { Square, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { SessionState, TranscriptItem } from "@/lib/sessions-types"
import { STATUS_META } from "./session-card"
import { SessionStatusline } from "./session-statusline"
import { TranscriptView } from "./transcript-view"
import { SteeringInput } from "./steering-input"

export function SessionDetail({
  session,
  items,
  onSend,
  onInterrupt,
  onRemove,
}: {
  session: SessionState | null
  items: TranscriptItem[]
  onSend: (text: string) => Promise<void>
  onInterrupt: () => Promise<void>
  onRemove: () => Promise<void>
}) {
  const endRef = useRef<HTMLDivElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [items])

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-[#a1a1b5]">
          Selecione uma sessão ou crie uma nova pra começar.
        </p>
      </div>
    )
  }

  const meta = STATUS_META[session.status]
  const isWorking = session.status === "working"
  const ended = session.status === "stopped" || session.status === "failed"

  async function handleSend(text: string) {
    try {
      await onSend(text)
    } catch {
      toast.error("Falha ao enviar a mensagem.")
    }
  }

  async function handleInterrupt() {
    try {
      await onInterrupt()
      toast.success("Interrupção enviada.")
    } catch {
      toast.error("Falha ao interromper.")
    }
  }

  async function handleRemove() {
    try {
      await onRemove()
    } catch {
      toast.error("Falha ao remover a sessão.")
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div
        className="flex items-start gap-3 px-4 py-3 border-b"
        style={{ borderColor: "rgba(124,58,237,0.20)" }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
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
          </div>
          <h2 className="mt-1 text-sm font-semibold text-[#ededf5] truncate">{session.task}</h2>
          <p className="text-[11px] font-mono text-[#8b8ba7] truncate">{session.cwd}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleInterrupt()}
            disabled={ended}
            className="h-8 px-2 text-xs"
            style={{
              borderColor: "#f87171",
              color: "#f87171",
              background: "transparent",
            }}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            Interromper
          </Button>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                style={{
                  borderColor: "#f87171",
                  color: "#f87171",
                  background: "transparent",
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remover
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
              className="text-[#ededf5]"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#ededf5]">
                  Remover esta sessão?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#a1a1b5]">
                  Isso para e descarta a sessão permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  style={{ borderColor: "rgba(124,58,237,0.20)", color: "#a1a1b5", background: "transparent" }}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleRemove()}
                  style={{ background: "#f87171", color: "#0a0a12" }}
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <SessionStatusline session={session} items={items} />

      <ScrollArea className="flex-1">
        <TranscriptView items={items} />
        <div ref={endRef} />
      </ScrollArea>

      <SteeringInput disabled={ended} onSend={handleSend} />
    </div>
  )
}
