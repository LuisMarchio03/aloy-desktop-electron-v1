"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { QrCode, ExternalLink, X, ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { getTailscaleStatus } from "@/lib/vpn-api"
import { pairedUrl, tailnetWebUrl } from "@/lib/web-access-url"
import { useDevices } from "@/hooks/use-devices"
import { createDevice } from "@/lib/devices-api"

// "última vez" relativa a partir de last_seen (ISO) — "—" quando nulo/inválido.
function relativeTime(iso: string | null): string {
  if (!iso) return "—"
  const diffMs = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diffMs)) return "—"
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return "agora"
  const min = Math.floor(sec / 60)
  if (min < 60) return `há ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `há ${hr} h`
  const day = Math.floor(hr / 24)
  return `há ${day} d`
}

export default function WebAccessButton({ showLabel }: { showLabel: boolean }) {
  const [isElectron, setIsElectron] = useState(false)
  const [open, setOpen] = useState(false)
  const [webOn, setWebOn] = useState(false)
  const [webErr, setWebErr] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  // Lista de dispositivos pareados (só busca quando o modal está aberto e o web está ligado).
  const { devices, error: devicesErr, refresh, revoke, rename } = useDevices(open && webOn)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  // Estado do fluxo de pareamento (token novo → QR); null = mostra a lista.
  const [pairToken, setPairToken] = useState<string | null>(null)
  const [pairing, setPairing] = useState(false)
  const [pairErr, setPairErr] = useState<string | null>(null)

  const [url, setUrl] = useState("")
  const [qr, setQr] = useState("")
  const [mode, setMode] = useState<"lan" | "tailscale">("lan")
  const [tsUrl, setTsUrl] = useState<string | null>(null)
  const [tsQr, setTsQr] = useState("")

  useEffect(() => {
    setIsElectron(typeof window !== "undefined" && !!window.electronAPI?.getLanUrl)
  }, [])

  useEffect(() => {
    if (!open) {
      // ao fechar, a próxima abertura volta pra lista (não fica preso no QR antigo)
      setPairToken(null)
      setPairErr(null)
      setUrl("")
      setQr("")
      setTsUrl(null)
      setTsQr("")
      setMode("lan")
      setEditingId(null)
      setActionErr(null)
      return
    }
    let cancelled = false
    void (async () => {
      const st = await window.electronAPI?.webServer?.status?.().catch(() => null)
      if (!cancelled) { setWebOn(!!st?.running); setWebErr(st?.error ?? null) }
    })()
    return () => { cancelled = true }
  }, [open])

  async function toggleWeb() {
    setToggling(true)
    setWebErr(null)
    try {
      const wasOn = webOn
      const st = wasOn
        ? await window.electronAPI?.webServer?.stop?.()
        : await window.electronAPI?.webServer?.start?.()
      setWebOn(!!st?.running)
      setWebErr(st?.error ?? null)
      if (wasOn) setPairToken(null) // desligou o web → descarta QR pendente
    } catch {
      setWebErr("Falha ao alternar o acesso web.")
    } finally {
      setToggling(false)
    }
  }

  // Cria um device novo, pega o token e monta as URLs/QRs de LAN + Tailscale (igual ao fluxo antigo).
  async function pairNew() {
    setPairing(true)
    setPairErr(null)
    try {
      const { token } = await createDevice()
      if (!token) throw new Error("sem token")
      setPairToken(token)

      const u = (await window.electronAPI?.getLanUrl?.()) ?? ""
      const lan = pairedUrl(u, token)
      setUrl(lan)
      setQr("")
      if (lan) {
        try {
          const d = await QRCode.toDataURL(lan, { width: 220, margin: 1 })
          setQr(d)
        } catch { /* QR opcional */ }
      }

      let tsStatus = null
      try { tsStatus = await getTailscaleStatus() } catch { tsStatus = null }
      const ts = tailnetWebUrl(tsStatus, token)
      setTsUrl(ts)
      if (ts) {
        try {
          const d = await QRCode.toDataURL(ts, { width: 220, margin: 1 })
          setTsQr(d)
        } catch { /* QR opcional */ }
      } else {
        setTsQr("")
        setMode("lan")
      }

      void refresh()
    } catch {
      // volta pra lista (onde o erro é visível) em vez de travar no "Gerando…"
      setPairToken(null)
      setPairErr("Falha ao parear novo dispositivo.")
      void refresh()
    } finally {
      setPairing(false)
    }
  }

  async function handleRevoke(id: string) {
    setActionErr(null)
    try {
      await revoke(id)
    } catch {
      setActionErr("Falha ao revogar dispositivo.")
    }
  }

  function startRename(id: string, currentName: string) {
    setEditingId(id)
    setEditingName(currentName)
  }

  async function commitRename(id: string) {
    const name = editingName.trim()
    setEditingId(null)
    if (!name) return
    setActionErr(null)
    try {
      await rename(id, name)
    } catch {
      setActionErr("Falha ao renomear dispositivo.")
    }
  }

  if (!isElectron) return null

  const activeUrl = mode === "tailscale" && tsUrl ? tsUrl : url
  const activeQr = mode === "tailscale" ? tsQr : qr

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Abrir versão web / celular"
        className="w-full flex items-center gap-1.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-gray-900/60 justify-center"
      >
        <QrCode className="h-3.5 w-3.5 shrink-0" />
        {showLabel && <span>Versão web</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[300px] rounded-xl border border-gray-800 bg-gray-950 p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-white">Abrir no celular</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => void toggleWeb()}
              disabled={toggling}
              className={`mb-3 w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm text-white disabled:opacity-50 ${webOn ? "bg-green-700/70 hover:bg-green-700" : "bg-gray-700/70 hover:bg-gray-700"}`}
            >
              {webOn ? "Acesso web ligado — desativar" : "Ativar acesso web"}
            </button>

            {webErr && <p className="mb-2 text-[11px] text-red-400">{webErr}</p>}

            {webOn ? (
              pairToken ? (
                <>
                  <button
                    onClick={() => setPairToken(null)}
                    className="mb-3 flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </button>
                  {tsUrl && (
                    <div className="mb-3 flex rounded-md overflow-hidden border border-gray-800 text-xs">
                      <button
                        onClick={() => setMode("lan")}
                        className={`flex-1 py-1.5 ${mode === "lan" ? "bg-purple-700/80 text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        Rede local
                      </button>
                      <button
                        onClick={() => setMode("tailscale")}
                        className={`flex-1 py-1.5 ${mode === "tailscale" ? "bg-purple-700/80 text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        Tailscale
                      </button>
                    </div>
                  )}
                  {activeQr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeQr} alt="QR code da versão web" className="mx-auto rounded bg-white p-2" width={220} height={220} />
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-xs text-gray-500">Gerando…</div>
                  )}
                  <div className="mt-3 text-xs text-gray-400 break-all">{activeUrl || "—"}</div>
                  <button
                    onClick={() => { if (activeUrl) void window.electronAPI?.openExternal?.(activeUrl) }}
                    disabled={!activeUrl}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-md bg-purple-700/80 hover:bg-purple-700 text-white text-sm disabled:opacity-50"
                  >
                    <ExternalLink className="h-4 w-4" /> Abrir no navegador
                  </button>
                  <p className="mt-3 text-[10px] text-gray-600">
                    {mode === "tailscale"
                      ? "De qualquer lugar — o celular precisa ter o Tailscale ligado e no mesmo tailnet."
                      : "O celular precisa estar na mesma rede Wi-Fi."}
                  </p>
                  <p className="mt-2 text-[10px] text-gray-600">Este QR contém a credencial de acesso — compartilhe só com seu aparelho.</p>
                </>
              ) : (
                <>
                  <div className="mb-3 max-h-[220px] overflow-y-auto text-left">
                    {devices.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-500">Nenhum dispositivo pareado</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {devices.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-2 rounded-md bg-gray-900/60 px-2.5 py-1.5">
                            <div className="min-w-0 flex-1">
                              {editingId === d.id ? (
                                <input
                                  autoFocus
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onBlur={() => void commitRename(d.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") void commitRename(d.id)
                                    if (e.key === "Escape") setEditingId(null)
                                  }}
                                  className="w-full rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white outline-none"
                                />
                              ) : (
                                <p className="truncate text-xs text-white">{d.name || "Sem nome"}</p>
                              )}
                              <p className="text-[10px] text-gray-500">{relativeTime(d.last_seen)}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button onClick={() => startRename(d.id, d.name)} title="Renomear" className="text-gray-500 hover:text-white">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => void handleRevoke(d.id)} title="Revogar" className="text-gray-500 hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {devicesErr && <p className="mb-2 text-[11px] text-red-400">{devicesErr}</p>}
                  {actionErr && <p className="mb-2 text-[11px] text-red-400">{actionErr}</p>}
                  {pairErr && <p className="mb-2 text-[11px] text-red-400">{pairErr}</p>}
                  <button
                    onClick={() => void pairNew()}
                    disabled={pairing}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-purple-700/80 hover:bg-purple-700 text-white text-sm disabled:opacity-50"
                  >
                    <QrCode className="h-4 w-4" /> {pairing ? "Pareando…" : "Parear novo dispositivo"}
                  </button>
                </>
              )
            ) : (
              <p className="py-8 text-xs text-gray-500">Ative o acesso web pra conectar o celular pelo QR.</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
