import { describe, it, expect, vi, afterEach } from "vitest"
import {
  addServer,
  createSession,
  listServers,
  listSessions,
  SESSIONS_HTTP_BASE,
  testServer,
} from "./sessions-api"

afterEach(() => vi.restoreAllMocks())

describe("sessions-api", () => {
  it("listSessions retorna o array de sessions", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ sessions: [{ id: "s1" }] }),
    })) as unknown as typeof fetch)
    const out = await listSessions()
    expect(out).toEqual([{ id: "s1" }])
  })

  it("createSession faz POST e devolve o id", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ id: "abc" }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const id = await createSession({ task: "t", cwd: "/p", model: null })
    expect(id).toBe("abc")
    expect(spy).toHaveBeenCalledWith(
      `${SESSIONS_HTTP_BASE}/api/sessions`,
      expect.objectContaining({ method: "POST" }),
    )
  })

  it("listSessions lança em status !ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503 })) as unknown as typeof fetch)
    await expect(listSessions()).rejects.toThrow()
  })

  it("createSession envia server no body", async () => {
    let sentBody: { server?: string } = {}
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      sentBody = JSON.parse(init.body as string)
      return { ok: true, json: async () => ({ id: "s1" }) }
    }) as unknown as typeof fetch)
    await createSession({ task: "t", cwd: "/x", platform: "opencode", server: "casa" })
    expect(sentBody.server).toBe("casa")
  })

  it("listServers parseia a resposta", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        servers: [{ id: "local", name: "local", url: "http://x", kind: "opencode", source: "builtin", editable: false, online: true, version: "1.4.7" }],
      }),
    })) as unknown as typeof fetch)
    const servers = await listServers()
    expect(servers[0].id).toBe("local")
    expect(servers[0].online).toBe(true)
    expect(servers[0].editable).toBe(false)
  })

  it("addServer faz POST e devolve o id", async () => {
    let body: { name?: string } = {}
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      body = JSON.parse(init.body as string)
      return { ok: true, json: async () => ({ id: "pc-b" }) }
    }) as unknown as typeof fetch)
    const id = await addServer({ name: "PC B", url: "http://x", kind: "aloy", token: "t" })
    expect(id).toBe("pc-b")
    expect(body.name).toBe("PC B")
  })

  it("testServer devolve a saúde", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ online: true, version: "1.4.7" }),
    })) as unknown as typeof fetch)
    const h = await testServer("pc-b")
    expect(h.online).toBe(true)
  })
})
