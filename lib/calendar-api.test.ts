import { describe, it, expect, vi, afterEach } from "vitest"
import { getCalendarEvents, formatEventRange } from "./calendar-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("calendar-api", () => {
  it("getCalendarEvents monta a URL com days e normaliza a resposta", async () => {
    const spy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ configured: true, events: [{ id: "e1", summary: "Reunião", start: "2026-07-01T14:00:00-03:00", end: "2026-07-01T15:00:00-03:00" }] }),
    }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await getCalendarEvents(3)
    expect(out.configured).toBe(true)
    expect(out.events).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/calendar/events?days=3`)
  })

  it("getCalendarEvents devolve events=[] quando ausente", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ configured: false }) })) as unknown as typeof fetch)
    const out = await getCalendarEvents()
    expect(out.configured).toBe(false)
    expect(out.events).toEqual([])
  })

  it("formatEventRange trata all_day", () => {
    expect(formatEventRange("2026-07-02", "2026-07-03", true)).toBe("Dia todo")
  })
})
