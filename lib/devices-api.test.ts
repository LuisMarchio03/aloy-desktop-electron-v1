import { describe, it, expect, afterEach, vi } from "vitest"
import { listDevices, createDevice, deleteDevice } from "./devices-api"

afterEach(() => vi.restoreAllMocks())

describe("devices-api", () => {
  it("lista devices", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ devices: [{ id: "a" }] }) })
    vi.stubGlobal("fetch", f)
    expect((await listDevices())[0].id).toBe("a")
    expect(f).toHaveBeenCalledWith(expect.stringContaining("/api/devices"))
  })
  it("cria (POST) e devolve {id,token}", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "x", token: "t" }) })
    vi.stubGlobal("fetch", f)
    const d = await createDevice("Fone")
    expect(d).toEqual({ id: "x", token: "t" })
    const [, init] = f.mock.calls[0]
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body)).toEqual({ name: "Fone" })
  })
  it("delete manda DELETE", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", f)
    await deleteDevice("x")
    const [url, init] = f.mock.calls[0]
    expect(url).toContain("/api/devices/x")
    expect(init.method).toBe("DELETE")
  })
})
