"use client"

import { useState } from "react"
import { Network, RefreshCw, Shield, ShieldOff, Wifi, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVpn } from "@/hooks/use-vpn"
import { useWireguard } from "@/hooks/use-wireguard"
import type { TailscaleNode } from "@/lib/vpn-types"
import type { WgPeer } from "@/lib/wireguard-types"

function NodeRow({
  node,
  isSelf,
  busy,
  confirming,
  onAskConfirm,
  onCancelConfirm,
  onSetExit,
  onClearExit,
}: {
  node: TailscaleNode
  isSelf?: boolean
  busy?: boolean
  confirming?: boolean
  onAskConfirm?: () => void
  onCancelConfirm?: () => void
  onSetExit?: () => void
  onClearExit?: () => void
}) {
  const canExit = !isSelf && node.exit_node_option
  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2"
      style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: node.online ? "#34d399" : "#6b7280" }}
        title={node.online ? "online" : "offline"}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-[#ededf5] truncate">
          {node.hostname || node.dns_name || node.id}
          {isSelf && <span className="ml-1.5 text-[10px] text-[#c4a8ff]">(este dispositivo)</span>}
          {node.exit_node && (
            <span className="ml-1.5 text-[10px] text-[#34d399]">exit-node ativo</span>
          )}
          {!node.exit_node && node.exit_node_option && (
            <span className="ml-1.5 text-[10px] text-[#8b8ba7]">exit-node</span>
          )}
        </div>
        <div className="text-[10px] font-mono text-[#8b8ba7] truncate">
          {node.ips.join(" · ") || "—"} {node.os ? `· ${node.os}` : ""}
        </div>
      </div>
      {canExit && node.exit_node && (
        <button
          onClick={onClearExit}
          disabled={busy}
          className="shrink-0 text-[11px] text-[#a1a1b5] hover:text-[#f87171] disabled:opacity-50"
        >
          Desativar
        </button>
      )}
      {canExit && !node.exit_node && !confirming && (
        <button
          onClick={onAskConfirm}
          disabled={busy || !node.online}
          className="shrink-0 text-[11px] text-[#c4a8ff] hover:text-[#e9d5ff] disabled:opacity-50"
        >
          Usar como exit-node
        </button>
      )}
      {canExit && !node.exit_node && confirming && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onSetExit}
            disabled={busy}
            className="text-[11px] text-[#34d399] hover:text-[#6ee7b7] disabled:opacity-50"
          >
            Confirmar
          </button>
          <button onClick={onCancelConfirm} className="text-[11px] text-[#a1a1b5] hover:text-[#c4a8ff]">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

function fmtLastSeen(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString()
}

function fmtHandshake(epochSeconds: number): string {
  if (!epochSeconds) return "nunca"
  const diffMs = Date.now() - epochSeconds * 1000
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `há ${diffSec}s`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `há ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `há ${diffD}d`
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function PeerRow({ peer }: { peer: WgPeer }) {
  return (
    <div className="text-[10px] font-mono text-[#8b8ba7] truncate">
      {peer.endpoint ?? "sem endpoint"} · handshake {fmtHandshake(peer.latest_handshake)} · ↓
      {fmtBytes(peer.rx_bytes)} ↑{fmtBytes(peer.tx_bytes)}
    </div>
  )
}

function WireGuardPanel() {
  const { status, loading, error, refresh, up, down } = useWireguard()
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmDownName, setConfirmDownName] = useState<string | null>(null)

  const available = status?.available !== false
  const interfaces = status?.interfaces ?? []

  async function onUp() {
    if (!name.trim()) return
    setBusy(true)
    try {
      const r = await up(name.trim()).catch(() => null)
      if (r?.ok) {
        toast.success(`Túnel ${name.trim()} conectado`)
        setName("")
      } else {
        toast.error(r?.message || "Falha ao conectar túnel.")
      }
    } finally {
      setBusy(false)
    }
  }

  async function onDown(ifaceName: string) {
    setConfirmDownName(null)
    setBusy(true)
    try {
      const r = await down(ifaceName).catch(() => null)
      if (r?.ok) toast.success(`Túnel ${ifaceName} desconectado`)
      else toast.error(r?.message || "Falha ao desconectar túnel.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#c4a8ff]">
          <Network className="h-4 w-4" />
          WireGuard
        </h2>
        <button
          onClick={() => void refresh()}
          className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
          aria-label="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-[12px] text-[#f87171]">{error}</p>}

      {status && !status.available && (
        <p className="text-[12px] text-[#f87171]">
          WireGuard indisponível{status.error ? `: ${status.error}` : ""}. Verifique se o kernel
          tem a integração habilitada.
        </p>
      )}

      {loading && !status && <p className="text-[12px] text-[#a1a1b5]">carregando…</p>}

      {available && status && interfaces.length === 0 && (
        <p className="text-[12px] text-[#a1a1b5]">Nenhum túnel ativo.</p>
      )}

      {interfaces.map((iface) => (
        <div
          key={iface.name}
          className="rounded-lg border px-3 py-2 space-y-1.5"
          style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono text-[#ededf5]">{iface.name}</span>
            {confirmDownName !== iface.name ? (
              <button
                onClick={() => setConfirmDownName(iface.name)}
                disabled={busy}
                className="shrink-0 text-[11px] text-[#a1a1b5] hover:text-[#f87171] disabled:opacity-50"
              >
                Desconectar
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => void onDown(iface.name)}
                  disabled={busy}
                  className="text-[11px] text-[#f87171] hover:text-[#fca5a5] disabled:opacity-50"
                >
                  Confirmar desconexão
                </button>
                <button
                  onClick={() => setConfirmDownName(null)}
                  className="text-[11px] text-[#a1a1b5] hover:text-[#c4a8ff]"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-[#8b8ba7]">
            porta {iface.listen_port} · {iface.peers.length} peer(s)
          </div>
          {iface.peers.map((p) => (
            <PeerRow key={p.public_key} peer={p} />
          ))}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nome do túnel (ex: wg0)"
          disabled={busy || !available}
          className="h-8 flex-1 border-[rgba(124,58,237,0.35)] bg-transparent text-[13px] text-[#ededf5] placeholder:text-[#6b6b85]"
        />
        <Button
          onClick={() => void onUp()}
          disabled={busy || !available || !name.trim()}
          className="text-white border-0 h-8"
          style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
        >
          Conectar
        </Button>
      </div>
    </div>
  )
}

export default function VpnSection() {
  const { status, devices, busy, refresh, up, down, setExitNode, clearExitNode } = useVpn()
  const [confirmDown, setConfirmDown] = useState(false)
  const [confirmExitId, setConfirmExitId] = useState<string | null>(null)

  const available = status?.available !== false
  const running = status?.backend_state === "Running"
  const self = status?.self ?? null
  const peers = status?.peers ?? []
  const activeExit = peers.find((p) => p.exit_node) ?? null

  async function onUp() {
    const r = await up().catch(() => null)
    if (r?.ok) toast.success("Conectado ao Tailscale")
    else toast.error(r?.message || "Falha ao conectar.")
  }

  async function onDown() {
    setConfirmDown(false)
    const r = await down().catch(() => null)
    if (r?.ok) toast.success("Desconectado do Tailscale")
    else toast.error(r?.message || "Falha ao desconectar.")
  }

  async function onSetExit(node: TailscaleNode) {
    setConfirmExitId(null)
    const target = node.ips[0] ?? node.dns_name ?? ""
    if (!target) {
      toast.error("Peer sem IP para usar como exit-node.")
      return
    }
    const r = await setExitNode(target).catch(() => null)
    if (r?.ok) toast.success(`Exit-node: ${node.hostname || target}`)
    else toast.error(r?.message || "Falha ao definir exit-node.")
  }

  async function onClearExit() {
    const r = await clearExitNode().catch(() => null)
    if (r?.ok) toast.success("Exit-node desativado")
    else toast.error(r?.message || "Falha ao desativar exit-node.")
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black text-[#ededf5]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Estado + ações */}
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#c4a8ff]">
              {running ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              Tailscale
            </h2>
            <button
              onClick={() => void refresh()}
              className="p-1 rounded text-[#a1a1b5] hover:text-[#c4a8ff]"
              aria-label="Atualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {status?.available === false && (
            <p className="text-[12px] text-[#f87171]">
              Tailscale indisponível{status.error ? `: ${status.error}` : ""}. Verifique se o
              daemon está rodando e se a VPN está habilitada no kernel (ALOY_VPN_ENABLED=1).
            </p>
          )}

          {status?.available !== false && (
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#a1a1b5]">
              <span>
                Estado:{" "}
                <span style={{ color: running ? "#34d399" : "#f87171" }}>
                  {status?.backend_state ?? "—"}
                </span>
              </span>
              {status?.tailnet && <span>· tailnet {status.tailnet}</span>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void onUp()}
              disabled={busy || running || !available}
              className="text-white border-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Conectar
            </Button>
            {!confirmDown ? (
              <Button
                variant="outline"
                onClick={() => setConfirmDown(true)}
                disabled={busy || !running || !available}
                className="border-[rgba(124,58,237,0.35)] bg-transparent text-[#ededf5]"
              >
                <ShieldOff className="h-4 w-4 mr-1.5" />
                Desconectar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => void onDown()}
                  disabled={busy}
                  className="border-[#f87171]/50 bg-transparent text-[#f87171]"
                >
                  Confirmar desconexão
                </Button>
                <button
                  onClick={() => setConfirmDown(false)}
                  className="text-[12px] text-[#a1a1b5] hover:text-[#c4a8ff]"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-[#8b8ba7]">
            Desconectar sai do tailnet e pode derrubar o acesso remoto a outros dispositivos ALOY.
          </p>

          {activeExit && (
            <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "rgba(52,211,153,0.30)", background: "rgba(16,32,26,0.6)" }}
            >
              <span className="min-w-0 truncate text-[12px] text-[#a1a1b5]">
                Exit-node ativo:{" "}
                <span className="text-[#34d399]">
                  {activeExit.hostname || activeExit.dns_name || activeExit.ips[0] || activeExit.id}
                </span>
              </span>
              <button
                onClick={() => void onClearExit()}
                disabled={busy}
                className="shrink-0 text-[11px] text-[#a1a1b5] hover:text-[#f87171] disabled:opacity-50"
              >
                Desativar
              </button>
            </div>
          )}
        </div>

        {/* Este dispositivo */}
        {self && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#c4a8ff]">Este dispositivo</h2>
            <NodeRow node={self} isSelf />
          </div>
        )}

        {/* Outros dispositivos */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#c4a8ff]">Dispositivos no tailnet</h2>
          {peers.length === 0 && (
            <p className="text-[12px] text-[#a1a1b5]">Nenhum outro dispositivo.</p>
          )}
          {peers.map((p) => (
            <NodeRow
              key={p.id ?? p.hostname ?? p.dns_name}
              node={p}
              busy={busy}
              confirming={confirmExitId === (p.id ?? p.hostname ?? p.dns_name)}
              onAskConfirm={() => setConfirmExitId(p.id ?? p.hostname ?? p.dns_name)}
              onCancelConfirm={() => setConfirmExitId(null)}
              onSetExit={() => void onSetExit(p)}
              onClearExit={() => void onClearExit()}
            />
          ))}
        </div>

        {/* Inventário completo do tailnet (REST API) — inclui offline + últ. visto */}
        {devices?.available && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#c4a8ff]">Inventário do tailnet (API)</h2>
            {devices.devices.map((dv) => (
              <div
                key={dv.id ?? dv.name ?? dv.hostname}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
                style={{ borderColor: "rgba(124,58,237,0.20)", background: "rgba(20,18,31,0.6)" }}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: dv.online ? "#34d399" : "#6b7280" }}
                  title={dv.online ? "conectado" : "desconectado"}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[#ededf5] truncate">
                    {dv.hostname || dv.name || dv.id}
                    {dv.update_available && (
                      <span className="ml-1.5 text-[10px] text-[#fbbf24]">atualização disponível</span>
                    )}
                    {dv.is_external && (
                      <span className="ml-1.5 text-[10px] text-[#8b8ba7]">compartilhado</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#8b8ba7] truncate">
                    {(dv.addresses[0] ?? "—")} · {dv.os ?? "?"} · visto {fmtLastSeen(dv.last_seen)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WireGuard */}
        <WireGuardPanel />
      </div>
    </div>
  )
}
