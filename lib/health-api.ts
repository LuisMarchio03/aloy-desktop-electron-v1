import { API_BASE, apiFetch } from "./api-base"
import type { HealthStatus } from "./health-types"

export async function getHealth(): Promise<HealthStatus> {
  const r = await apiFetch(`${API_BASE}/health`)
  if (!r.ok) throw new Error(`health falhou: ${r.status}`)
  return (await r.json()) as HealthStatus
}
