import { describe, it, expect, vi, afterEach } from "vitest"
import { getDiscordStatus } from "./discord-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("discord-api", () => {
  it("getDiscordStatus busca o endpoint e devolve o snapshot", async () => {
    const spy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ configured: true, connected: true, turns_today: 5, channels: [], recent: [] }),
    }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const out = await getDiscordStatus()
    expect(out.connected).toBe(true)
    expect(out.turns_today).toBe(5)
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/api/discord/status`)
  })

  it("getDiscordStatus lança em status !ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch)
    await expect(getDiscordStatus()).rejects.toThrow()
  })
})
