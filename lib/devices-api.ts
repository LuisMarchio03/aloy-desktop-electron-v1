import { API_BASE, apiFetch } from "./api-base"
import type { Device, NewDevice } from "./devices-types"

export async function listDevices(): Promise<Device[]> {
  const r = await apiFetch(`${API_BASE}/api/devices`)
  if (!r.ok) throw new Error(`devices list falhou: ${r.status}`)
  return ((await r.json()) as { devices: Device[] }).devices
}

export async function createDevice(name = ""): Promise<NewDevice> {
  const r = await apiFetch(`${API_BASE}/api/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`parear falhou: ${r.status}`)
  return (await r.json()) as NewDevice
}

export async function deleteDevice(id: string): Promise<void> {
  const r = await apiFetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}`, { method: "DELETE" })
  if (!r.ok) throw new Error(`revogar falhou: ${r.status}`)
}

export async function renameDevice(id: string, name: string): Promise<void> {
  const r = await apiFetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`renomear falhou: ${r.status}`)
}
