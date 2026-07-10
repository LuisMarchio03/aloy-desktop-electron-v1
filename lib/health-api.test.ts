import { describe, it, expect, vi, afterEach } from "vitest"
import { getHealth } from "./health-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("health-api", () => {
  it("getHealth busca /health e devolve o snapshot", async () => {
    const spy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "ok", ollama: "up", model: "llama3.2:3b" }),
    }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await getHealth()
    expect(out.status).toBe("ok")
    expect(out.ollama).toBe("up")
    expect(out.model).toBe("llama3.2:3b")
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/health`)
  })

  it("getHealth mapeia degraded/down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "degraded", ollama: "down", model: "llama3.2:3b" }),
    })) as unknown as typeof fetch)
    const out = await getHealth()
    expect(out.status).toBe("degraded")
    expect(out.ollama).toBe("down")
  })

  it("getHealth lança em status !ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503 })) as unknown as typeof fetch)
    await expect(getHealth()).rejects.toThrow()
  })
})
