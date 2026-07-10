import { describe, it, expect } from "vitest"
import { pairedUrl, tailnetWebUrl } from "./web-access-url"
import type { TailscaleStatus } from "./vpn-types"

describe("pairedUrl", () => {
  it("anexa ?token= inserindo a barra quando falta", () => {
    expect(pairedUrl("http://x:3000", "t")).toBe("http://x:3000/?token=t")
  })
  it("não duplica a barra quando a base já termina em /", () => {
    expect(pairedUrl("http://x:3000/", "t")).toBe("http://x:3000/?token=t")
  })
  it("sem token retorna a base inalterada", () => {
    expect(pairedUrl("http://x:3000", null)).toBe("http://x:3000")
  })
  it("encoda caractere especial do token", () => {
    expect(pairedUrl("http://x:3000", "a b/c")).toBe("http://x:3000/?token=a%20b%2Fc")
  })
})

function status(over: Partial<TailscaleStatus> = {}): TailscaleStatus {
  return {
    available: true,
    backend_state: "Running",
    tailnet: "t",
    magic_dns_suffix: "s",
    self: {
      id: "1",
      hostname: "pc",
      dns_name: "pc",
      os: "linux",
      online: true,
      ips: ["100.64.0.2", "fd7a::2"],
      exit_node: false,
      exit_node_option: false,
      rx_bytes: 0,
      tx_bytes: 0,
      last_seen: null,
    },
    peers: [],
    ...over,
  }
}

describe("tailnetWebUrl", () => {
  it("compõe a URL do 100.x com token", () => {
    expect(tailnetWebUrl(status(), "t")).toBe("http://100.64.0.2:3000/?token=t")
  })
  it("null quando não está Running / não disponível", () => {
    expect(tailnetWebUrl(status({ backend_state: "Stopped" }), "t")).toBeNull()
    expect(tailnetWebUrl(status({ available: false }), "t")).toBeNull()
  })
  it("null quando não há IPv4 100.x", () => {
    const s = status()
    s.self!.ips = ["fd7a::2"]
    expect(tailnetWebUrl(s, "t")).toBeNull()
  })
  it("null quando status é null", () => {
    expect(tailnetWebUrl(null, "t")).toBeNull()
  })
})
