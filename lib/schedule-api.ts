import { API_BASE, apiFetch } from "./api-base"
import type { Schedule, ScheduleBody, ScheduleData, ScheduleKind } from "./schedule-types"

const JSON_HEADERS = { "Content-Type": "application/json" }

export async function listSchedules(): Promise<ScheduleData> {
  const r = await apiFetch(`${API_BASE}/api/schedule`)
  if (!r.ok) throw new Error(`list schedule falhou: ${r.status}`)
  const d = await r.json()
  return { count: d.count ?? 0, schedules: (d.schedules ?? []) as Schedule[] }
}

export async function createSchedule(body: ScheduleBody): Promise<{ id: number; next_fire_at: number | null; enabled: boolean }> {
  const r = await apiFetch(`${API_BASE}/api/schedule`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`create schedule falhou: ${r.status}`)
  return (await r.json()) as { id: number; next_fire_at: number | null; enabled: boolean }
}

export async function deleteSchedule(id: number): Promise<boolean> {
  const r = await apiFetch(`${API_BASE}/api/schedule/${id}`, { method: "DELETE" })
  if (!r.ok) throw new Error(`delete schedule falhou: ${r.status}`)
  const d = await r.json()
  return Boolean(d.ok)
}

export function buildScheduleSpec(
  kind: ScheduleKind,
  fields: { fireAt?: string; everyMinutes?: number; time?: string; weekdays?: number[] },
): Record<string, unknown> {
  if (kind === "once") return { fire_at: fields.fireAt ?? "" }
  if (kind === "interval") return { every_seconds: Math.max(1, Math.round((fields.everyMinutes ?? 0) * 60)) }
  return { time: fields.time ?? "", weekdays: fields.weekdays ?? [] }
}
