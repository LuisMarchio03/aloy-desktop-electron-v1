import { describe, it, expect, vi, afterEach } from "vitest"
import { getWireguardStatus, wireguardUp } from "./wireguard-api"

afterEach(() => vi.restoreAllMocks())

describe("wireguard-api", () => {
  it("busca status na rota certa", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ available: true, interfaces: [] }) })
    vi.stubGlobal("fetch", fetchMock)
    const s = await getWireguardStatus()
    expect(s.available).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/vpn/wireguard/status"))
  })

  it("up manda POST com {name}", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true, message: "up" }) })
    vi.stubGlobal("fetch", fetchMock)
    await wireguardUp("wg0")
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain("/api/vpn/wireguard/up")
    expect(opts.method).toBe("POST")
    expect(JSON.parse(opts.body)).toEqual({ name: "wg0" })
  })

  it("lança em resposta não-ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(getWireguardStatus()).rejects.toThrow("500")
  })
})
