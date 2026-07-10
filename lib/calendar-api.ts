import { API_BASE, apiFetch } from "./api-base"
import type { CalendarData, CalendarEvent } from "./calendar-types"

export async function getCalendarEvents(days = 7): Promise<CalendarData> {
  const r = await apiFetch(`${API_BASE}/api/calendar/events?days=${days}`)
  if (!r.ok) throw new Error(`calendar events falhou: ${r.status}`)
  const d = await r.json()
  return {
    configured: Boolean(d.configured),
    events: (d.events ?? []) as CalendarEvent[],
  }
}

export function formatEventRange(start: string, end: string, allDay?: boolean): string {
  if (allDay) return "Dia todo"
  const fmt = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }
  return `${fmt(start)} — ${fmt(end)}`
}
