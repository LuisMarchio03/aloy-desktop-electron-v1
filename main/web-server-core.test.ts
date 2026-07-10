import { describe, it, expect } from "vitest"
import { resolveStaticFile, contentTypeFor } from "./web-server-core.js"

const ROOT = "/app/out"

describe("web-server-core", () => {
  it("contentTypeFor cobre os tipos do export e cai em octet-stream", () => {
    expect(contentTypeFor("/x/app.js")).toBe("text/javascript")
    expect(contentTypeFor("/x/a.css")).toBe("text/css")
    expect(contentTypeFor("/x/i.svg")).toBe("image/svg+xml")
    expect(contentTypeFor("/x/f.woff2")).toBe("font/woff2")
    expect(contentTypeFor("/x/page.html")).toBe("text/html")
    expect(contentTypeFor("/x/bin.xyz")).toBe("application/octet-stream")
  })

  it("serve arquivo existente dentro do root com content-type certo", () => {
    const r = resolveStaticFile(ROOT, "/_next/static/app.js?v=2", () => true)
    expect(r).toEqual({ filePath: "/app/out/_next/static/app.js", contentType: "text/javascript" })
  })

  it("rota sem extensão inexistente cai no index.html (fallback SPA)", () => {
    const r = resolveStaticFile(ROOT, "/sessions", () => false)
    expect(r).toEqual({ indexFallback: true, filePath: "/app/out/index.html", contentType: "text/html" })
  })

  it("arquivo com extensão inexistente é notFound", () => {
    const r = resolveStaticFile(ROOT, "/_next/missing.js", () => false)
    expect(r).toEqual({ notFound: true })
  })

  it("path traversal é bloqueado mesmo se exists disser true", () => {
    const r = resolveStaticFile(ROOT, "/../../etc/passwd", () => true)
    expect(r).toEqual({ notFound: true })
  })

  it("raiz '/' resolve index.html", () => {
    const r = resolveStaticFile(ROOT, "/", () => true)
    expect(r).toEqual({ filePath: "/app/out/index.html", contentType: "text/html" })
  })

  it("percent-encoding malformado vira notFound (never-crash)", () => {
    expect(resolveStaticFile(ROOT, "/%", () => true)).toEqual({ notFound: true })
    expect(resolveStaticFile(ROOT, "/%zz", () => true)).toEqual({ notFound: true })
  })
})
