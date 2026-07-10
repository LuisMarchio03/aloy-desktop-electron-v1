import { describe, it, expect } from "vitest"
import { resolveBackendHost } from "./api-host"

describe("resolveBackendHost", () => {
  it("mantém um host de LAN", () => expect(resolveBackendHost("192.168.0.10")).toBe("192.168.0.10"))
  it("mantém localhost", () => expect(resolveBackendHost("localhost")).toBe("localhost"))
  it("vazio → localhost", () => expect(resolveBackendHost("")).toBe("localhost"))
  it("'-' (app://-) → localhost", () => expect(resolveBackendHost("-")).toBe("localhost"))
  it("undefined → localhost", () => expect(resolveBackendHost(undefined)).toBe("localhost"))
})
