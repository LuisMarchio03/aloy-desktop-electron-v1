import { describe, it, expect, vi, afterEach } from "vitest"
import {
  getTailscaleStatus,
  tailscaleUp,
  tailscaleDown,
  getTailnetDevices,
  setExitNode,
  clearExitNode,
  VPN_HTTP_BASE,
} from "./vpn-api"

afterEach(() => vi.restoreAllMocks())

describe("vpn-api", () => {
  it("getTailscaleStatus busca o status do tailscale", async () => {
    let url = ""
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      url = u
      return { ok: true, json: async () => ({ available: true, backend_state: "Running", peers: [] }) }
    }) as unknown as typeof fetch)
    const s = await getTailscaleStatus()
    expect(url).toBe(`${VPN_HTTP_BASE}/api/vpn/tailscale/status`)
    expect(s.backend_state).toBe("Running")
  })

  it("tailscaleUp e tailscaleDown fazem POST nas rotas certas", async () => {
    const calls: Array<[string, string]> = []
    vi.stubGlobal("fetch", vi.fn(async (u: string, init: RequestInit) => {
      calls.push([u, init.method as string])
      return { ok: true, json: async () => ({ ok: true, message: "x" }) }
    }) as unknown as typeof fetch)
    await tailscaleUp()
    await tailscaleDown()
    expect(calls[0]).toEqual([`${VPN_HTTP_BASE}/api/vpn/tailscale/up`, "POST"])
    expect(calls[1]).toEqual([`${VPN_HTTP_BASE}/api/vpn/tailscale/down`, "POST"])
  })

  it("getTailnetDevices busca o inventário do tailnet", async () => {
    let url = ""
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      url = u
      return { ok: true, json: async () => ({ available: true, devices: [{ hostname: "pc", online: true }] }) }
    }) as unknown as typeof fetch)
    const d = await getTailnetDevices()
    expect(url).toBe(`${VPN_HTTP_BASE}/api/vpn/tailscale/devices`)
    expect(d.available).toBe(true)
    expect(d.devices[0].hostname).toBe("pc")
  })

  it("setExitNode e clearExitNode fazem POST com o body certo", async () => {
    const calls: Array<[string, string, string]> = []
    vi.stubGlobal("fetch", vi.fn(async (u: string, init: RequestInit) => {
      calls.push([u, init.method as string, init.body as string])
      return { ok: true, json: async () => ({ ok: true, message: "x" }) }
    }) as unknown as typeof fetch)
    await setExitNode("100.64.0.2")
    await clearExitNode()
    expect(calls[0]).toEqual([
      `${VPN_HTTP_BASE}/api/vpn/tailscale/exit-node`, "POST", JSON.stringify({ node: "100.64.0.2" }),
    ])
    expect(calls[1][2]).toBe(JSON.stringify({ node: "" }))
  })
})
