import { describe, it, expect, afterEach } from "vitest"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { createWebServer } from "./web-server.js"

let cleanup: Array<() => void> = []
afterEach(() => { cleanup.forEach((f) => f()); cleanup = [] })

function fakeOut() {
  const dir = mkdtempSync(path.join(tmpdir(), "aloy-out-"))
  mkdirSync(path.join(dir, "_next"), { recursive: true })
  writeFileSync(path.join(dir, "index.html"), "<html>ALOY</html>")
  writeFileSync(path.join(dir, "_next", "app.js"), "console.log(1)")
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

describe("web-server", () => {
  it("serve index, asset e fallback SPA; status reflete running", async () => {
    const srv = createWebServer({ root: fakeOut(), host: "127.0.0.1", port: 0 })
    const st = await srv.start()
    cleanup.push(() => void srv.stop())
    expect(st.running).toBe(true)
    const base = st.url!
    expect((await (await fetch(`${base}/`)).text())).toContain("ALOY")
    const asset = await fetch(`${base}/_next/app.js`)
    expect(asset.headers.get("content-type")).toBe("text/javascript")
    const spa = await fetch(`${base}/sessions`)
    expect(await spa.text()).toContain("ALOY")
    const missing = await fetch(`${base}/_next/nope.js`)
    expect(missing.status).toBe(404)
    expect(srv.status().running).toBe(true)
    await srv.stop()
    expect(srv.status().running).toBe(false)
  })

  it("start com root inexistente responde 503, não derruba", async () => {
    const srv = createWebServer({ root: "/definitely/not/here", host: "127.0.0.1", port: 0 })
    const st = await srv.start()
    cleanup.push(() => void srv.stop())
    const r = await fetch(`${st.url}/`)
    expect(r.status).toBe(503)
  })

  it("rota que colide com diretório cai no index.html (não EISDIR/404)", async () => {
    const srv = createWebServer({ root: fakeOut(), host: "127.0.0.1", port: 0 })
    const st = await srv.start()
    cleanup.push(() => void srv.stop())
    // "_next" existe como DIRETÓRIO no fakeOut() — sem extensão → fallback SPA
    const r = await fetch(`${st.url}/_next`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toBe("text/html")
    expect(await r.text()).toContain("ALOY")
  })
})
