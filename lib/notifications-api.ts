import { WS_BASE } from "./api-base"

export const NOTIFICATIONS_WS_URL = `${WS_BASE}/ws`

export interface AloyNotification {
  source: string
  text: string
}

export function parseNotification(data: string): AloyNotification | null {
  try {
    const o = JSON.parse(data) as unknown
    if (typeof o !== "object" || o === null) return null
    const rec = o as Record<string, unknown>
    if (rec.event !== "notification") return null
    if (typeof rec.text !== "string") return null
    return { source: typeof rec.source === "string" ? rec.source : "aloy", text: rec.text }
  } catch {
    return null
  }
}
