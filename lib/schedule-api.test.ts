import { describe, it, expect, vi, afterEach } from "vitest"
import { listSchedules, createSchedule, deleteSchedule, buildScheduleSpec } from "./schedule-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("schedule-api", () => {
  it("buildScheduleSpec monta spec por kind", () => {
    expect(buildScheduleSpec("once", { fireAt: "2026-07-02T15:00" })).toEqual({ fire_at: "2026-07-02T15:00" })
    expect(buildScheduleSpec("interval", { everyMinutes: 5 })).toEqual({ every_seconds: 300 })
    expect(buildScheduleSpec("daily", { time: "08:30", weekdays: [0, 4] })).toEqual({ time: "08:30", weekdays: [0, 4] })
    expect(buildScheduleSpec("daily", { time: "08:30" })).toEqual({ time: "08:30", weekdays: [] })
  })
  it("listSchedules normaliza", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ count: 1, schedules: [{ id: 1, text: "x", kind: "once", channel: "desktop", contextual: false, next_fire_at: 10, enabled: true }] }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await listSchedules()
    expect(out.schedules).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/schedule`)
  })
  it("createSchedule faz POST com body e devolve id", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ id: 7, next_fire_at: 99, enabled: true }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await createSchedule({ text: "t", kind: "interval", spec: { every_seconds: 60 } })
    expect(out.id).toBe(7)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/schedule`, expect.objectContaining({ method: "POST" }))
  })
  it("deleteSchedule faz DELETE e devolve ok", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    expect(await deleteSchedule(3)).toBe(true)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/schedule/3`, expect.objectContaining({ method: "DELETE" }))
  })
})
