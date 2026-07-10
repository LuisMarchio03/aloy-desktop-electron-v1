"use client"

import { useEffect, useRef, useState } from "react"
import { Download, RefreshCw, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFiles } from "@/hooks/use-files"
import { fileDownloadUrl, remoteFileDownloadUrl } from "@/lib/files-api"

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function FilesSection() {
  const {
    files,
    devices,
    remoteFiles,
    remoteError,
    remoteLoading,
    refresh,
    refreshRemote,
    sendResumable,
    remove,
    removeRemote,
  } = useFiles()
  const [device, setDevice] = useState("")
  const [remoteDevice, setRemoteDevice] = useState("")
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void refreshRemote(remoteDevice)
  }, [remoteDevice, refreshRemote])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ""
    if (!file) return
    if (!device) {
      toast.error("Escolha um dispositivo de destino.")
      return
    }
    setBusy(true)
    setProgress(0)
    try {
      await sendResumable(device, file, (frac) => setProgress(frac))
      toast.success(`Enviado "${file.name}" para ${device}`)
    } catch {
      toast.error("Falha ao enviar (dispositivo offline?).")
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black text-[#ededf5]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Enviar */}
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
        >
          <h2 className="text-sm font-semibold text-[#c4a8ff]">Enviar arquivo para um dispositivo</h2>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] text-[#a1a1b5]">Dispositivo (aloy-brain)</label>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger
                  className="text-[13px] text-[#ededf5]"
                  style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
                >
                  <SelectValue placeholder={devices.length ? "Escolher…" : "Nenhum dispositivo aloy"} />
                </SelectTrigger>
                <SelectContent
                  className="text-[#ededf5]"
                  style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
                >
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}{d.online ? "" : " (offline)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input ref={inputRef} type="file" className="hidden" onChange={(e) => void onPick(e)} />
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={busy || !device}
              className="text-white border-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
            >
              <Send className="h-4 w-4 mr-1.5" />
              {busy ? "Enviando…" : "Escolher e enviar"}
            </Button>
          </div>
          {busy && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(124,58,237,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  }}
                />
              </div>
              <p className="text-[10px] text-[#8b8ba7]">Enviando… {Math.round(progress * 100)}% (resumível em chunks)</p>
            </div>
          )}
          <p className="text-[10px] text-[#8b8ba7]">
            O arquivo vai para o inbox do dispositivo escolhido (via este PC como intermediário), em chunks
            resumáveis — se a conexão cair, retoma de onde parou.
          </p>
        </div>

        {/* Recebidos (inbox local) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#c4a8ff]">Recebidos neste PC</h2>
            <button
              onClick={() => void refresh()}
              className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
              aria-label="Atualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          {files.length === 0 && (
            <p className="text-[12px] text-[#a1a1b5]">Nenhum arquivo recebido ainda.</p>
          )}
          {files.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-[#ededf5] truncate">{f.name}</div>
                <div className="text-[10px] font-mono text-[#8b8ba7]">{fmtSize(f.size)}</div>
              </div>
              <a
                href={fileDownloadUrl(f.name)}
                download
                className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
                aria-label="Baixar"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => void remove(f.name)}
                className="p-1 rounded text-[#a1a1b5] hover:text-[#f87171]"
                aria-label="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Inbox remoto (browse/download de outro dispositivo) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#c4a8ff]">Inbox de outro dispositivo</h2>
            <div className="flex items-center gap-2">
              <Select value={remoteDevice} onValueChange={setRemoteDevice}>
                <SelectTrigger
                  className="h-8 text-[12px] text-[#ededf5] min-w-[10rem]"
                  style={{ background: "#0b0b12", borderColor: "rgba(124,58,237,0.20)" }}
                >
                  <SelectValue placeholder={devices.length ? "Escolher…" : "Nenhum dispositivo aloy"} />
                </SelectTrigger>
                <SelectContent
                  className="text-[#ededf5]"
                  style={{ background: "#0a0a12", borderColor: "rgba(124,58,237,0.20)" }}
                >
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}{d.online ? "" : " (offline)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => void refreshRemote(remoteDevice)}
                disabled={!remoteDevice}
                className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff] disabled:opacity-40"
                aria-label="Atualizar inbox remoto"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          {!remoteDevice && (
            <p className="text-[12px] text-[#a1a1b5]">
              Escolha um dispositivo para ver e baixar os arquivos do inbox dele.
            </p>
          )}
          {remoteDevice && remoteLoading && (
            <p className="text-[12px] text-[#a1a1b5]">Carregando…</p>
          )}
          {remoteDevice && !remoteLoading && remoteError && (
            <p className="text-[12px] text-[#f87171]">
              Não foi possível ler o inbox (dispositivo offline?).
            </p>
          )}
          {remoteDevice && !remoteLoading && !remoteError && remoteFiles.length === 0 && (
            <p className="text-[12px] text-[#a1a1b5]">O inbox desse dispositivo está vazio.</p>
          )}
          {remoteDevice &&
            !remoteError &&
            remoteFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[#ededf5] truncate">{f.name}</div>
                  <div className="text-[10px] font-mono text-[#8b8ba7]">{fmtSize(f.size)}</div>
                </div>
                <a
                  href={remoteFileDownloadUrl(remoteDevice, f.name)}
                  download
                  className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
                  aria-label="Baixar"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => {
                    void removeRemote(remoteDevice, f.name).catch(() =>
                      toast.error("Falha ao excluir no dispositivo remoto."),
                    )
                  }}
                  className="p-1 rounded text-[#a1a1b5] hover:text-[#f87171]"
                  aria-label="Excluir no dispositivo remoto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
