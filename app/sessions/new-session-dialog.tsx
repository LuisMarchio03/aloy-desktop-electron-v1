"use client"

import { useState } from "react"
import { FolderOpen } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Platform, Server } from "@/lib/sessions-types"

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "claude-code", label: "Claude Code" },
  { value: "opencode", label: "opencode" },
]

const MODELS_BY_PLATFORM: Record<Platform, { value: string; label: string }[]> = {
  "claude-code": [
    { value: "default", label: "Padrão (do backend)" },
    { value: "claude-opus-4-8", label: "Opus 4.8" },
    { value: "claude-sonnet-4-6", label: "Sonnet 4.6" },
    { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
  ],
  "opencode": [
    { value: "default", label: "Padrão (do servidor opencode)" },
    { value: "anthropic/claude-opus-4-8", label: "Anthropic · Opus 4.8" },
    { value: "anthropic/claude-sonnet-4-6", label: "Anthropic · Sonnet 4.6" },
    { value: "openai/gpt-5", label: "OpenAI · GPT-5" },
  ],
}

export function NewSessionDialog({
  open,
  onOpenChange,
  onCreate,
  servers,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (body: { task: string; cwd: string; model?: string | null; platform?: string; server?: string | null }) => Promise<string>
  servers: Server[]
}) {
  const [task, setTask] = useState("")
  const [cwd, setCwd] = useState("")
  const [platform, setPlatform] = useState<Platform>("claude-code")
  const [model, setModel] = useState("default")
  const [server, setServer] = useState("local")
  const [busy, setBusy] = useState(false)

  async function browse() {
    const picker = typeof window !== "undefined" ? window.electronAPI?.pickFolder : undefined
    if (!picker) {
      toast.message("Seletor nativo indisponível fora do Electron — digite o caminho.")
      return
    }
    const dir = await picker()
    if (dir) setCwd(dir)
  }

  async function submit() {
    if (!task.trim() || !cwd.trim() || busy) return
    setBusy(true)
    try {
      await onCreate({
        task: task.trim(),
        cwd: cwd.trim(),
        model: model === "default" ? null : model,
        platform,
        server,
      })
      setTask("")
      setCwd("")
      setPlatform("claude-code")
      setModel("default")
      setServer("local")
      onOpenChange(false)
    } catch {
      toast.error("Falha ao criar a sessão. O backend está rodando?")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="text-[#ededf5]"
        style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#ededf5]">Nova sessão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-[#a1a1b5]">Tarefa</Label>
            <Textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="O que o Claude Code deve fazer…"
              className="min-h-[80px] text-[13px] text-[#ededf5]"
              style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-[#a1a1b5]">Pasta (cwd)</Label>
            <div className="flex gap-2">
              <Input
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
                placeholder="/home/.../projeto"
                className="text-[13px] font-mono text-[#ededf5]"
                style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void browse()}
                className="shrink-0"
                style={{ borderColor: "rgba(124,58,237,0.20)", color: "#a1a1b5" }}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-[#a1a1b5]">Plataforma</Label>
            <Select
              value={platform}
              onValueChange={(v) => { setPlatform(v as Platform); setModel("default") }}
            >
              <SelectTrigger
                className="text-[13px] text-[#ededf5]"
                style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="text-[#ededf5]"
                style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-[#a1a1b5]">Modelo</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger
                className="text-[13px] text-[#ededf5]"
                style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="text-[#ededf5]"
                style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                {MODELS_BY_PLATFORM[platform].map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-[#a1a1b5]">Servidor</Label>
            <Select value={server} onValueChange={setServer}>
              <SelectTrigger
                className="text-[13px] text-[#ededf5]"
                style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="text-[#ededf5]"
                style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
              >
                {servers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}{s.online ? "" : " (offline)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void submit()}
            disabled={busy || !task.trim() || !cwd.trim()}
            className="text-white border-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #9333ea)",
              boxShadow: "0 0 14px rgba(168,85,247,0.45)",
            }}
          >
            Criar sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
