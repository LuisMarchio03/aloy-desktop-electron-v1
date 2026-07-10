import { describe, it, expect, vi, afterEach } from "vitest"
import { getMemoryFacts } from "./memory-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("memory-api", () => {
  it("getMemoryFacts busca e normaliza", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ enabled: true, count: 1, facts: [{ id: 1, text: "Rex", source: "tool", created_at: 123 }] }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await getMemoryFacts()
    expect(out.enabled).toBe(true)
    expect(out.facts).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/memory/facts`)
  })
  it("getMemoryFacts com enabled:false devolve facts=[]", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ enabled: false }) })) as unknown as typeof fetch)
    const out = await getMemoryFacts()
    expect(out.enabled).toBe(false)
    expect(out.facts).toEqual([])
  })
  it("lança em !ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch)
    await expect(getMemoryFacts()).rejects.toThrow()
  })
})
