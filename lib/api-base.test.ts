import { describe, it, expect, afterEach, vi } from "vitest"
import { apiFetch, wsUrl } from "./api-base"

afterEach(() => vi.unstubAllGlobals())

function withToken(t: string | null) {
  vi.stubGlobal("window", {
    localStorage: { getItem: () => t, setItem: () => {}, removeItem: () => {} },
  })
}

describe("apiFetch", () => {
  it("injeta Bearer quando há token", async () => {
    withToken("tkn")
    const f = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", f)
    await apiFetch("http://h/api/x", { method: "POST" })
    const [, init] = f.mock.calls[0]
    expect((init.headers as Headers).get("Authorization")).toBe("Bearer tkn")
  })

  it("sem token: chamada idêntica (1 arg quando init ausente)", async () => {
    withToken(null)
    const f = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", f)
    await apiFetch("http://h/api/x")
    expect(f).toHaveBeenCalledWith("http://h/api/x")
  })

  it("preserva headers do caller (Content-Type) junto do Authorization", async () => {
    withToken("tkn")
    const f = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", f)
    await apiFetch("http://h/api/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
    const [, init] = f.mock.calls[0]
    const h = init.headers as Headers
    expect(h.get("Content-Type")).toBe("application/json")
    expect(h.get("Authorization")).toBe("Bearer tkn")
  })
})

describe("wsUrl", () => {
  it("anexa ?token quando há token; sem token não muda", () => {
    withToken("tkn"); expect(wsUrl("ws://h/ws")).toBe("ws://h/ws?token=tkn")
    withToken(null); expect(wsUrl("ws://h/ws")).toBe("ws://h/ws")
  })
})
