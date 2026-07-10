"use client"

import { useState } from "react"
import { Plug, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Server } from "@/lib/sessions-types"
import { addServer, deleteServer, testServer, updateServer } from "@/lib/sessions-api"

const KINDS = [
  { value: "opencode", label: "opencode (servidor opencode)" },
  { value: "aloy", label: "aloy (aloy-brain em outro PC)" },
]

const FIELD_STYLE = { background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }

export function ServersDialog({
  open,
  onOpenChange,
  servers,
  onChanged,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  servers: Server[]
  onChanged: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [kind, setKind] = useState("opencode")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)

  function resetForm() {
    setEditingId(null)
    setName("")
    setUrl("")
    setKind("opencode")
    setUsername("")
    setPassword("")
    setToken("")
  }

  function startEdit(s: Server) {
    // segredos não vêm da API — ficam em branco; reinformar só se for trocar.
    setEditingId(s.id)
    setName(s.name)
    setUrl(s.url)
    setKind(s.kind)
    setUsername("")
    setPassword("")
    setToken("")
  }

  async function submit() {
    if (!name.trim() || !url.trim() || busy) return
    setBusy(true)
    const body = {
      name: name.trim(),
      url: url.trim(),
      kind,
      username: kind === "opencode" && username ? username : null,
      password: kind === "opencode" && password ? password : null,
      token: kind === "aloy" && token ? token : null,
    }
    try {
      if (editingId) {
        await updateServer(editingId, body)
        toast.success("Servidor atualizado.")
      } else {
        await addServer(body)
        toast.success("Servidor adicionado.")
      }
      resetForm()
      onChanged()
    } catch {
      toast.error(editingId ? "Falha ao atualizar o servidor." : "Falha ao adicionar (nome duplicado?).")
    } finally {
      setBusy(false)
    }
  }

  async function handleTest(id: string) {
    try {
      const h = await testServer(id)
      if (h.online) toast.success(`Online${h.version ? ` · ${h.version}` : ""}`)
      else toast.error("Offline / inalcançável")
    } catch {
      toast.error("Falha ao testar.")
    }
    onChanged()
  }

  async function handleDelete(id: string) {
    try {
      await deleteServer(id)
      toast.success("Servidor removido.")
      if (editingId === id) resetForm()
      onChanged()
    } catch {
      toast.error("Falha ao remover.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent
        className="text-[#ededf5] max-w-lg"
        style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#ededf5]">Servidores</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
          {servers.length === 0 && (
            <p className="text-[12px] text-[#a1a1b5]">Nenhum servidor ainda.</p>
          )}
          {servers.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
              style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ background: s.online ? "#a855f7" : "#6b6b80" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#ededf5] truncate">{s.name}</span>
                  <span className="text-[9px] font-mono uppercase text-[#8b8ba7]">{s.kind}</span>
                  <span className="text-[9px] font-mono uppercase text-[#7c8aff]">{s.source}</span>
                </div>
                <div className="text-[10px] font-mono text-[#8b8ba7] truncate">{s.url}</div>
              </div>
              <button
                onClick={() => void handleTest(s.id)}
                aria-label="Testar"
                className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
              >
                <Plug className="h-3.5 w-3.5" />
              </button>
              {s.editable && (
                <>
                  <button
                    onClick={() => startEdit(s)}
                    aria-label="Editar"
                    className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void handleDelete(s.id)}
                    aria-label="Remover"
                    className="p-1 rounded text-[#a1a1b5] hover:text-[#f87171]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t pt-3" style={{ borderColor: "rgba(124,58,237,0.20)" }}>
          <p className="text-[11px] font-semibold text-[#c4a8ff]">
            {editingId ? `Editando: ${editingId}` : "Adicionar servidor"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-[#a1a1b5]">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!!editingId}
                placeholder="casa / pcb" className="text-[13px] text-[#ededf5]" style={FIELD_STYLE} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-[#a1a1b5]">Tipo</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="text-[13px] text-[#ededf5]" style={FIELD_STYLE}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-[#ededf5]" style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}>
                  {KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#a1a1b5]">URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="http://192.168.0.30:8080" className="text-[13px] font-mono text-[#ededf5]" style={FIELD_STYLE} />
          </div>
          {kind === "opencode" ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-[#a1a1b5]">Usuário (opcional)</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)}
                  className="text-[13px] text-[#ededf5]" style={FIELD_STYLE} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#a1a1b5]">Senha (opcional)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="text-[13px] text-[#ededf5]" style={FIELD_STYLE} />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-[11px] text-[#a1a1b5]">Token (opcional)</Label>
              <Input type="password" value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="ALOY_SESSIONS_WORKER_TOKEN do PC-B" className="text-[13px] text-[#ededf5]" style={FIELD_STYLE} />
            </div>
          )}
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button variant="outline" onClick={resetForm}
                style={{ borderColor: "rgba(124,58,237,0.20)", color: "#a1a1b5", background: "transparent" }}>
                Cancelar
              </Button>
            )}
            <Button onClick={() => void submit()} disabled={busy || !name.trim() || !url.trim()}
              className="text-white border-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 0 14px rgba(168,85,247,0.45)" }}>
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
