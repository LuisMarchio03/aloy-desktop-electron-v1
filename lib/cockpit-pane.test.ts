import { describe, it, expect } from "vitest"
import { cockpitPane } from "./cockpit-pane"

describe("cockpitPane", () => {
  it("desktop é sempre split, com ou sem seleção", () => {
    expect(cockpitPane({ isMobile: false, selectedId: null })).toBe("split")
    expect(cockpitPane({ isMobile: false, selectedId: "s1" })).toBe("split")
  })
  it("mobile sem seleção mostra a lista", () => {
    expect(cockpitPane({ isMobile: true, selectedId: null })).toBe("list")
  })
  it("mobile com seleção mostra o detalhe", () => {
    expect(cockpitPane({ isMobile: true, selectedId: "s1" })).toBe("detail")
  })
})
