import { API_BASE, apiFetch } from "./api-base"
import type { MemoryData, MemoryFact } from "./memory-types"

export async function getMemoryFacts(): Promise<MemoryData> {
  const r = await apiFetch(`${API_BASE}/api/memory/facts`)
  if (!r.ok) throw new Error(`memory facts falhou: ${r.status}`)
  const d = await r.json()
  return { enabled: Boolean(d.enabled), facts: (d.facts ?? []) as MemoryFact[] }
}
