import type { WireGuardStatus, WgActionResult } from "./wireguard-types"
import { API_BASE, apiFetch } from "./api-base"

export async function getWireguardStatus(): Promise<WireGuardStatus> {
  const r = await apiFetch(`${API_BASE}/api/vpn/wireguard/status`)
  if (!r.ok) throw new Error(`wireguard status falhou: ${r.status}`)
  return (await r.json()) as WireGuardStatus
}

export async function wireguardUp(name: string): Promise<WgActionResult> {
  const r = await apiFetch(`${API_BASE}/api/vpn/wireguard/up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`wireguard up falhou: ${r.status}`)
  return (await r.json()) as WgActionResult
}

export async function wireguardDown(name: string): Promise<WgActionResult> {
  const r = await apiFetch(`${API_BASE}/api/vpn/wireguard/down`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`wireguard down falhou: ${r.status}`)
  return (await r.json()) as WgActionResult
}
