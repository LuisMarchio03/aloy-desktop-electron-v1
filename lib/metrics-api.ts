import { WS_BASE } from "./api-base"
import type { MetricsSnapshot } from "./metrics-types"

export const METRICS_WS_URL = `${WS_BASE}/ws/metrics`

export function parseMetricsFrame(data: string): MetricsSnapshot | null {
  try {
    const o = JSON.parse(data) as unknown
    if (typeof o !== "object" || o === null) return null
    if (typeof (o as MetricsSnapshot).cpu_percent !== "number") return null
    return o as MetricsSnapshot
  } catch {
    return null
  }
}

export function formatUptime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${total}s`
}
