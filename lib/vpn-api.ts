import type { TailnetDevices, TailscaleStatus, VpnActionResult } from "./vpn-types"
import { API_BASE, apiFetch } from "./api-base"

export const VPN_HTTP_BASE = API_BASE

export async function getTailscaleStatus(): Promise<TailscaleStatus> {
  const r = await apiFetch(`${VPN_HTTP_BASE}/api/vpn/tailscale/status`)
  if (!r.ok) throw new Error(`vpn status falhou: ${r.status}`)
  return (await r.json()) as TailscaleStatus
}

export async function tailscaleUp(): Promise<VpnActionResult> {
  const r = await apiFetch(`${VPN_HTTP_BASE}/api/vpn/tailscale/up`, { method: "POST" })
  if (!r.ok) throw new Error(`vpn up falhou: ${r.status}`)
  return (await r.json()) as VpnActionResult
}

export async function tailscaleDown(): Promise<VpnActionResult> {
  const r = await apiFetch(`${VPN_HTTP_BASE}/api/vpn/tailscale/down`, { method: "POST" })
  if (!r.ok) throw new Error(`vpn down falhou: ${r.status}`)
  return (await r.json()) as VpnActionResult
}

export async function getTailnetDevices(): Promise<TailnetDevices> {
  const r = await apiFetch(`${VPN_HTTP_BASE}/api/vpn/tailscale/devices`)
  if (!r.ok) throw new Error(`vpn devices falhou: ${r.status}`)
  return (await r.json()) as TailnetDevices
}

export async function setExitNode(node: string): Promise<VpnActionResult> {
  const r = await apiFetch(`${VPN_HTTP_BASE}/api/vpn/tailscale/exit-node`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node }),
  })
  if (!r.ok) throw new Error(`vpn exit-node falhou: ${r.status}`)
  return (await r.json()) as VpnActionResult
}

export async function clearExitNode(): Promise<VpnActionResult> {
  return setExitNode("")
}
